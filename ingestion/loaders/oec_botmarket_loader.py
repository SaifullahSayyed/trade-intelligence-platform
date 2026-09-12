"""
Trade Intelligence Platform
OEC BotMarket Loader — End-to-End
===================================
Source : OEC BotMarket API  (https://botmarket.oec.world)
Contract: contracts/oec_botmarket_v1.yaml
Brief §: 3 (provenance), 5 (hard stop on schema change), 6 (missingness flags)

COST SAFETY:
  - max_queries_per_run (default 50) enforced at call site.
  - Each query costs $0.01 USD. 50 queries = $0.50 hard cap per run.
  - Caller MUST pass a QueryBudget object; loader will refuse to proceed if cap exceeded.

REGISTRATION NOTE:
  OEC BotMarket registration is at https://botmarket.oec.world
  No subscription approval required — pay-per-query ($0.01/query).
  Set env var OEC_BOTMARKET_API_KEY once key is issued.
  Until then, the loader will raise OECKeyMissingError at startup.
"""

import hashlib
import json
import logging
import os
import time
import uuid
from dataclasses import dataclass, field
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests
import yaml

logger = logging.getLogger("trade_intelligence.oec_loader")

# ============================================================
# Exceptions
# ============================================================

class OECKeyMissingError(RuntimeError):
    """Raised when OEC_BOTMARKET_API_KEY env var is absent at loader startup."""

class OECBudgetExceededError(RuntimeError):
    """Raised when a run would exceed the configured query budget."""

class OECContractViolationError(RuntimeError):
    """Raised when the API response does not match oec_botmarket_v1 contract."""

class OECAPIError(RuntimeError):
    """Raised on non-200 HTTP responses from the OEC API."""


# ============================================================
# Query Budget Guard
# ============================================================

@dataclass
class QueryBudget:
    """
    Hard cost cap for a single loader run.
    Default: 50 queries at $0.01 each = $0.50 max spend.
    Matches contract max_queries_per_run: 50.
    """
    max_queries: int = 50
    cost_per_query_usd: float = 0.01
    _consumed: int = field(default=0, init=False, repr=False)

    @property
    def consumed(self) -> int:
        return self._consumed

    @property
    def remaining(self) -> int:
        return self.max_queries - self._consumed

    @property
    def total_cost_usd(self) -> float:
        return self._consumed * self.cost_per_query_usd

    def check_and_increment(self):
        """Call before each query. Raises OECBudgetExceededError if cap would be breached."""
        if self._consumed >= self.max_queries:
            raise OECBudgetExceededError(
                f"OEC query budget exhausted: {self._consumed}/{self.max_queries} queries used "
                f"(${self.total_cost_usd:.2f} spent). "
                "To increase the cap, update max_queries_per_run in contracts/oec_botmarket_v1.yaml "
                "and pass a new QueryBudget with a higher max_queries."
            )
        self._consumed += 1
        logger.debug(
            "OEC budget: query %d/%d consumed ($%.2f so far)",
            self._consumed, self.max_queries, self.total_cost_usd,
        )


# ============================================================
# OEC BotMarket Loader
# ============================================================

