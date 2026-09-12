-- ============================================================
-- 002_auth_schema.sql
-- Identity, Tenancy & Authorization Scaffold
-- ============================================================

-- Keycloak realm schema initialization if needed
CREATE SCHEMA IF NOT EXISTS keycloak;

-- Tenancy / Organizations
CREATE TABLE IF NOT EXISTS tenants (
    tenant_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_slug        TEXT UNIQUE NOT NULL,
    display_name       TEXT NOT NULL,
    plan_tier          TEXT NOT NULL DEFAULT 'EVALUATION', -- 'EVALUATION', 'PRO', 'ENTERPRISE'
    is_active          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed default demo tenant (Single-tenant demo with upgrade path)
INSERT INTO tenants (tenant_id, tenant_slug, display_name, plan_tier, is_active)
VALUES ('00000000-0000-0000-0000-000000000001', 'demo-tenant', 'Demo Workspace', 'EVALUATION', TRUE)
ON CONFLICT (tenant_slug) DO NOTHING;

-- User accounts (mapped from Keycloak sub claim)
CREATE TABLE IF NOT EXISTS users (
    user_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_sub     TEXT UNIQUE NOT NULL,      -- OpenID Connect Subject identifier
    tenant_id        UUID NOT NULL REFERENCES tenants(tenant_id) ON DELETE RESTRICT,
    email            TEXT UNIQUE NOT NULL,
    full_name        TEXT,
    role             TEXT NOT NULL DEFAULT 'ANALYST' CHECK (role IN ('ADMIN', 'ANALYST', 'REVIEWER', 'READONLY')),
    is_active        BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_at    TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
CREATE INDEX IF NOT EXISTS idx_users_kc_sub ON users(keycloak_sub);

-- Permissions mapping
CREATE TABLE IF NOT EXISTS permissions (
    permission_id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role            TEXT NOT NULL,
    resource        TEXT NOT NULL,              -- e.g. 'shipment', 'entity', 'export', 'review_queue'
    action          TEXT NOT NULL,              -- e.g. 'read', 'write', 'export', 'review'
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_role_resource_action UNIQUE (role, resource, action)
);

-- Seed baseline role permissions
INSERT INTO permissions (role, resource, action) VALUES
    ('ADMIN', '*', '*'),
    ('ANALYST', 'shipment', 'read'),
    ('ANALYST', 'entity', 'read'),
    ('ANALYST', 'export', 'execute'),
    ('ANALYST', 'ai_explanation', 'read'),
    ('REVIEWER', 'review_queue', 'read'),
    ('REVIEWER', 'review_queue', 'write'),
    ('REVIEWER', 'entity', 'read'),
    ('READONLY', 'shipment', 'read'),
    ('READONLY', 'entity', 'read')
ON CONFLICT DO NOTHING;
