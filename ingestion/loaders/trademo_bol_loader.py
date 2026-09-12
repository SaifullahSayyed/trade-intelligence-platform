"""
Trade Intelligence Platform
Trademo US Bill of Lading — dlt Connector Scaffold
====================================================
Contract : contracts/trademo_bol_v1.yaml
Brief §  : 3 (provenance on every row), 5 (hard stop on schema change)

!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
UNVERIFIED SCHEMA — PENDING DAY 9 FILE INSPECTION
----------------------------------------------------
This scaffold is written against trademo_bol_v1.yaml which was authored
BEFORE the actual Trademo evaluation file has been received or inspected.

DO NOT treat this file as production-ready.
DO NOT run this loader against real data until:
  1. The actual Trademo file has been received (Day 9 gate).
  2. The real column names, types, and encoding have been verified
     against every field in trademo_bol_v1.yaml.
  3. The ContractValidator has been run against a sample of the real file
     and passed without errors.

If the real schema differs from the contract, this file MUST be revised
before any pipeline run proceeds. Failure mode must remain LOUD (Brief §5).

Reference: See checkpoint_phase2_parallel.md for full status.
!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
"""

import hashlib
import json
import logging
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Generator, Iterator, List, Optional, Union

import pandas as pd
import yaml

# dlt import with graceful fallback if not installed in this environment
try:
    import dlt
    from dlt.sources import DltResource
    _DLT_AVAILABLE = True
except ImportError:
    _DLT_AVAILABLE = False
    dlt = None  # type: ignore

from ..validators.contract_validator import ContractValidator, DataContractViolation

logger = logging.getLogger("trade_intelligence.trademo_loader")

# ============================================================
# Constants
# ============================================================
CONTRACT_PATH = Path(__file__).parent.parent.parent / "contracts" / "trademo_bol_v1.yaml"
PARSER_VERSION = "trademo_bol_loader_v1.0.0"
SOURCE_ID = "trademo_bol_v1"


# ============================================================
# Provenance builder (Brief §3)
# ============================================================

def _build_provenance(
    source_file: Path,
    acquisition_ts: datetime,
    checksum: str,
    contract: Dict[str, Any],
) -> Dict[str, Any]:
    """Build a provenance block attached to every ingested row (Brief §3)."""
    return {
        "provenance_id": str(uuid.uuid4()),
        "source_file": str(source_file),
        "source_id": SOURCE_ID,
        "acquisition_timestamp": acquisition_ts.isoformat(),
        "jurisdiction": contract.get("jurisdiction", "US"),
        "license_reference": contract.get("license_reference", ""),
        "checksum_sha256": checksum,
        "source_version": contract.get("schema_version", "1.0.0"),
        "parser_version": PARSER_VERSION,
        "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
    }


# ============================================================
# Core file reader + validator
# ============================================================

def read_and_validate_trademo_file(
    file_path: Union[str, Path],
    contract_path: Union[str, Path] = CONTRACT_PATH,
) -> pd.DataFrame:
    """
    Read a Trademo CSV/TSV/XLSX file, validate it against the data contract,
    and return a DataFrame ready for bronze ingestion.

    # UNVERIFIED SCHEMA — PENDING DAY 9 FILE INSPECTION
    # Column name assumptions here are based on trademo_bol_v1.yaml only.
    # They have NOT been verified against the actual file.

    Raises:
        DataContractViolation: If the file schema violates the contract (Brief §5).
        FileNotFoundError: If the file does not exist.
    """
    file_path = Path(file_path)
    if not file_path.exists():
        raise FileNotFoundError(f"Trademo source file not found: {file_path}")

    # Detect format
    suffix = file_path.suffix.lower()
    if suffix == ".csv":
        df = pd.read_csv(file_path, dtype=str, low_memory=False)
    elif suffix in (".tsv", ".txt"):
        df = pd.read_csv(file_path, sep="\t", dtype=str, low_memory=False)
    elif suffix in (".xlsx", ".xls"):
        df = pd.read_excel(file_path, dtype=str)
    else:
        # # DAY 9 TODO: Inspect actual file format delivered by Trademo
        # # (may be .csv.gz, .parquet, or custom delimiter)
        raise ValueError(
            f"Unsupported file format: {suffix}. "
            "DAY 9 TODO: Inspect actual Trademo file format and update this reader."
        )

    logger.info(
        "Read Trademo file: %s rows=%d cols=%d",
        file_path.name, len(df), len(df.columns)
    )

    # Normalize column names
    # # UNVERIFIED: These rename rules assume column names from the contract YAML.
    # # DAY 9: Compare df.columns against contract fields and update mappings.
    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]

    # Validate against contract — HARD STOP on violation (Brief §5)
    validator = ContractValidator(contract_path=contract_path)
    validator.validate_or_raise(df)

    return df


