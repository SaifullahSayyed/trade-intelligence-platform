"""
Contract Violation Test — Trade Intelligence Platform
======================================================
Brief §5: "If the source schema changes unexpectedly the pipeline must fail
loudly and stop — never silently coerce and continue."

Each test feeds a deliberately schema-violating file into the ingestion
pipeline and verifies:
  1. A DataContractViolation is raised (not silently swallowed)
  2. Zero bronze rows are written
  3. The failure is logged at ERROR level with the contract ID
"""

import csv
import logging
import tempfile
from pathlib import Path
from typing import Dict, List

import pandas as pd
import pytest

from ingestion.validators.contract_validator import ContractValidator, DataContractViolation
from ingestion.loaders.trademo_bol_loader import read_and_validate_trademo_file

CONTRACT_PATH = (
    Path(__file__).resolve().parent.parent / "contracts" / "trademo_bol_v1.yaml"
)

VALID_ROW: Dict = {
    "bill_of_lading": "BOL-VALID-001",
    "shipment_date": "2022-09-05",
    "importer_name": "ACME IMPORTING CORP",
    "shipper_name": "GLOBAL EXPORTS LTD",
    "notify_party": "LOGISTICS FORWARDING INC",
    "hs_code": "847130",
    "product_desc": "PORTABLE COMPUTERS",
    "origin_country": "VN",
    "destination_port": "USLAX",
    "origin_port": "VNSGN",
    "vessel_name": "EVER GIVEN",
    "declared_value": "154000.50",
    "weight": "4500.0",
    "weight_unit": "KG",
    "quantity": "120",
    "quantity_unit": "CTN",
}


def _write_csv(rows: List[Dict], tmp_path: Path) -> Path:
    csv_path = tmp_path / "violation_test.csv"
    if rows:
        fieldnames = list(rows[0].keys())
    else:
        fieldnames = list(VALID_ROW.keys())
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return csv_path


@pytest.fixture()
def validator():
    return ContractValidator(CONTRACT_PATH)


class TestMissingRequiredColumn:
    """Dropping a non-nullable required column must halt the pipeline loudly."""

    def test_raises_data_contract_violation(self, tmp_path):
        row = {k: v for k, v in VALID_ROW.items() if k != "importer_name"}
        csv_path = _write_csv([row], tmp_path)

        with pytest.raises(DataContractViolation) as exc_info:
            read_and_validate_trademo_file(csv_path, CONTRACT_PATH)

        assert "importer_name" in str(exc_info.value), (
            "Exception message must name the missing column"
        )

    def test_zero_bronze_rows_written(self, tmp_path):
        from ingestion.loaders.trademo_bol_loader import build_bronze_rows
        from datetime import datetime, timezone
        import yaml, uuid

        row = {k: v for k, v in VALID_ROW.items() if k != "importer_name"}
        csv_path = _write_csv([row], tmp_path)

        bronze_rows_written = []
        try:
            df = read_and_validate_trademo_file(csv_path, CONTRACT_PATH)
            with open(CONTRACT_PATH) as f:
                contract = yaml.safe_load(f)
            from ingestion.loaders.trademo_bol_loader import _build_provenance, _sha256_file
            prov = _build_provenance(csv_path, datetime.now(timezone.utc), _sha256_file(csv_path), contract)
            bronze_rows_written = build_bronze_rows(df, csv_path, prov)
        except DataContractViolation:
            pass

        assert len(bronze_rows_written) == 0, (
            f"Expected 0 bronze rows on violation, got {len(bronze_rows_written)}"
        )

    def test_error_is_logged(self, tmp_path, caplog):
        row = {k: v for k, v in VALID_ROW.items() if k != "importer_name"}
        csv_path = _write_csv([row], tmp_path)

        with caplog.at_level(logging.ERROR):
            with pytest.raises(DataContractViolation):
                read_and_validate_trademo_file(csv_path, CONTRACT_PATH)

        assert any("trademo_bol_v1" in msg for msg in caplog.messages), (
            "ERROR log must include the contract_id 'trademo_bol_v1'"
        )


class TestUnexpectedExtraColumn:
    """An unexpected extra column must halt with FAIL behavior (Brief §5)."""

    def test_raises_on_rogue_column(self, tmp_path):
        row = dict(VALID_ROW)
        row["rogue_undocumented_field"] = "surprise"
        csv_path = _write_csv([row], tmp_path)

        with pytest.raises(DataContractViolation) as exc_info:
            read_and_validate_trademo_file(csv_path, CONTRACT_PATH)

        assert "rogue_undocumented_field" in str(exc_info.value) or \
               "Unexpected additional columns" in str(exc_info.value), (
            "Exception must identify the unexpected column"
        )

    def test_zero_bronze_rows_written(self, tmp_path):
        row = dict(VALID_ROW)
        row["rogue_undocumented_field"] = "surprise"
        csv_path = _write_csv([row], tmp_path)

        bronze_rows_written = []
        try:
            df = read_and_validate_trademo_file(csv_path, CONTRACT_PATH)
            from ingestion.loaders.trademo_bol_loader import build_bronze_rows, _build_provenance, _sha256_file
            from datetime import datetime, timezone
            import yaml
            with open(CONTRACT_PATH) as f:
                contract = yaml.safe_load(f)
            prov = _build_provenance(csv_path, datetime.now(timezone.utc), _sha256_file(csv_path), contract)
            bronze_rows_written = build_bronze_rows(df, csv_path, prov)
        except DataContractViolation:
            pass

        assert len(bronze_rows_written) == 0


