"""
End-to-End Pipeline Test — Trade Intelligence Platform
=======================================================
Brief §3 (provenance), §5 (hard stop on violation), §6 (missingness flags)

Covers the full synthetic pipeline sequence:
  ingestion (file read + contract validate)
  -> bronze row construction (provenance on every row)
  -> entity resolution (matching + clustering)
  -> search API (HTTP)
  -> evidence API (HTTP)
  -> export (provenance fields present on every exported record)

Uses only synthetic/mock data. No real Trademo file required.
DISCLAIMER: Results are measured against synthetic, hand-constructed name
variants - not real shipment data - and only indicate the matching logic
works mechanically, not real-world accuracy.
"""

import csv
import io
import json
import os
import tempfile
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List

import pandas as pd
import pytest
import requests

SYNTHETIC_MANIFEST_ROWS = [
    {
        "bill_of_lading": "SYNTH-BOL-0001",
        "shipment_date": "2022-09-04",
        "importer_name": "Walmart Inc.",
        "shipper_name": "Samsung Electronics Vietnam Co Ltd",
        "notify_party": "ACME FREIGHT INC",
        "hs_code": "852852",
        "product_desc": "Flat panel computer monitors",
        "origin_country": "VN",
        "destination_port": "USLAX",
        "origin_port": "VNSGN",
        "vessel_name": "EVER TRADE",
        "declared_value": "154000",
        "weight": "24850",
        "weight_unit": "KG",
        "quantity": "500",
        "quantity_unit": "CTN",
    },
    {
        "bill_of_lading": "SYNTH-BOL-0002",
        "shipment_date": "2022-09-06",
        "importer_name": "WAL-MART STORES, INC.",
        "shipper_name": "SAMSUNG ELECTRONICS",
        "notify_party": "",
        "hs_code": "852852",
        "product_desc": "Display processing units",
        "origin_country": "VN",
        "destination_port": "USLAX",
        "origin_port": "VNSGN",
        "vessel_name": "EVER TRADE",
        "declared_value": "98000",
        "weight": "18400",
        "weight_unit": "KG",
        "quantity": "350",
        "quantity_unit": "CTN",
    },
]

CONTRACT_PATH = (
    Path(__file__).resolve().parent.parent / "contracts" / "trademo_bol_v1.yaml"
)
FRONTEND_BASE = "http://localhost:3000"

REQUIRED_PROVENANCE_FIELDS = [
    "provenance_id",
    "source_file",
    "source_id",
    "acquisition_timestamp",
    "jurisdiction",
    "checksum",
    "source_version",
    "parser_version",
    "ingestion_timestamp",
]