# ============================================================
# Bronze row builder (one row per shipment, denormalized provenance)
# ============================================================

def build_bronze_rows(
    df: pd.DataFrame,
    source_file: Path,
    provenance: Dict[str, Any],
) -> List[Dict[str, Any]]:
    """
    Convert validated DataFrame into bronze rows with denormalized provenance.
    Each row stores raw string values (never coerced) + full provenance block.

    # UNVERIFIED SCHEMA — column names assumed from contract, not from real file.
    """
    rows = []
    for _, row in df.iterrows():
        bronze_row = {
            # Provenance (Brief §3)
            "provenance_id": provenance["provenance_id"],
            "source_file": provenance["source_file"],
            "source_id": SOURCE_ID,
            "acquisition_timestamp": provenance["acquisition_timestamp"],
            "jurisdiction": provenance["jurisdiction"],
            "license_reference": provenance["license_reference"],
            "checksum": provenance["checksum_sha256"],
            "source_version": provenance["source_version"],
            "parser_version": provenance["parser_version"],
            "ingestion_timestamp": provenance["ingestion_timestamp"],

            # Raw payload — strings only, no coercion (UNVERIFIED column names)
            "raw_bill_of_lading":   str(row.get("bill_of_lading", "") or ""),
            "raw_shipment_date":    str(row.get("shipment_date", "") or ""),
            "raw_importer_name":    str(row.get("importer_name", "") or ""),
            "raw_shipper_name":     str(row.get("shipper_name", "") or ""),
            "raw_notify_party":     row.get("notify_party"),
            "raw_hs_code":          row.get("hs_code"),
            "raw_product_desc":     row.get("product_desc"),
            "raw_origin_country":   row.get("origin_country"),
            "raw_destination_port": row.get("destination_port"),
            "raw_origin_port":      row.get("origin_port"),
            "raw_vessel_name":      row.get("vessel_name"),
            "raw_declared_value":   row.get("declared_value"),
            "raw_weight":           row.get("weight"),
            "raw_weight_unit":      row.get("weight_unit"),
            "raw_quantity":         row.get("quantity"),
            "raw_quantity_unit":    row.get("quantity_unit"),
            "raw_full_record_json": row.to_json(),
        }
        rows.append(bronze_row)
    return rows


# ============================================================
# dlt source (if dlt is installed)
# ============================================================

def get_dlt_source(file_path: Union[str, Path]):
    """
    Return a dlt source that reads, validates, and yields bronze rows.
    Requires dlt to be installed: pip install dlt

    # UNVERIFIED SCHEMA — PENDING DAY 9 FILE INSPECTION
    """
    if not _DLT_AVAILABLE:
        raise ImportError(
            "dlt is not installed. Run: pip install dlt\n"
            "Note: This loader is also a pending Day 9 gate item — "
            "do not run against real data until schema is verified."
        )

    @dlt.source(name="trademo_bol")
    def trademo_bol_source():
        @dlt.resource(
            name="bronze_trademo_bol",
            write_disposition="append",
            primary_key="provenance_id",
        )
        def trademo_bol_resource() -> Iterator[Dict]:
            # UNVERIFIED SCHEMA — DAY 9 GATE
            file = Path(file_path)
            acquisition_ts = datetime.now(timezone.utc)
            checksum = _sha256_file(file)

            with open(CONTRACT_PATH, "r", encoding="utf-8") as f:
                contract = yaml.safe_load(f)

            provenance = _build_provenance(file, acquisition_ts, checksum, contract)
            df = read_and_validate_trademo_file(file)
            rows = build_bronze_rows(df, file, provenance)

            for row in rows:
                yield row

        return trademo_bol_resource()

    return trademo_bol_source()


def _sha256_file(path: Path) -> str:
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            sha256.update(chunk)
    return sha256.hexdigest()
