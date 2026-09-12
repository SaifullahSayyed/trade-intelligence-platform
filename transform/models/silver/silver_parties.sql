

{{
    config(
        materialized="incremental",
        unique_key="party_key",
        on_schema_change="fail",
        tags=["silver", "trademo", "parties", "unverified_schema"]
    )
}}

WITH importers AS (
    SELECT

        lower(hex(MD5(lower(trim(importer_raw)))))  AS party_key,
        importer_raw                                AS raw_name,
        'IMPORTER'                                  AS party_role,
        source_id,
        source_record_id,
        ingestion_timestamp,
        provenance_id
    FROM {{ ref("silver_shipments") }}
    WHERE importer_raw IS NOT NULL
      AND importer_raw != ''
),

exporters AS (
    SELECT
        lower(hex(MD5(lower(trim(exporter_raw)))))  AS party_key,
        exporter_raw                                AS raw_name,
        'EXPORTER'                                  AS party_role,
        source_id,
        source_record_id,
        ingestion_timestamp,
        provenance_id
    FROM {{ ref("silver_shipments") }}
    WHERE exporter_raw IS NOT NULL
      AND exporter_raw != ''
),

notify_parties AS (
    SELECT
        lower(hex(MD5(lower(trim(notify_party)))))  AS party_key,
        notify_party                                AS raw_name,
        'NOTIFY_PARTY'                              AS party_role,
        source_id,
        source_record_id,
        ingestion_timestamp,
        provenance_id
    FROM {{ ref("silver_shipments") }}
    WHERE notify_party IS NOT NULL
      AND notify_party != ''
),

all_parties AS (
    SELECT * FROM importers
    UNION ALL
    SELECT * FROM exporters
    UNION ALL
    SELECT * FROM notify_parties
)

SELECT
    party_key,
    any(raw_name)               AS raw_name,
    any(party_role)             AS party_role,
    any(source_id)              AS source_id,
    count()                     AS appearance_count,
    min(ingestion_timestamp)    AS first_seen_at,
    max(ingestion_timestamp)    AS last_seen_at,

    NULL::Nullable(UUID)        AS entity_id,
    'PENDING_RESOLUTION'        AS resolution_status,
    any(provenance_id)          AS provenance_id
FROM all_parties
GROUP BY party_key

{% if is_incremental() %}

    HAVING party_key NOT IN (SELECT party_key FROM {{ this }})
       OR  max(ingestion_timestamp) > (SELECT max(last_seen_at) FROM {{ this }})
{% endif %}
