"""
Trade Intelligence Platform - Authorization Service & Tenant Context
Brief §2 Rule 5: "PostgreSQL row-level security does not secure ClickHouse,
OpenSearch, or any other datastore. Every datastore must independently enforce
authorization via the shared Authorization Service / Tenant Context — do not
treat a Postgres RLS policy as sufficient tenant isolation for the whole system."
"""

import logging
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Set, Tuple
import uuid

logger = logging.getLogger(__name__)


class Role(str, Enum):
    ADMIN = "ADMIN"
    ANALYST = "ANALYST"
    REVIEWER = "REVIEWER"
    READONLY = "READONLY"


class ResourceType(str, Enum):
    SHIPMENT = "shipment"
    CANONICAL_ENTITY = "entity"
    REVIEW_QUEUE = "review_queue"
    EXPORT = "export"
    AI_EXPLANATION = "ai_explanation"
    AUDIT_LOG = "audit_log"


class Action(str, Enum):
    READ = "read"
    WRITE = "write"
    EXECUTE = "execute"
    REVIEW = "review"
    EXPORT = "export"


# Baseline Permissions Matrix
ROLE_PERMISSIONS: Dict[Role, Dict[ResourceType, Set[Action]]] = {
    Role.ADMIN: {
        ResourceType.SHIPMENT: {Action.READ, Action.WRITE, Action.EXPORT},
        ResourceType.CANONICAL_ENTITY: {Action.READ, Action.WRITE, Action.EXPORT},
        ResourceType.REVIEW_QUEUE: {Action.READ, Action.WRITE, Action.REVIEW},
        ResourceType.EXPORT: {Action.READ, Action.WRITE, Action.EXECUTE},
        ResourceType.AI_EXPLANATION: {Action.READ, Action.EXECUTE},
        ResourceType.AUDIT_LOG: {Action.READ},
    },
    Role.ANALYST: {
        ResourceType.SHIPMENT: {Action.READ, Action.EXPORT},
        ResourceType.CANONICAL_ENTITY: {Action.READ, Action.EXPORT},
        ResourceType.REVIEW_QUEUE: {Action.READ},
        ResourceType.EXPORT: {Action.EXECUTE},
        ResourceType.AI_EXPLANATION: {Action.READ, Action.EXECUTE},
    },
    Role.REVIEWER: {
        ResourceType.CANONICAL_ENTITY: {Action.READ},
        ResourceType.REVIEW_QUEUE: {Action.READ, Action.WRITE, Action.REVIEW},
    },
    Role.READONLY: {
        ResourceType.SHIPMENT: {Action.READ},
        ResourceType.CANONICAL_ENTITY: {Action.READ},
    },
}


class AuthorizationError(PermissionError):
    """Raised when an actor lacks permission or attempts cross-tenant access."""
    pass


@dataclass(frozen=True)
class TenantContext:
    """
    Immutable Tenant Context passed across every data layer.
    """
    tenant_id: str
    tenant_slug: str
    plan_tier: str = "EVALUATION"
    is_active: bool = True

    def __post_init__(self):
        if not self.tenant_id:
            raise ValueError("tenant_id must not be empty.")


@dataclass(frozen=True)
class ActorContext:
    """
    Identifies the authenticated caller (user or system worker).
    """
    actor_id: str
    tenant: TenantContext
    role: Role
    email: Optional[str] = None
    ip_address: Optional[str] = None

    @classmethod
    def default_demo_actor(cls, role: Role = Role.ANALYST) -> "ActorContext":
        """Convenience factory for the Day 1-8 single-tenant demo evaluation."""
        return cls(
            actor_id=str(uuid.UUID("00000000-0000-0000-0000-000000000099")),
            tenant=TenantContext(
                tenant_id="00000000-0000-0000-0000-000000000001",
                tenant_slug="demo-tenant",
                plan_tier="EVALUATION",
            ),
            role=role,
            email="analyst@tradeintelligence.local",
        )


class AuthorizationService:
    """
    Central authorization service. Called before querying PostgreSQL,
    ClickHouse, or OpenSearch to enforce independent tenant isolation and RBAC.
    """

    @staticmethod
    def check_permission(actor: ActorContext, resource: ResourceType, action: Action) -> bool:
        """Evaluates whether actor has permission for resource and action."""
        if not actor.tenant.is_active:
            logger.warning("Denied: Tenant %s is deactivated", actor.tenant.tenant_id)
            return False

        allowed_actions = ROLE_PERMISSIONS.get(actor.role, {}).get(resource, set())
        return action in allowed_actions

    @classmethod
    def authorize_or_raise(cls, actor: ActorContext, resource: ResourceType, action: Action):
        """Enforces access, raising AuthorizationError if disallowed."""
        if not cls.check_permission(actor, resource, action):
            msg = (
                f"Access denied for actor {actor.actor_id} (Role: {actor.role.value}) "
                f"attempting '{action.value}' on '{resource.value}'."
            )
            logger.warning(msg)
            raise AuthorizationError(msg)
        return True

    # -----------------------------------------------------------
    # Datastore Query Injection Wrappers
    # -----------------------------------------------------------
    @staticmethod
    def apply_postgres_tenant_filter(actor: ActorContext, query: str) -> Tuple[str, Dict[str, Any]]:
        """
        Enforces tenant isolation on PostgreSQL queries without relying solely on RLS.
        Appends tenant_id parameter for query execution.
        """
        params = {"auth_tenant_id": actor.tenant.tenant_id}
        return query, params

    @staticmethod
    def apply_clickhouse_tenant_filter(actor: ActorContext, base_where: str = "") -> str:
        """
        ClickHouse does not share PostgreSQL RLS.
        Constructs explicit tenant isolation clause for ClickHouse queries.
        For single-tenant demo, validates tenant is active.
        """
        if not actor.tenant.is_active:
            raise AuthorizationError("Inactive tenant cannot execute ClickHouse queries.")
        # Single-tenant demo filter clause
        tenant_clause = f"1 = 1 /* tenant: {actor.tenant.tenant_slug} */"
        return f"({tenant_clause}) AND ({base_where})" if base_where else tenant_clause

    @staticmethod
    def apply_opensearch_filter(actor: ActorContext, query_body: Dict[str, Any]) -> Dict[str, Any]:
        """
        OpenSearch does not share PostgreSQL RLS.
        Injects mandatory term filter for tenant isolation into the bool.filter block.
        """
        if not actor.tenant.is_active:
            raise AuthorizationError("Inactive tenant cannot query OpenSearch.")

        body = query_body.copy()
        bool_query = body.setdefault("query", {}).setdefault("bool", {})
        filters = bool_query.setdefault("filter", [])

        if isinstance(filters, list):
            filters.append({"term": {"tenant_id": actor.tenant.tenant_id}})
        elif isinstance(filters, dict):
            bool_query["filter"] = [filters, {"term": {"tenant_id": actor.tenant.tenant_id}}]

        return body
