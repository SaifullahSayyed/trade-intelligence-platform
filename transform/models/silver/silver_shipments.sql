

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

with_casts AS (
    SELECT

        generateUUIDv4()                                        AS shipment_id,
        provenance_id,
        'trademo_bol_v1'                                        AS source_id,
        bill_of_lading                                          AS source_record_id,

        ingestion_timestamp,
        toDateTime64(shipment_date, 3, 'UTC')                   AS source_timestamp,
        now64()                                                 AS normalization_timestamp,
        toDate(shipment_date)                                   AS shipment_date,

        importer_name_raw                                       AS importer_raw,
        shipper_name_raw                                        AS exporter_raw,
        notify_party_raw,

        lpad(hs_code_raw, 6, '0')                               AS hs_code_normalized,
        hs_code_raw,
        'HS2022'                                                AS hs_version,

        product_desc_raw,

        upper(left(origin_country_raw, 2))                      AS origin_country_iso2,
        origin_port_raw                                         AS origin_port_unlocode,
        destination_port_raw                                    AS destination_port_unlocode,
        'US'                                                    AS destination_country_iso2,

        toFloat64OrNull(quantity_raw)                           AS quantity,
        quantity_unit_raw                                       AS quantity_unit,

        toFloat64OrNull(weight_raw)                             AS weight_kg,
        toFloat64OrNull(declared_value_raw)                     AS declared_value_usd,

        vessel_name_raw                                         AS vessel_name,

        (importer_name_raw = '' OR importer_name_raw IS NULL)   AS is_importer_missing,
        (shipper_name_raw IS NULL)                              AS is_exporter_missing,
        (hs_code_raw IS NULL)                                   AS is_hs_code_missing,
        (declared_value_raw IS NULL)                            AS is_value_missing,

        'MEDIUM'                                                AS source_confidence

    FROM staged
)

SELECT * FROM with_casts

{% if is_incremental() %}
WHERE ingestion_timestamp > (SELECT max(ingestion_timestamp) FROM {{ this }})
{% endif %}