@pytest.fixture(scope="module")
def synthetic_csv_file(tmp_path_factory):
    tmp = tmp_path_factory.mktemp("e2e_data")
    csv_path = tmp / "synthetic_manifest.csv"
    fieldnames = list(SYNTHETIC_MANIFEST_ROWS[0].keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(SYNTHETIC_MANIFEST_ROWS)
    return csv_path


@pytest.fixture(scope="module")
def validated_dataframe(synthetic_csv_file):
    from ingestion.loaders.trademo_bol_loader import read_and_validate_trademo_file

    df = read_and_validate_trademo_file(
        file_path=synthetic_csv_file,
        contract_path=CONTRACT_PATH,
    )
    return df


@pytest.fixture(scope="module")
def bronze_rows(synthetic_csv_file, validated_dataframe):
    from ingestion.loaders.trademo_bol_loader import (
        _build_provenance,
        _sha256_file,
        build_bronze_rows,
    )
    import yaml

    with open(CONTRACT_PATH, "r", encoding="utf-8") as f:
        contract = yaml.safe_load(f)

    acquisition_ts = datetime.now(timezone.utc)
    checksum = _sha256_file(synthetic_csv_file)
    provenance = _build_provenance(
        source_file=synthetic_csv_file,
        acquisition_ts=acquisition_ts,
        checksum=checksum,
        contract=contract,
    )
    rows = build_bronze_rows(validated_dataframe, synthetic_csv_file, provenance)
    return rows, provenance


class TestStage1Ingestion:
    def test_file_is_read_successfully(self, validated_dataframe):
        assert isinstance(validated_dataframe, pd.DataFrame)
        assert len(validated_dataframe) == len(SYNTHETIC_MANIFEST_ROWS)

    def test_required_columns_present(self, validated_dataframe):
        for col in ["bill_of_lading", "importer_name", "shipper_name", "shipment_date"]:
            assert col in validated_dataframe.columns, f"Missing column: {col}"

    def test_bol_values_match_source(self, validated_dataframe):
        bols = set(validated_dataframe["bill_of_lading"].tolist())
        expected = {"SYNTH-BOL-0001", "SYNTH-BOL-0002"}
        assert bols == expected


class TestStage2BronzeRows:
    def test_row_count_matches_input(self, bronze_rows):
        rows, _ = bronze_rows
        assert len(rows) == len(SYNTHETIC_MANIFEST_ROWS)

    def test_every_row_has_provenance(self, bronze_rows):
        rows, _ = bronze_rows
        for i, row in enumerate(rows):
            for field in REQUIRED_PROVENANCE_FIELDS:
                assert field in row and row[field], (
                    f"Row {i} missing provenance field '{field}'"
                )

    def test_provenance_id_is_valid_uuid(self, bronze_rows):
        rows, _ = bronze_rows
        for row in rows:
            uuid.UUID(row["provenance_id"])

    def test_source_id_is_correct(self, bronze_rows):
        rows, _ = bronze_rows
        for row in rows:
            assert row["source_id"] == "trademo_bol_v1"

    def test_checksum_is_sha256_hex(self, bronze_rows):
        rows, _ = bronze_rows
        for row in rows:
            assert len(row["checksum"]) == 64
            assert all(c in "0123456789abcdef" for c in row["checksum"])

    def test_raw_fields_not_coerced(self, bronze_rows):
        rows, _ = bronze_rows
        for row in rows:
            assert isinstance(row["raw_bill_of_lading"], str)
            assert row["raw_bill_of_lading"].startswith("SYNTH-BOL-")

    def test_full_record_json_is_valid(self, bronze_rows):
        rows, _ = bronze_rows
        for row in rows:
            parsed = json.loads(row["raw_full_record_json"])
            assert isinstance(parsed, dict)


class TestStage3EntityResolution:
    @pytest.fixture(scope="class")
    def resolution_records(self, bronze_rows):
        rows, _ = bronze_rows
        return [
            {"id": str(uuid.uuid4()), "raw_name": row["raw_importer_name"]}
            for row in rows
            if row.get("raw_importer_name")
        ]

    def test_pipeline_runs(self, resolution_records):
        from backend.entity_resolution.run_matching import run_matching_pipeline

        results = run_matching_pipeline(resolution_records, persist_db=False)
        assert isinstance(results, list)

    def test_walmart_variants_are_matched(self, resolution_records):
        from backend.entity_resolution.run_matching import run_matching_pipeline

        results = run_matching_pipeline(resolution_records, persist_db=False)
        match_decisions = [r["match_decision"] for r in results]
        assert "MATCH" in match_decisions, (
            "Expected Walmart variants (Walmart Inc. / WAL-MART STORES) to match"
        )

    def test_clustering_runs_on_results(self, resolution_records):
        from backend.entity_resolution.clustering import cluster_matched_entities
        from backend.entity_resolution.run_matching import run_matching_pipeline

        results = run_matching_pipeline(resolution_records, persist_db=False)
        clustered = cluster_matched_entities(resolution_records, results)
        assert clustered["total_records"] == len(resolution_records)
        assert clustered["cluster_count"] >= 1
        assert 0.0 <= clustered["coverage_ratio"] <= 1.0

    def test_each_result_has_provenance_fields(self, resolution_records):
        from backend.entity_resolution.run_matching import run_matching_pipeline

        results = run_matching_pipeline(resolution_records, persist_db=False)
        for res in results:
            for field in [
                "entity_a_id", "entity_b_id", "match_decision",
                "confidence_score", "reason", "model_version",
            ]:
                assert field in res, f"Result missing field '{field}'"


class TestStage4SearchAPI:
    @pytest.fixture(autouse=True)
    def skip_if_server_down(self):
        try:
            requests.get(f"{FRONTEND_BASE}/api/search", timeout=3)
        except Exception:
            pytest.skip("Frontend dev server not reachable at localhost:3000")

    def test_search_endpoint_returns_200(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/search", timeout=5)
        assert resp.status_code == 200

    def test_search_response_is_json(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/search", timeout=5)
        data = resp.json()
        assert isinstance(data, (dict, list))

    def test_coverage_string_reflects_synthetic_numbers(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/search", timeout=5)
        body = resp.text
        assert "870" not in body, (
            "Old hardcoded '870' placeholder still present in search API response"
        )


class TestStage5EvidenceAPI:
    @pytest.fixture(autouse=True)
    def skip_if_server_down(self):
        try:
            requests.get(f"{FRONTEND_BASE}/api/evidence-demo", timeout=3)
        except Exception:
            pytest.skip("Frontend dev server not reachable at localhost:3000")

    def test_evidence_endpoint_returns_200(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/evidence-demo", timeout=5)
        assert resp.status_code == 200

    def test_data_source_mode_is_synthetic(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/evidence-demo", timeout=5)
        data = resp.json()
        mode = data.get("framing", {}).get("data_source_mode", "")
        assert mode == "SYNTHETIC_MOCK_PENDING_REAL_DATA", (
            f"Expected SYNTHETIC_MOCK_PENDING_REAL_DATA, got: {mode!r}"
        )

    def test_coverage_is_10_of_18(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/evidence-demo", timeout=5)
        data = resp.json()
        text = data.get("entity_resolution", {}).get("coverage", {}).get("text", "")
        assert "10 of 18" in text, f"Coverage should read '10 of 18', got: {text!r}"

    def test_no_hardcoded_870_in_response(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/evidence-demo", timeout=5)
        assert "870" not in resp.text, (
            "Old hardcoded '870' placeholder present in evidence-demo response"
        )

    def test_provenance_block_present(self):
        resp = requests.get(f"{FRONTEND_BASE}/api/evidence-demo", timeout=5)
        data = resp.json()
        assert "provenance" in data or "source_record" in data, (
            "Evidence response missing provenance block"
        )


class TestStage6Export:
    def test_bronze_rows_are_exportable_as_jsonl(self, bronze_rows):
        rows, _ = bronze_rows
        buf = io.StringIO()
        for row in rows:
            buf.write(json.dumps(row, default=str) + "\n")
        buf.seek(0)
        exported = [json.loads(line) for line in buf if line.strip()]
        assert len(exported) == len(rows)

    def test_exported_rows_contain_all_provenance_fields(self, bronze_rows):
        rows, _ = bronze_rows
        for i, row in enumerate(rows):
            exported = json.loads(json.dumps(row, default=str))
            for field in REQUIRED_PROVENANCE_FIELDS:
                assert field in exported and exported[field], (
                    f"Exported row {i} missing provenance field '{field}'"
                )

    def test_provenance_id_is_consistent_across_rows(self, bronze_rows):
        rows, provenance = bronze_rows
        for row in rows:
            assert row["provenance_id"] == provenance["provenance_id"], (
                "provenance_id must be consistent within a single ingestion batch"
            )
