-- ============================================================
-- gold.sql
-- ClickHouse Gold Layer: Aggregated Business-Ready Views & Tables
-- ============================================================

-- -----------------------------------------------------------
-- 1. Company Trade Metrics (Aggregated by Importer)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS trade_intelligence.gold_company_trade_metrics (
    entity_id           UUID,
    canonical_name      String,
    total_shipments     UInt64,
    total_weight_kg     Float64,
    total_value_usd     Float64,
    distinct_suppliers  UInt32,
    distinct_hs_codes   UInt32,
    first_shipment_date Date,
    last_shipment_date  Date,
    updated_at          DateTime64(3, ''UTC'') DEFAULT now()
) ENGINE = ReplacingMergeTree(updated_at)
ORDER BY (entity_id);

-- -----------------------------------------------------------
-- 2. Materialized View: Update Company Trade Metrics from Silver
-- -----------------------------------------------------------
CREATE MATERIALIZED VIEW IF NOT EXISTS trade_intelligence.mv_gold_importer_metrics
TO trade_intelligence.gold_company_trade_metrics
AS SELECT
    importer_entity_id AS entity_id,
    importer_normalized AS canonical_name,
    count() AS total_shipments,
    sum(coalesce(weight_kg, 0)) AS total_weight_kg,
    sum(coalesce(declared_value_usd, 0)) AS total_value_usd,
    uniqExact(exporter_normalized) AS distinct_suppliers,
    uniqExact(hs_code_normalized) AS distinct_hs_codes,
    min(shipment_date) AS first_shipment_date,
    max(shipment_date) AS last_shipment_date,
    now() AS updated_at
FROM trade_intelligence.silver_shipments
WHERE importer_entity_id IS NOT NULL
GROUP BY importer_entity_id, importer_normalized;

-- -----------------------------------------------------------
-- 3. Trade Corridor & HS Code Summary
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS trade_intelligence.gold_corridor_hs_metrics (
    origin_country_iso2      FixedString(2),
    destination_country_iso2 FixedString(2),
    hs_code_normalized       String,
    shipment_month           Date,
    shipment_count           UInt64,
    total_weight_kg          Float64,
    total_value_usd          Float64,
    updated_at               DateTime64(3, ''UTC'') DEFAULT now()
) ENGINE = SummingMergeTree((shipment_count, total_weight_kg, total_value_usd))
ORDER BY (origin_country_iso2, destination_country_iso2, hs_code_normalized, shipment_month);