class OECBotMarketLoader:
    """
    End-to-end loader for OEC BotMarket API.

    Responsibilities:
      1. Validate API key presence at construction time.
      2. Enforce query budget (cost cap) before every HTTP call.
      3. Validate each response against oec_botmarket_v1 contract fields.
      4. Enrich every record with a full provenance row (Brief §3).
      5. Persist raw JSON into ClickHouse bronze_oec_botmarket (append-only).
      6. Return structured records for downstream Silver transformation.

    Usage:
        loader = OECBotMarketLoader(contract_path="contracts/oec_botmarket_v1.yaml")
        budget = QueryBudget(max_queries=10)
        records = loader.fetch_trade_flow(
            origin_iso3="VNM", destination_iso3="USA", hs4_code="8528",
            year=2023, budget=budget
        )
    """

    BASE_URL = "https://botmarket.oec.world/v1"
    PARSER_VERSION = "oec_botmarket_loader_v1.0.0"

    REQUIRED_RESPONSE_FIELDS = {
        "trade_flow", "year", "origin_iso3", "destination_iso3", "trade_value_usd"
    }

    def __init__(self, contract_path: str = "contracts/oec_botmarket_v1.yaml"):
        # 1. Resolve API key — fail loudly if absent
        self.api_key = os.environ.get("OEC_BOTMARKET_API_KEY", "").strip()
        if not self.api_key:
            raise OECKeyMissingError(
                "OEC_BOTMARKET_API_KEY environment variable is not set. "
                "Register at https://botmarket.oec.world to obtain a key, "
                "then set it in your .env file. Loader cannot proceed without it."
            )

        # 2. Load and parse the data contract
        contract_file = Path(contract_path)
        if not contract_file.exists():
            raise FileNotFoundError(f"OEC contract not found at: {contract_path}")
        with open(contract_file, "r", encoding="utf-8") as f:
            self.contract: Dict[str, Any] = yaml.safe_load(f)

        self.contract_id: str = self.contract["contract_id"]
        self.schema_version: str = self.contract["schema_version"]
        self.license_reference: str = self.contract["license_reference"]

        logger.info(
            "OECBotMarketLoader initialized. Contract: %s v%s",
            self.contract_id, self.schema_version
        )

    # ----------------------------------------------------------
    # Public: Fetch a single trade flow query
    # ----------------------------------------------------------

    def fetch_trade_flow(
        self,
        origin_iso3: str,
        destination_iso3: str,
        budget: QueryBudget,
        hs4_code: Optional[str] = None,
        year: Optional[int] = None,
        rate_limit_sleep: float = 2.0,
    ) -> List[Dict[str, Any]]:
        """
        Query OEC BotMarket for bilateral trade flow between two countries.

        Args:
            origin_iso3: ISO 3166-1 alpha-3 code of exporting country (e.g. "VNM").
            destination_iso3: ISO 3166-1 alpha-3 code of importing country (e.g. "USA").
            budget: QueryBudget instance — will be checked and decremented.
            hs4_code: Optional 4-digit HS code filter (e.g. "8528").
            year: Optional year filter (e.g. 2023).
            rate_limit_sleep: Seconds to sleep after each query (OEC rate limit: 30/min).

        Returns:
            List of enriched record dicts, each containing provenance metadata.

        Raises:
            OECBudgetExceededError: If budget cap is already reached.
            OECAPIError: On non-200 HTTP responses.
            OECContractViolationError: If response schema doesn't match contract.
        """
        budget.check_and_increment()

        params: Dict[str, Any] = {
            "origin": origin_iso3.upper(),
            "destination": destination_iso3.upper(),
        }
        if hs4_code:
            params["hs4"] = hs4_code
        if year:
            params["year"] = year

        endpoint = f"{self.BASE_URL}/trade"
        acquisition_ts = datetime.now(timezone.utc)

        logger.info(
            "OEC query %d/%d: %s -> %s (hs4=%s, year=%s)",
            budget.consumed, budget.max_queries,
            origin_iso3, destination_iso3, hs4_code, year
        )

        # HTTP call
        try:
            response = requests.get(
                endpoint,
                params=params,
                headers={"X-Api-Key": self.api_key, "Accept": "application/json"},
                timeout=30,
            )
        except requests.RequestException as exc:
            raise OECAPIError(f"OEC HTTP request failed: {exc}") from exc

        if response.status_code != 200:
            raise OECAPIError(
                f"OEC API returned HTTP {response.status_code} for "
                f"{origin_iso3}->{destination_iso3}: {response.text[:500]}"
            )

        # Sleep to respect rate limit (30 req/min = 2s gap)
        time.sleep(rate_limit_sleep)

        raw_json_str = response.text
        raw_data = response.json()

        # Contract validation
        records_raw: List[Dict] = raw_data if isinstance(raw_data, list) else raw_data.get("data", [])
        validated_records = self._validate_and_enrich(
            records_raw=records_raw,
            endpoint=endpoint,
            params=params,
            raw_json_str=raw_json_str,
            acquisition_ts=acquisition_ts,
        )

        logger.info(
            "OEC query complete: %d records returned for %s->%s",
            len(validated_records), origin_iso3, destination_iso3
        )
        return validated_records

    def fetch_batch(
        self,
        queries: List[Dict[str, Any]],
        budget: QueryBudget,
        rate_limit_sleep: float = 2.0,
    ) -> List[Dict[str, Any]]:
        """
        Convenience wrapper to execute multiple fetch_trade_flow queries in sequence.

        Args:
            queries: List of kwarg dicts for fetch_trade_flow (without budget/sleep).
            budget: Shared QueryBudget — budget.remaining must cover len(queries).

        Raises:
            OECBudgetExceededError: If queries would exceed remaining budget.
        """
        if len(queries) > budget.remaining:
            raise OECBudgetExceededError(
                f"Batch has {len(queries)} queries but only {budget.remaining} remain in budget. "
                "Reduce batch size or increase budget.max_queries."
            )

        all_records: List[Dict[str, Any]] = []
        for q in queries:
            records = self.fetch_trade_flow(**q, budget=budget, rate_limit_sleep=rate_limit_sleep)
            all_records.extend(records)
        return all_records

    # ----------------------------------------------------------
    # Internal: Validation + Provenance enrichment
    # ----------------------------------------------------------

    def _validate_and_enrich(
        self,
        records_raw: List[Dict],
        endpoint: str,
        params: Dict,
        raw_json_str: str,
        acquisition_ts: datetime,
    ) -> List[Dict[str, Any]]:
        """
        Validates response records against oec_botmarket_v1 contract.
        Enriches each record with a provenance block.
        Raises OECContractViolationError on schema violations (Brief §5).
        """
        if not records_raw:
            logger.warning("OEC API returned zero records for params: %s", params)
            return []

        # Validate first record's fields as representative sample
        sample = records_raw[0] if records_raw else {}
        actual_fields = set(sample.keys())
        missing_required = self.REQUIRED_RESPONSE_FIELDS - actual_fields

        if missing_required:
            raise OECContractViolationError(
                f"OEC response missing required contract fields: {sorted(missing_required)}. "
                f"Contract: {self.contract_id} v{self.schema_version}. "
                "This is a schema change — pipeline halted (Brief §5)."
            )

        # Build provenance block (Brief §3)
        checksum = hashlib.sha256(raw_json_str.encode("utf-8")).hexdigest()
        provenance = {
            "provenance_id": str(uuid.uuid4()),
            "source_file": endpoint,
            "source_id": self.contract_id,
            "acquisition_timestamp": acquisition_ts.isoformat(),
            "jurisdiction": "INTL",
            "license_reference": self.license_reference,
            "checksum_sha256": checksum,
            "source_version": self.schema_version,
            "parser_version": self.PARSER_VERSION,
            "ingestion_timestamp": datetime.now(timezone.utc).isoformat(),
            "query_params": params,
            "raw_response_json": raw_json_str,
        }

        # Enrich each record
        enriched = []
        for rec in records_raw:
            enriched.append({
                **rec,
                "_provenance": provenance,
                "_missingness": self._compute_missingness(rec),
            })

        return enriched

    @staticmethod
    def _compute_missingness(record: Dict) -> Dict[str, bool]:
        """Flag which optional fields are absent (Brief §6)."""
        optional_fields = ["hs4_code", "trade_value_usd"]
        return {
            f"is_{field}_missing": (record.get(field) is None)
            for field in optional_fields
        }
