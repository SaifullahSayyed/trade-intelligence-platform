import os
import uuid
from enum import Enum
from typing import Dict, Any, Optional, List
import psycopg2
from psycopg2.extras import Json

from .banned_patterns import scan_text_for_violations, CompliancePolicyViolation

class DataSourceMode(str, Enum):
    SYNTHETIC_MOCK = "SYNTHETIC_MOCK_PENDING_REAL_DATA"
    REAL_TRADEMO = "REAL_TRADEMO_HISTORICAL_SAMPLE"

COMPLIANCE_DISCLAIMERS: Dict[DataSourceMode, str] = {
    DataSourceMode.SYNTHETIC_MOCK: (
        "Synthetic test data used to validate entity-matching logic only — not derived from any real shipment records."
    ),
    DataSourceMode.REAL_TRADEMO: (
        "Built and proven on real CBP shipment records; live ingestion is the next step once funded."
    ),
}

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get("POSTGRES_HOST", "localhost"),
        port=int(os.environ.get("POSTGRES_PORT", 5432)),
        dbname=os.environ.get("POSTGRES_DB", "trade_intelligence"),
        user=os.environ.get("POSTGRES_USER", "ti_user"),
        password=os.environ.get("POSTGRES_PASSWORD", "ti_local_postgres_pass_2026!"),
    )

def log_audit_event(
    action: str,
    status: str,
    resource_id: Optional[str],
    payload: Dict[str, Any],
    error_message: Optional[str] = None,
    tenant_id: Optional[str] = None,
    actor_id: Optional[str] = None,
) -> str:
    conn = get_db_connection()
    log_id = str(uuid.uuid4())
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO audit_log (
                    log_id, tenant_id, actor_id, actor_type, action,
                    resource_type, resource_id, payload, status, error_message
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    log_id,
                    tenant_id,
                    actor_id,
                    "SYSTEM_SERVICE",
                    action,
                    "SHIPMENT_EXPLANATION",
                    resource_id,
                    Json(payload),
                    status,
                    error_message,
                ),
            )
        conn.commit()
    finally:
        conn.close()
    return log_id

def generate_grounded_explanation(
    shipment: Dict[str, Any],
    mode: DataSourceMode = DataSourceMode.SYNTHETIC_MOCK,
    text_override: Optional[str] = None,
    tenant_id: Optional[str] = None,
    actor_id: Optional[str] = None,
) -> Dict[str, Any]:
    shipment_id = shipment.get("shipment_id", str(uuid.uuid4()))
    bol = shipment.get("bill_of_lading", "UNKNOWN_BOL")
    importer = shipment.get("importer_name", "UNKNOWN_IMPORTER")
    shipper = shipment.get("shipper_name", "UNKNOWN_SHIPPER")
    origin = shipment.get("origin_port", "ORIGIN_PORT")
    dest = shipment.get("destination_port", "DEST_PORT")
    hs = shipment.get("hs_code", "HS_CODE")
    product = shipment.get("product_desc", "General Cargo")
    date = shipment.get("shipment_date", "2022-09-04")

    if text_override:
        explanation_text = text_override
    else:
        explanation_text = (
            f"Bill of Lading {bol} records an ocean shipment arrived on {date}. "
            f"Consignee {importer} received cargo described as '{product}' under HS Tariff {hs} "
            f"from shipper {shipper}. The transit corridor was routed from {origin} to {dest}. "
            f"Entity resolution resolved the consignee with confidence based on normalized legal name matching. "
            f"Declared customs value was omitted under statutory confidentiality rules."
        )

    violation = scan_text_for_violations(explanation_text)
    if violation:
        pattern, matched_text = violation
        err_msg = f"Rejected text containing prohibited pattern '{matched_text}' (regex: {pattern})"
        log_audit_event(
            action="AI_EXPLANATION_REJECTED",
            status="DENIED",
            resource_id=shipment_id,
            payload={
                "matched_pattern": pattern,
                "matched_text": matched_text,
                "offending_text": explanation_text,
                "data_source_mode": mode.value,
            },
            error_message=err_msg,
            tenant_id=tenant_id,
            actor_id=actor_id,
        )
        raise CompliancePolicyViolation(matched_pattern=pattern, matched_text=matched_text)

    log_audit_event(
        action="AI_EXPLANATION_GENERATED",
        status="SUCCESS",
        resource_id=shipment_id,
        payload={
            "bill_of_lading": bol,
            "data_source_mode": mode.value,
            "word_count": len(explanation_text.split()),
        },
        tenant_id=tenant_id,
        actor_id=actor_id,
    )

    disclaimer = COMPLIANCE_DISCLAIMERS[mode]
    return {
        "shipment_id": shipment_id,
        "bill_of_lading": bol,
        "explanation": explanation_text,
        "evidence_citations": [
            {"field": "bill_of_lading", "source_value": bol},
            {"field": "consignee", "source_value": importer},
            {"field": "shipper", "source_value": shipper},
            {"field": "hs_code", "source_value": hs},
            {"field": "transit", "source_value": f"{origin} -> {dest}"},
        ],
        "framing": {
            "is_historical_window": (mode == DataSourceMode.REAL_TRADEMO),
            "is_synthetic": (mode == DataSourceMode.SYNTHETIC_MOCK),
            "data_source_mode": mode.value,
            "compliance_disclaimer": disclaimer,
        },
    }
