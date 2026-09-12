"""
Trade Intelligence Platform - Data Contract Validator
Brief §5: "If the source schema changes unexpectedly (e.g., a field changes type),
the pipeline must fail loudly and stop — never silently coerce and continue."
"""

import hashlib
import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union

import pandas as pd
import yaml

logger = logging.getLogger(__name__)


class DataContractViolation(Exception):
    """Raised when an incoming source dataset violates its contract definition."""
    pass


class ContractValidator:
    """
    Validates ingested tabular files or batch records against defined YAML contracts.
    """

    def __init__(self, contract_path: Union[str, Path]):
        self.contract_path = Path(contract_path)
        if not self.contract_path.is_file():
            raise FileNotFoundError(f"Data contract not found at: {self.contract_path}")

        with open(self.contract_path, "r", encoding="utf-8") as f:
            self.contract: Dict[str, Any] = yaml.safe_load(f)

        self.contract_id = self.contract.get("contract_id")
        self.schema_version = self.contract.get("schema_version")
        self.columns = {col["name"]: col for col in self.contract.get("columns", [])}
        self.on_schema_change = self.contract.get("on_schema_change", "FAIL")

    @staticmethod
    def compute_sha256(file_path: Union[str, Path]) -> str:
        """Calculate SHA-256 checksum of a raw data file for provenance."""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(65536), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def validate_dataframe(self, df: pd.DataFrame) -> Tuple[bool, List[str]]:
        """
        Validate DataFrame columns, nullability, and basic types against contract.
        Returns (is_valid, list_of_errors).
        """
        errors = []
        actual_cols = set(df.columns)
        expected_cols = set(self.columns.keys())

        # Check required columns
        for col_name, col_def in self.columns.items():
            if col_name not in actual_cols:
                errors.append(f"Missing column '{col_name}' required by contract {self.contract_id}")
            elif not col_def.get("nullable", True):
                null_count = df[col_name].isnull().sum()
                if null_count > 0:
                    errors.append(f"Non-nullable column '{col_name}' contains {null_count} null rows")

        # Check for unexpected extra columns if strict
        if self.on_schema_change == "FAIL":
            unexpected = actual_cols - expected_cols
            if unexpected:
                errors.append(
                    f"Unexpected additional columns found in source: {sorted(list(unexpected))}. "
                    f"Contract {self.contract_id} requires explicit schema definition."
                )

        # Type validation check
        for col_name, col_def in self.columns.items():
            if col_name not in df.columns:
                continue

            expected_type = col_def.get("type", "string").lower()
            series = df[col_name].dropna()

            if expected_type == "numeric":
                # Check if elements can be coerced to numeric without generating unexpected NaNs
                coerced = pd.to_numeric(series, errors="coerce")
                invalid_numeric_count = coerced.isnull().sum()
                if invalid_numeric_count > 0:
                    errors.append(
                        f"Column '{col_name}' declared as numeric but contains {invalid_numeric_count} non-numeric values"
                    )

            elif expected_type == "date":
                try:
                    pd.to_datetime(series, errors="raise")
                except Exception as e:
                    errors.append(f"Column '{col_name}' declared as date failed parsing: {str(e)}")

        is_valid = len(errors) == 0
        return is_valid, errors

    def validate_or_raise(self, df: pd.DataFrame):
        """Validates DataFrame and raises DataContractViolation on failure."""
        is_valid, errors = self.validate_dataframe(df)
        if not is_valid:
            error_summary = " | ".join(errors)
            logger.error("Data contract violation in %s: %s", self.contract_id, error_summary)
            raise DataContractViolation(
                f"Data contract validation failed for contract '{self.contract_id}' (version {self.schema_version}):\n"
                + "\n".join(f" - {err}" for err in errors)
            )
        logger.info("Dataset passed contract validation for %s", self.contract_id)
        return True
