-- ============================================================
-- silver_shipments.sql
-- Trade Intelligence Platform — Silver Layer (Canonical Shipments)
-- ============================================================
-- UNVERIFIED SCHEMA — PENDING DAY 9 FILE INSPECTION
-- This model is scaffolded against trademo_bol_v1.yaml.
-- Column names, date formats, HS code digit counts, weight units,
-- and country code formats are ALL ASSUMED — not verified from the real file.
--
-- Status: HEAD START SCAFFOLD — NOT DONE
-- Gate  : Day 9 file inspection must clear before this model runs in prod.
-- See   : checkpoint_phase2_parallel.md, section "Day 9 Gate Checklist"
-- ============================================================

{{
    config(
        materialized="incremental",
        unique_key="shipment_id",
        on_schema_change="fail",
        tags=["silver", "trademo", "unverified_schema"]
    )
}}

WITH staged AS (
    SELECT * FROM {{ ref("stg_bronze_trademo_bol") }}
),

-- DAY 9: Validate that these numeric casts succeed on the real file.
-- If declared_value is a formatted string like "$1,234.00", toFloat64OrNull will return NULL.
-- Update cast logic after inspecting the actual file.
with_casts AS (
    SELECT
        -- Identity + provenance (Brief Rule 3)
        generateUUIDv4()                                        AS shipment_id,
        provenance_id,
        'trademo_bol_v1'                                        AS source_id,
        bill_of_lading                                          AS source_record_id,

        -- Three timestamps (Brief Rule 8 — stored separately, never blended)
        ingestion_timestamp,
        toDateTime64(shipment_date, 3, 'UTC')                   AS source_timestamp,
        now64()                                                 AS normalization_timestamp,
        toDate(shipment_date)                                   AS shipment_date,

        -- Party raw values (normalization via Splink entity resolution)
        importer_name_raw                                       AS importer_raw,
        shipper_name_raw                                        AS exporter_raw,
        notify_party_raw,

        -- HS code normalization
        -- DAY 9: Confirm digit count and zero-pad rules for this source
        lpad(hs_code_raw, 6, '0')                               AS hs_code_normalized,
        hs_code_raw,
        'HS2022'                                                AS hs_version,

        -- Cargo description
        product_desc_raw,

        -- Geography
        -- DAY 9: Confirm whether origin_country_raw is ISO2, ISO3, or free text
        upper(left(origin_country_raw, 2))                      AS origin_country_iso2,
        origin_port_raw                                         AS origin_port_unlocode,
        destination_port_raw                                    AS destination_port_unlocode,
        'US'                                                    AS destination_country_iso2,

        -- Numerics
        -- DAY 9: If these are formatted strings, update casts accordingly
        toFloat64OrNull(quantity_raw)                           AS quantity,
        quantity_unit_raw                                       AS quantity_unit,
        -- DAY 9: Confirm weight is already in KG or needs conversion
        toFloat64OrNull(weight_raw)                             AS weight_kg,
        toFloat64OrNull(declared_value_raw)                     AS declared_value_usd,

        vessel_name_raw                                         AS vessel_name,

        -- Missingness flags (Brief Rule 6)
        (importer_name_raw = '' OR importer_name_raw IS NULL)   AS is_importer_missing,
        (shipper_name_raw IS NULL)                              AS is_exporter_missing,
        (hs_code_raw IS NULL)                                   AS is_hs_code_missing,
        (declared_value_raw IS NULL)                            AS is_value_missing,

        -- Source confidence — starts MEDIUM until Splink resolution assigns HIGH/LOW
        'MEDIUM'                                                AS source_confidence

    FROM staged
)

SELECT * FROM with_casts

{% if is_incremental() %}
WHERE ingestion_timestamp > (SELECT max(ingestion_timestamp) FROM {{ this }})
{% endif %}
