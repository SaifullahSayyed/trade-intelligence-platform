-- ============================================================
-- stg_bronze_trademo_bol.sql
-- Trade Intelligence Platform — Staging (View)
-- ============================================================
-- UNVERIFIED SCHEMA — PENDING DAY 9 FILE INSPECTION
-- Column casts and rename logic here assumes trademo_bol_v1.yaml contract.
-- Every cast below is a GUESS until the real file header is inspected.
-- DO NOT promote to silver or treat as production until Day 9 gate is cleared.
-- See checkpoint_phase2_parallel.md for gate checklist.
-- ============================================================

{{
    config(
        materialized="view",
        tags=["staging", "trademo", "unverified_schema"]
    )
}}

SELECT
    -- Provenance passthrough (Brief Rule 3 — never drop)
    provenance_id,
    source_id,
    ingestion_timestamp,

    -- Identity
    raw_bill_of_lading                                              AS bill_of_lading,

    -- DAY 9: Verify raw_shipment_date format (ISO8601? MM/DD/YYYY? YYYYMMDD?)
    -- Attempting ISO parse — adjust strptime format after file inspection
    parseDateTimeBestEffort(raw_shipment_date)                     AS shipment_date,

    -- Party names (raw only at staging — normalization in silver)
    trim(raw_importer_name)                                        AS importer_name_raw,
    trim(nullIf(raw_shipper_name, ''))                             AS shipper_name_raw,
    trim(nullIf(raw_notify_party, ''))                             AS notify_party_raw,

    -- HS code
    -- DAY 9: Confirm whether field contains 4-digit, 6-digit, or 10-digit codes
    nullIf(trim(raw_hs_code), '')                                  AS hs_code_raw,

    -- Cargo
    nullIf(trim(raw_product_desc), '')                             AS product_desc_raw,

    -- Geography
    -- DAY 9: Confirm ISO2/ISO3 or free-text country names in source file
    nullIf(trim(raw_origin_country), '')                           AS origin_country_raw,
    nullIf(trim(raw_destination_port), '')                         AS destination_port_raw,
    nullIf(trim(raw_origin_port), '')                              AS origin_port_raw,

    -- Vessel
    nullIf(trim(raw_vessel_name), '')                              AS vessel_name_raw,

    -- Numeric fields — kept as strings at staging; cast in silver
    -- DAY 9: Confirm these are numeric or string-encoded in source
    nullIf(raw_declared_value, '')                                 AS declared_value_raw,
    nullIf(raw_weight, '')                                         AS weight_raw,
    nullIf(raw_weight_unit, '')                                    AS weight_unit_raw,
    nullIf(raw_quantity, '')                                       AS quantity_raw,
    nullIf(raw_quantity_unit, '')                                  AS quantity_unit_raw,

    -- Full JSON for auditability (Brief Rule 4)
    raw_full_record_json

FROM {{ source("bronze", "bronze_trademo_bol") }}

-- Deduplicate on provenance_id (idempotent load)
WHERE 1=1

{% if is_incremental() %}
    AND ingestion_timestamp > (SELECT max(ingestion_timestamp) FROM {{ this }})
{% endif %}
