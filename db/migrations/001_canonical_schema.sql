-- ============================================================
-- 001_canonical_schema.sql
-- Trade Intelligence Canonical Schema (PostgreSQL)
-- ============================================================

-- Ensure pgcrypto or uuid-ossp for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROVENANCE (Brief §3 — Every ingested record carries these)
-- ============================================================
CREATE TABLE IF NOT EXISTS provenance_records (
    provenance_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_file           TEXT NOT NULL,
    source_id             TEXT NOT NULL,          -- e.g. 'trademo_bol_v1', 'oec_botmarket_v1'
    acquisition_timestamp TIMESTAMPTZ NOT NULL,
    jurisdiction          TEXT NOT NULL DEFAULT 'US',
    license_reference     TEXT NOT NULL,
    checksum              TEXT NOT NULL,          -- SHA-256 hash of raw source artifact
    source_version        TEXT NOT NULL,
    parser_version        TEXT NOT NULL,
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provenance_checksum ON provenance_records(checksum);
CREATE INDEX IF NOT EXISTS idx_provenance_source_id ON provenance_records(source_id);

-- ============================================================
-- 2. CANONICAL ENTITIES (Resolved companies / traders)
-- ============================================================
CREATE TABLE IF NOT EXISTS canonical_entities (
    entity_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type      TEXT NOT NULL DEFAULT 'COMPANY' CHECK (entity_type IN ('COMPANY', 'INDIVIDUAL', 'UNKNOWN')),
    canonical_name   TEXT NOT NULL,
    confidence_tier  TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (confidence_tier IN ('HIGH', 'MEDIUM', 'LOW')),
    country_code     TEXT,
    metadata         JSONB DEFAULT '{}'::jsonb,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_canonical_entities_name ON canonical_entities(canonical_name);
CREATE INDEX IF NOT EXISTS idx_canonical_entities_tier ON canonical_entities(confidence_tier);

-- ============================================================
-- 3. SHIPMENTS (Brief §5 — Canonical Data Schema)
-- ============================================================
CREATE TABLE IF NOT EXISTS shipments (
    shipment_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id                TEXT NOT NULL,
    source_record_id         TEXT NOT NULL,

    -- Three timestamps stored separately (Brief §8 — Never blended into single 'last updated')
    ingestion_timestamp      TIMESTAMPTZ NOT NULL,
    source_timestamp         TIMESTAMPTZ,
    normalization_timestamp  TIMESTAMPTZ,
    shipment_date            DATE NOT NULL,

    importer_entity_id       UUID REFERENCES canonical_entities(entity_id) ON DELETE SET NULL,
    exporter_entity_id       UUID REFERENCES canonical_entities(entity_id) ON DELETE SET NULL,
    notify_party_entity_id   UUID REFERENCES canonical_entities(entity_id) ON DELETE SET NULL,

    product_id               UUID,
    hs_code                  TEXT,
    hs_version               TEXT DEFAULT 'HS2022',

    origin_country           TEXT,
    destination_country      TEXT DEFAULT 'US',
    origin_port              TEXT,
    destination_port         TEXT,

    quantity                 NUMERIC(18, 4),
    quantity_unit            TEXT,
    weight                   NUMERIC(18, 4),
    weight_unit              TEXT DEFAULT 'KG',

    declared_value           NUMERIC(18, 2),
    currency                 TEXT DEFAULT 'USD',

    vessel                   TEXT,
    bill_of_lading           TEXT NOT NULL,

    source_confidence        TEXT CHECK (source_confidence IN ('HIGH', 'MEDIUM', 'LOW')),
    provenance_id            UUID NOT NULL REFERENCES provenance_records(provenance_id) ON DELETE RESTRICT,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shipments_bol ON shipments(bill_of_lading);
CREATE INDEX IF NOT EXISTS idx_shipments_date ON shipments(shipment_date);
CREATE INDEX IF NOT EXISTS idx_shipments_importer ON shipments(importer_entity_id);
CREATE INDEX IF NOT EXISTS idx_shipments_exporter ON shipments(exporter_entity_id);
CREATE INDEX IF NOT EXISTS idx_shipments_hs_code ON shipments(hs_code);
CREATE INDEX IF NOT EXISTS idx_shipments_provenance ON shipments(provenance_id);

-- ============================================================
-- 4. RAW / NORMALIZED / DERIVED VALUE AUDIT (Brief §2 Rule 4)
-- Never overwrite a source value. Every field stores raw, normalized,
-- and derived values separately.
-- ============================================================
CREATE TABLE IF NOT EXISTS field_values (
    field_value_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id            UUID NOT NULL,
    record_type          TEXT NOT NULL,             -- 'shipment' | 'entity'
    field_name           TEXT NOT NULL,             -- e.g. 'importer_name', 'hs_code'
    raw_value            TEXT,
    normalized_value     TEXT,
    derived_value        TEXT,
    normalization_method TEXT,
    derived_method       TEXT,
    created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_values_lookup ON field_values(record_id, record_type, field_name);

-- ============================================================
-- 5. FIELD MISSINGNESS (Brief §8 — Trust / Evidence Layer)
-- Distinguishes WHY a field is absent instead of generic 'N/A'
-- ============================================================
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'missingness_reason') THEN
        CREATE TYPE missingness_reason AS ENUM (
            'UNAVAILABLE_AT_SOURCE',
            'MASKED',
            'NOT_LICENSED',
            'NOT_YET_PROCESSED',
            'INFERRED'
        );
    END IF;
END$$;

CREATE TABLE IF NOT EXISTS field_missingness (
    missingness_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    record_id      UUID NOT NULL,
    record_type    TEXT NOT NULL,
    field_name     TEXT NOT NULL,
    reason         missingness_reason NOT NULL,
    notes          TEXT,
    noted_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_field_missingness_rec ON field_missingness(record_id, field_name);

-- ============================================================
-- 6. ENTITY RESOLUTION AUDIT (Brief §6 — Immutable Match Decisions)
-- ============================================================
CREATE TABLE IF NOT EXISTS entity_resolution_audit (
    audit_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_a_id      UUID NOT NULL,
    entity_b_id      UUID NOT NULL,
    match_decision   TEXT NOT NULL CHECK (match_decision IN ('MATCH', 'NO_MATCH', 'NEEDS_REVIEW')),
    confidence_score NUMERIC(5, 4),
    reason           JSONB NOT NULL,            -- Detailed breakdown of signals/comparisons driving match
    model_version    TEXT NOT NULL,             -- e.g. 'splink_v1.0.0_fellegi_sunter'
    reviewer_id      UUID,                      -- NULL if automated, reviewer UUID if human-reviewed
    reviewed_at      TIMESTAMPTZ,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_er_audit_entities ON entity_resolution_audit(entity_a_id, entity_b_id);
CREATE INDEX IF NOT EXISTS idx_er_audit_decision ON entity_resolution_audit(match_decision);

-- ============================================================
-- 7. HUMAN REVIEW QUEUE (Brief §6)
-- ============================================================
CREATE TABLE IF NOT EXISTS review_queue (
    review_id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_a_id  UUID NOT NULL,
    entity_b_id  UUID NOT NULL,
    splink_score NUMERIC(5, 4),
    status       TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'RESOLVED', 'SKIPPED')),
    assigned_to  UUID,
    resolved_at  TIMESTAMPTZ,
    resolution   TEXT CHECK (resolution IN ('MATCH', 'NO_MATCH', 'DEFER')),
    notes        TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
