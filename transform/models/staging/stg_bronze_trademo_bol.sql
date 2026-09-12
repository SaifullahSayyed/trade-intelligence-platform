

{{
    config(
        materialized="view",
        tags=["staging", "trademo", "unverified_schema"]
    )
}}

SELECT

    provenance_id,
    source_id,
    ingestion_timestamp,

    raw_bill_of_lading                                              AS bill_of_lading,

    parseDateTimeBestEffort(raw_shipment_date)                     AS shipment_date,

    trim(raw_importer_name)                                        AS importer_name_raw,
    trim(nullIf(raw_shipper_name, ''))                             AS shipper_name_raw,
    trim(nullIf(raw_notify_party, ''))                             AS notify_party_raw,

    nullIf(trim(raw_hs_code), '')                                  AS hs_code_raw,

    nullIf(trim(raw_product_desc), '')                             AS product_desc_raw,

    nullIf(trim(raw_origin_country), '')                           AS origin_country_raw,
    nullIf(trim(raw_destination_port), '')                         AS destination_port_raw,
    nullIf(trim(raw_origin_port), '')                              AS origin_port_raw,

    nullIf(trim(raw_vessel_name), '')                              AS vessel_name_raw,

    nullIf(raw_declared_value, '')                                 AS declared_value_raw,
    nullIf(raw_weight, '')                                         AS weight_raw,
    nullIf(raw_weight_unit, '')                                    AS weight_unit_raw,
    nullIf(raw_quantity, '')                                       AS quantity_raw,
    nullIf(raw_quantity_unit, '')                                  AS quantity_unit_raw,

    raw_full_record_json

FROM {{ source("bronze", "bronze_trademo_bol") }}

WHERE 1=1

{% if is_incremental() %}
    AND ingestion_timestamp > (SELECT max(ingestion_timestamp) FROM {{ this }})
{% endif %}