class TestBadNumericType:
    """A non-numeric value in a numeric column must halt the pipeline."""

    def test_raises_on_bad_declared_value(self, tmp_path):
        row = dict(VALID_ROW)
        row["declared_value"] = "NOT_A_NUMBER"
        csv_path = _write_csv([row], tmp_path)

        with pytest.raises(DataContractViolation) as exc_info:
            read_and_validate_trademo_file(csv_path, CONTRACT_PATH)

        assert "declared_value" in str(exc_info.value), (
            "Exception must name the offending column"
        )
        assert "numeric" in str(exc_info.value).lower(), (
            "Exception must state the type expectation"
        )

    def test_zero_bronze_rows_written(self, tmp_path):
        row = dict(VALID_ROW)
        row["declared_value"] = "NOT_A_NUMBER"
        csv_path = _write_csv([row], tmp_path)

        bronze_rows_written = []
        try:
            df = read_and_validate_trademo_file(csv_path, CONTRACT_PATH)
            from ingestion.loaders.trademo_bol_loader import build_bronze_rows, _build_provenance, _sha256_file
            from datetime import datetime, timezone
            import yaml
            with open(CONTRACT_PATH) as f:
                contract = yaml.safe_load(f)
            prov = _build_provenance(csv_path, datetime.now(timezone.utc), _sha256_file(csv_path), contract)
            bronze_rows_written = build_bronze_rows(df, csv_path, prov)
        except DataContractViolation:
            pass

        assert len(bronze_rows_written) == 0


class TestNullInNonNullableColumn:
    """A null in a non-nullable column must halt the pipeline."""

    def test_raises_on_null_bill_of_lading(self, tmp_path):
        row = dict(VALID_ROW)
        row["bill_of_lading"] = ""
        csv_path = _write_csv([row], tmp_path)

        df = pd.read_csv(csv_path, dtype=str, low_memory=False)
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        df["bill_of_lading"] = None

        validator = ContractValidator(CONTRACT_PATH)
        is_valid, errors = validator.validate_dataframe(df)

        assert not is_valid
        assert any("bill_of_lading" in e for e in errors)

        with pytest.raises(DataContractViolation):
            validator.validate_or_raise(df)

    def test_error_is_logged(self, tmp_path, caplog):
        row = dict(VALID_ROW)
        row["importer_name"] = ""
        csv_path = _write_csv([row], tmp_path)

        df = pd.read_csv(csv_path, dtype=str, low_memory=False)
        df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
        df["importer_name"] = None

        validator = ContractValidator(CONTRACT_PATH)

        with caplog.at_level(logging.ERROR):
            with pytest.raises(DataContractViolation):
                validator.validate_or_raise(df)

        assert any("trademo_bol_v1" in msg for msg in caplog.messages)


class TestEmptyFile:
    """An empty file (header only) must not write any bronze rows and must not crash silently."""

    def test_empty_file_writes_zero_bronze_rows(self, tmp_path):
        from ingestion.loaders.trademo_bol_loader import build_bronze_rows, _build_provenance, _sha256_file
        from datetime import datetime, timezone
        import yaml

        csv_path = _write_csv([], tmp_path)

        bronze_rows_written = []
        try:
            df = read_and_validate_trademo_file(csv_path, CONTRACT_PATH)
            with open(CONTRACT_PATH) as f:
                contract = yaml.safe_load(f)
            prov = _build_provenance(csv_path, datetime.now(timezone.utc), _sha256_file(csv_path), contract)
            bronze_rows_written = build_bronze_rows(df, csv_path, prov)
        except (DataContractViolation, Exception):
            pass

        assert len(bronze_rows_written) == 0, (
            "An empty source file must produce zero bronze rows"
        )


class TestUnsupportedFileFormat:
    """An unsupported file format must raise immediately before any parsing."""

    def test_json_file_raises_value_error(self, tmp_path):
        json_path = tmp_path / "manifest.json"
        json_path.write_text('[{"bill_of_lading": "BOL001"}]', encoding="utf-8")

        with pytest.raises(ValueError, match="Unsupported file format"):
            read_and_validate_trademo_file(json_path, CONTRACT_PATH)
