-- ============================================================
-- 003_audit_log.sql
-- Security & Access Audit Logging (PostgreSQL)
-- ============================================================

CREATE TABLE IF NOT EXISTS audit_log (
    log_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id       UUID REFERENCES tenants(tenant_id) ON DELETE SET NULL,
    actor_id        UUID,                       -- user_id or system worker ID
    actor_type      TEXT NOT NULL DEFAULT 'USER' CHECK (actor_type IN ('USER', 'SYSTEM_SERVICE', 'API_KEY')),
    action          TEXT NOT NULL,              -- e.g. 'SEARCH_QUERY', 'VIEW_ENTITY', 'EXPORT_DATA', 'HUMAN_REVIEW', 'AI_EXPLANATION_REQUEST'
    resource_type   TEXT,                       -- e.g. 'shipment', 'canonical_entity', 'export_file'
    resource_id     TEXT,                       -- identifier of target object
    payload         JSONB DEFAULT '{}'::jsonb,  -- context, query filters, search parameters
    status          TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'DENIED', 'ERROR')),
    error_message   TEXT,
    ip_address      INET,
    user_agent      TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_log_tenant_date ON audit_log(tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
