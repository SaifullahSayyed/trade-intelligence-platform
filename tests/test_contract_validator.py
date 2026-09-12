"""
Unit tests for Data Contract Validator (Brief §5)
Ensures contracts fail loudly on unexpected schema changes, missing columns, or bad types.
"""

import tempfile
from pathlib import Path
import pandas as pd
import pytest

from ingestion.validators.contract_validator import ContractValidator, DataContractViolation

@pytest.fixture
def trademo_contract_path():
    contract_file = Path(__file__).resolve().parent.parent / "contracts" / "trademo_bol_v1.yaml"
    assert contract_file.exists(), f"Contract file missing at {contract_file}"
    return contract_file

@pytest.fixture
def valid_trademo_dataframe():
    return pd.DataFrame([
        {
            "bill_of_lading": "BOL12345678",
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
            "declared_value": 154000.50,
            "weight": 4500.0,
            "weight_unit": "KG",
            "quantity": 120,
            "quantity_unit": "CTN",
        }
    ])

def test_valid_data_passes_contract(trademo_contract_path, valid_trademo_dataframe):
    validator = ContractValidator(trademo_contract_path)
    is_valid, errors = validator.validate_dataframe(valid_trademo_dataframe)
    assert is_valid is True
    assert len(errors) == 0
    assert validator.validate_or_raise(valid_trademo_dataframe) is True

def test_missing_required_column_fails_loudly(trademo_contract_path, valid_trademo_dataframe):
    validator = ContractValidator(trademo_contract_path)

    invalid_df = valid_trademo_dataframe.drop(columns=["importer_name"])

    is_valid, errors = validator.validate_dataframe(invalid_df)
    assert is_valid is False
    assert any("Missing column 'importer_name'" in err for err in errors)

    with pytest.raises(DataContractViolation) as exc_info:
        validator.validate_or_raise(invalid_df)
    assert "Missing column 'importer_name'" in str(exc_info.value)

def test_unexpected_column_fails_loudly(trademo_contract_path, valid_trademo_dataframe):
    validator = ContractValidator(trademo_contract_path)

    invalid_df = valid_trademo_dataframe.copy()
    invalid_df["unexpected_rogue_column"] = "surprise_value"

    is_valid, errors = validator.validate_dataframe(invalid_df)
    assert is_valid is False
    assert any("Unexpected additional columns found" in err for err in errors)

    with pytest.raises(DataContractViolation):
        validator.validate_or_raise(invalid_df)

def test_invalid_numeric_type_fails(trademo_contract_path, valid_trademo_dataframe):
    validator = ContractValidator(trademo_contract_path)

    invalid_df = valid_trademo_dataframe.copy()
    invalid_df["declared_value"] = "not_a_number_value"

    is_valid, errors = validator.validate_dataframe(invalid_df)
    assert is_valid is False
    assert any("declared_value" in err and "numeric" in err for err in errors)

def test_compute_sha256(trademo_contract_path):
    checksum = ContractValidator.compute_sha256(trademo_contract_path)
    assert isinstance(checksum, str)
    assert len(checksum) == 64
