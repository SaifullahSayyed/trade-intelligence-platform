# Trade Intelligence Platform — Multi-Tenant Upgrade Path

This document outlines the transition path from the Day 1–8 single-tenant evaluation demo to a full multi-tenant production environment, satisfying Q8.

---

## 1. Current State (Evaluation Demo)
* Single active tenant: `demo-tenant` (`tenant_id: 00000000-0000-0000-0000-000000000001`).
* Schema isolation in PostgreSQL is prepared with `tenants` and `users` tables.
* `backend/auth/authorization_service.py` is the central gateway enforcing tenant context across all datastores.

---

## 2. Upgrade Steps for Multi-Tenant Production

### Layer 1: PostgreSQL (Transactional)
* Maintain shared schema with tenant discriminator column (`tenant_id`) on any tenant-specific tables (searches, saved entities, review decisions, audit logs).
* For enterprise tier clients requiring strict data separation, enable PostgreSQL Row-Level Security (RLS) policies based on `current_setting('app.current_tenant_id')` as an additional defense-in-depth layer on top of the Authorization Service.

### Layer 2: ClickHouse (Analytical)
* For shared cluster multi-tenancy:
  * Add `tenant_id LowCardinality(UUID)` to all Silver and Gold analytical tables.
  * Update `AuthorizationService.apply_clickhouse_tenant_filter()` to enforce `tenant_id = '<uuid>'` on all queries.
* For Enterprise tier: ClickHouse database-per-tenant pattern (`trade_intelligence_<tenant_slug>`).

### Layer 3: OpenSearch (Search)
* Maintain `tenant_id` term in document index mapping.
* All queries go through `AuthorizationService.apply_opensearch_filter()` which injects `{"term": {"tenant_id": "<uuid>"}}`.
* Use OpenSearch Document-Level Security (DLS) via OpenSearch Security Plugin for cluster-enforced isolation.

### Layer 4: Object Storage (MinIO / Cloudflare R2)
* Segment S3 keys by tenant prefix: `s3://ti-data/<tenant_id>/bronze/...`.
* Issue temporary STS / scoped credentials per tenant session when direct client export or signed URLs are requested.
