import pytest
import psycopg2
from backend.ai.banned_patterns import (
    BANNED_PATTERNS,
    scan_text_for_violations,
    CompliancePolicyViolation,
)
from backend.ai.explanation_service import (
    DataSourceMode,
    COMPLIANCE_DISCLAIMERS,
    generate_grounded_explanation,
    get_db_connection,
)

SAMPLE_SHIPMENT = {
    "shipment_id": "e4b2d35c-8a19-4b6e-9df2-9b2f34c21a99",
    "bill_of_lading": "MEDU1928472910",
    "importer_name": "WALMART INC.",
    "shipper_name": "SAMSUNG ELECTRONICS VIETNAM CO LTD",
    "origin_port": "Ho Chi Minh City Port (VNSGN)",
    "destination_port": "Port of Los Angeles (USLAX)",
    "hs_code": "852852",
    "product_desc": "Computer monitors and display units",
    "shipment_date": "2022-09-04",
}

def test_grounded_explanation_passes():
    res = generate_grounded_explanation(SAMPLE_SHIPMENT, mode=DataSourceMode.SYNTHETIC_MOCK)
    assert "MEDU1928472910" in res["explanation"]
    assert res["framing"]["data_source_mode"] == DataSourceMode.SYNTHETIC_MOCK.value
    assert "Synthetic test data" in res["framing"]["compliance_disclaimer"]

    # Verify audit log entry
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT action, status, resource_id
                FROM audit_log
                WHERE resource_id = %s AND action = 'AI_EXPLANATION_GENERATED'
                ORDER BY created_at DESC LIMIT 1;
                """,
                (SAMPLE_SHIPMENT["shipment_id"],),
            )
            row = cur.fetchone()
            assert row is not None
            assert row[0] == "AI_EXPLANATION_GENERATED"
            assert row[1] == "SUCCESS"
    finally:
        conn.close()

def test_banned_compliance_pattern_raises_and_logs():
    toxic_text = "Analysis indicates the counterparty is fully compliant and safe to trade."
    with pytest.raises(CompliancePolicyViolation) as excinfo:
        generate_grounded_explanation(
            SAMPLE_SHIPMENT,
            mode=DataSourceMode.SYNTHETIC_MOCK,
            text_override=toxic_text,
        )
    assert "compliant" in excinfo.value.matched_text.lower()

    # Verify audit log rejection entry
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT action, status, payload, error_message
                FROM audit_log
                WHERE resource_id = %s AND action = 'AI_EXPLANATION_REJECTED'
                ORDER BY created_at DESC LIMIT 1;
                """,
                (SAMPLE_SHIPMENT["shipment_id"],),
            )
            row = cur.fetchone()
            assert row is not None
            assert row[0] == "AI_EXPLANATION_REJECTED"
            assert row[1] == "DENIED"
            assert "compliant" in row[2]["matched_text"].lower()
    finally:
        conn.close()

def test_banned_speculative_crime_pattern_raises_and_logs():
    crime_text = "This ocean carrier was flagged for possible smuggling of unreported goods."
    with pytest.raises(CompliancePolicyViolation) as excinfo:
        generate_grounded_explanation(
            SAMPLE_SHIPMENT,
            mode=DataSourceMode.SYNTHETIC_MOCK,
            text_override=crime_text,
        )
    assert "smuggling" in excinfo.value.matched_text.lower()

def test_disclaimer_separation_between_modes():
    synthetic_disclaimer = COMPLIANCE_DISCLAIMERS[DataSourceMode.SYNTHETIC_MOCK]
    real_disclaimer = COMPLIANCE_DISCLAIMERS[DataSourceMode.REAL_TRADEMO]

    assert synthetic_disclaimer != real_disclaimer
    assert "Synthetic test data" in synthetic_disclaimer
    assert "real shipment records" not in synthetic_disclaimer or "not derived from any real shipment records" in synthetic_disclaimer
    assert "Built and proven on real CBP shipment records" in real_disclaimer
    assert "Synthetic" not in real_disclaimer
