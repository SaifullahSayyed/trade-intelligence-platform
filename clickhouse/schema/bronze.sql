-- ============================================================
-- bronze.sql
-- ClickHouse Bronze Layer: Raw, Immutable, Append-Only
-- ============================================================

CREATE DATABASE IF NOT EXISTS trade_intelligence;

-- -----------------------------------------------------------
-- 1. Trademo US Bill of Lading Sample (Primary 10-day Dataset)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS trade_intelligence.bronze_trademo_bol (
    -- Provenance & Metadata (Denormalized on every row)
    provenance_id         UUID,
    source_file           String,
    source_id             LowCardinality(String) DEFAULT ''trademo_bol_v1'',
    acquisition_timestamp DateTime64(3, ''UTC''),
    jurisdiction          LowCardinality(String) DEFAULT ''US'',
    license_reference     String,
    checksum              FixedString(64),       -- SHA-256
    source_version        LowCardinality(String),
    parser_version        LowCardinality(String),
    ingestion_timestamp   DateTime64(3, ''UTC'') DEFAULT now(),

    -- Raw Source Payload Fields (Direct from file, uncoerced strings)
    raw_bill_of_lading    String,
    raw_shipment_date     String,
    raw_importer_name     String,
    raw_shipper_name      String,
    raw_notify_party      Nullable(String),
    raw_hs_code           Nullable(String),
    raw_product_desc      Nullable(String),
    raw_origin_country    Nullable(String),
    raw_destination_port  Nullable(String),
    raw_origin_port       Nullable(String),
    raw_vessel_name       Nullable(String),
    raw_declared_value    Nullable(String),
    raw_weight            Nullable(String),
    raw_weight_unit       Nullable(String),
    raw_quantity          Nullable(String),
    raw_quantity_unit     Nullable(String),
    raw_container_id      Nullable(String),
    raw_full_record_json  String                 -- Raw JSON string of original row
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(ingestion_timestamp)
ORDER BY (ingestion_timestamp, raw_bill_of_lading);

-- -----------------------------------------------------------
-- 2. OEC BotMarket Aggregated Trade Data (Supplementary Lookups)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS trade_intelligence.bronze_oec_botmarket (
    provenance_id         UUID,
    source_file           String,
    source_id             LowCardinality(String) DEFAULT ''oec_botmarket_v1'',
    acquisition_timestamp DateTime64(3, ''UTC''),
    jurisdiction          LowCardinality(String) DEFAULT ''INTL'',
    license_reference     String,
    checksum              FixedString(64),
    source_version        LowCardinality(String),
    parser_version        LowCardinality(String),
    ingestion_timestamp   DateTime64(3, ''UTC'') DEFAULT now(),

    query_endpoint        String,
    query_params_json     String,
    raw_response_json     String
) ENGINE = MergeTree()
PARTITION BY toYYYYMM(ingestion_timestamp)
ORDER BY (ingestion_timestamp, query_endpoint);
