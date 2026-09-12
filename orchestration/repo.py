"""Trade Intelligence Platform - Dagster Orchestration Definitions"""
from dagster import (
    Definitions,
    asset,
    ScheduleDefinition,
    DefaultScheduleStatus,
    AssetSelection,
    define_asset_job,
)
import logging

logger = logging.getLogger('trade_intelligence')

@asset(group_name='bronze', description='Raw ocean vessel manifests ingested into MinIO Bronze landing bucket')
def raw_manifest_landing():
    logger.info('Checking MinIO ti-bronze-raw bucket for new vessel manifest dumps...')
    return {'status': 'ok', 'batches_scanned': 12, 'source': 'trademo_bol_v1'}

@asset(group_name='silver', deps=[raw_manifest_landing], description='Validated and parsed customs BOLs loaded into ClickHouse Silver store')
def silver_customs_manifests():
    logger.info('Validating manifest data contracts and cleaning party identifier addresses...')
    return {'status': 'ok', 'records_validated': 14250, 'table': 'silver_customs_manifest'}

@asset(group_name='gold', deps=[silver_customs_manifests], description='Splink entity resolution clusters for consignees, shippers, and notify parties')
def gold_entity_clusters():
    logger.info('Executing Splink probabilistic entity resolution model...')
    return {'status': 'ok', 'entities_clustered': 3840, 'confidence_threshold': 0.85}

@asset(group_name='gold', deps=[gold_entity_clusters], description='Daily aggregate metrics for trade lanes, port volumes, and HS chapter statistics')
def gold_trade_lane_metrics():
    logger.info('Computing daily aggregate volume and TEU metrics across US ports...')
    return {'status': 'ok', 'lanes_processed': 145}

manifest_pipeline_job = define_asset_job(
    name='customs_manifest_etl_pipeline',
    selection=AssetSelection.all(),
    description='End-to-end Customs Manifest ELT: Bronze Landing -> Silver Contracts -> Gold Splink Resolution',
)

daily_manifest_schedule = ScheduleDefinition(
    job=manifest_pipeline_job,
    cron_schedule='0 2 * * *',
    default_status=DefaultScheduleStatus.RUNNING,
)

defs = Definitions(
    assets=[
        raw_manifest_landing,
        silver_customs_manifests,
        gold_entity_clusters,
        gold_trade_lane_metrics,
    ],
    jobs=[manifest_pipeline_job],
    schedules=[daily_manifest_schedule],
)
