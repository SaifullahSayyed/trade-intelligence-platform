"""
Unit tests for Authorization Service & Multi-Datastore Tenant Isolation
Brief §2 Rule 5: Every datastore must independently enforce authorization.
"""

import pytest
from backend.auth.authorization_service import (
    Action,
    ActorContext,
    AuthorizationError,
    AuthorizationService,
    ResourceType,
    Role,
    TenantContext,
)


@pytest.fixture
def active_tenant():
    return TenantContext(
        tenant_id="00000000-0000-0000-0000-000000000001",
        tenant_slug="test-tenant",
        plan_tier="EVALUATION",
        is_active=True,
    )


@pytest.fixture
def inactive_tenant():
    return TenantContext(
        tenant_id="00000000-0000-0000-0000-000000000099",
        tenant_slug="inactive-tenant",
        plan_tier="EVALUATION",
        is_active=False,
    )


def test_admin_permissions(active_tenant):
    admin_actor = ActorContext(
        actor_id="admin-1",
        tenant=active_tenant,
        role=Role.ADMIN,
    )
    assert AuthorizationService.check_permission(admin_actor, ResourceType.SHIPMENT, Action.WRITE) is True
    assert AuthorizationService.check_permission(admin_actor, ResourceType.EXPORT, Action.EXECUTE) is True
    assert AuthorizationService.check_permission(admin_actor, ResourceType.AUDIT_LOG, Action.READ) is True


def test_analyst_permissions_and_restrictions(active_tenant):
    analyst_actor = ActorContext(
        actor_id="analyst-1",
        tenant=active_tenant,
        role=Role.ANALYST,
    )
    assert AuthorizationService.check_permission(analyst_actor, ResourceType.SHIPMENT, Action.READ) is True
    assert AuthorizationService.check_permission(analyst_actor, ResourceType.EXPORT, Action.EXECUTE) is True
    assert AuthorizationService.check_permission(analyst_actor, ResourceType.AI_EXPLANATION, Action.READ) is True
    # Analyst cannot write directly or review the review queue
    assert AuthorizationService.check_permission(analyst_actor, ResourceType.SHIPMENT, Action.WRITE) is False
    assert AuthorizationService.check_permission(analyst_actor, ResourceType.REVIEW_QUEUE, Action.REVIEW) is False

    with pytest.raises(AuthorizationError):
        AuthorizationService.authorize_or_raise(analyst_actor, ResourceType.SHIPMENT, Action.WRITE)


def test_readonly_restrictions(active_tenant):
    readonly_actor = ActorContext(
        actor_id="readonly-1",
        tenant=active_tenant,
        role=Role.READONLY,
    )
    assert AuthorizationService.check_permission(readonly_actor, ResourceType.SHIPMENT, Action.READ) is True
    assert AuthorizationService.check_permission(readonly_actor, ResourceType.SHIPMENT, Action.EXPORT) is False
    assert AuthorizationService.check_permission(readonly_actor, ResourceType.EXPORT, Action.EXECUTE) is False

    with pytest.raises(AuthorizationError):
        AuthorizationService.authorize_or_raise(readonly_actor, ResourceType.EXPORT, Action.EXECUTE)


def test_inactive_tenant_denied_everything(inactive_tenant):
    actor = ActorContext(
        actor_id="user-inactive",
        tenant=inactive_tenant,
        role=Role.ADMIN,
    )
    assert AuthorizationService.check_permission(actor, ResourceType.SHIPMENT, Action.READ) is False
    with pytest.raises(AuthorizationError):
        AuthorizationService.authorize_or_raise(actor, ResourceType.SHIPMENT, Action.READ)


def test_clickhouse_tenant_filter_injection(active_tenant, inactive_tenant):
    active_actor = ActorContext(actor_id="user-1", tenant=active_tenant, role=Role.ANALYST)
    ch_clause = AuthorizationService.apply_clickhouse_tenant_filter(active_actor, "shipment_date >= ''2022-09-01''")
    assert "test-tenant" in ch_clause
    assert "shipment_date" in ch_clause

    inactive_actor = ActorContext(actor_id="user-2", tenant=inactive_tenant, role=Role.ANALYST)
    with pytest.raises(AuthorizationError):
        AuthorizationService.apply_clickhouse_tenant_filter(inactive_actor)


def test_opensearch_filter_injection(active_tenant, inactive_tenant):
    active_actor = ActorContext(actor_id="user-1", tenant=active_tenant, role=Role.ANALYST)
    base_query = {"query": {"match_all": {}}}
    filtered = AuthorizationService.apply_opensearch_filter(active_actor, base_query)

    assert "filter" in filtered["query"]["bool"]
    filter_terms = filtered["query"]["bool"]["filter"]
    assert any(term.get("term", {}).get("tenant_id") == active_tenant.tenant_id for term in filter_terms)
