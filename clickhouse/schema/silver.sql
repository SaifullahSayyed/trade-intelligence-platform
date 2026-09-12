-- ============================================================
-- silver.sql
-- ClickHouse Silver Layer: Canonical Normalized Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS trade_intelligence.silver_shipments (
    shipment_id              UUID,
    source_id                LowCardinality(String),
    source_record_id         String,

    -- Three separate timestamps (Brief §8)
    ingestion_timestamp      DateTime64(3, ''UTC''),
    source_timestamp         Nullable(DateTime64(3, ''UTC'')),
    normalization_timestamp  DateTime64(3, ''UTC''),
    shipment_date            Date,

    -- Resolved canonical entity references
    importer_entity_id       Nullable(UUID),
    exporter_entity_id       Nullable(UUID),
    notify_party_entity_id   Nullable(UUID),

    -- Field values: Raw vs Normalized vs Derived (Brief §2 Rule 4)
    importer_raw             String,
    importer_normalized      String,
    importer_derived         Nullable(String),

    exporter_raw             String,
    exporter_normalized      String,
    exporter_derived         Nullable(String),

    hs_code_raw              Nullable(String),
    hs_code_normalized       Nullable(String),       -- Zero-padded 6-digit standard
    hs_version               LowCardinality(String) DEFAULT ''HS2022'',

    product_desc_raw         Nullable(String),
    product_desc_clean       Nullable(String),

    origin_country_raw       Nullable(String),
    origin_country_iso2      Nullable(FixedString(2)),

    destination_country_iso2 LowCardinality(FixedString(2)) DEFAULT ''US'',
    origin_port_unlocode     Nullable(String),
    destination_port_unlocode Nullable(String),

    quantity                 Nullable(Float64),
    quantity_unit            Nullable(LowCardinality(String)),
    weight_kg                Nullable(Float64),
    declared_value_usd       Nullable(Float64),

    vessel_name              Nullable(String),
    bill_of_lading           String,

    source_confidence        LowCardinality(String), -- ''HIGH'', ''MEDIUM'', ''LOW''
    provenance_id            UUID,

    -- Field missingness flags
    is_importer_missing      UInt8 DEFAULT 0,
    is_exporter_missing      UInt8 DEFAULT 0,
    is_hs_code_missing       UInt8 DEFAULT 0,
    is_value_missing         UInt8 DEFAULT 0
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(shipment_date)
ORDER BY (shipment_date, bill_of_lading, shipment_id);
