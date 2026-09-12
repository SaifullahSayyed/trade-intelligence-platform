"""
Tests for oec_botmarket_loader.py
Covers: budget guard, contract validation, provenance enrichment, error paths.
All tests run without a real API key (mocked HTTP).
"""

import os
import json
import pytest
from unittest.mock import MagicMock, patch

# Ensure no real key leaks into tests
os.environ.pop("OEC_BOTMARKET_API_KEY", None)

import sys
sys.path.insert(0, str(__import__("pathlib").Path(__file__).parent.parent / "ingestion" / "loaders"))

from oec_botmarket_loader import (
    OECBotMarketLoader,
    OECBudgetExceededError,
    OECContractViolationError,
    OECAPIError,
    OECKeyMissingError,
    QueryBudget,
)

CONTRACT_PATH = str(
    __import__("pathlib").Path(__file__).parent.parent / "contracts" / "oec_botmarket_v1.yaml"
)

VALID_RESPONSE = [
    {
        "trade_flow": "export",
        "year": 2023,
        "origin_iso3": "VNM",
        "destination_iso3": "USA",
        "hs4_code": "8528",
        "trade_value_usd": 1_234_567.89,
    }
]


# ============================================================
# Fixtures
# ============================================================

@pytest.fixture
def loader():
    """Return a loader with a fake API key."""
    os.environ["OEC_BOTMARKET_API_KEY"] = "fake-test-key-xxxx"
    loader = OECBotMarketLoader(contract_path=CONTRACT_PATH)
    yield loader
    os.environ.pop("OEC_BOTMARKET_API_KEY", None)


# ============================================================
# Budget Guard Tests
# ============================================================

class TestQueryBudget:
    def test_increments_correctly(self):
        b = QueryBudget(max_queries=3)
        b.check_and_increment()
        b.check_and_increment()
        assert b.consumed == 2
        assert b.remaining == 1

    def test_raises_when_exhausted(self):
        b = QueryBudget(max_queries=2)
        b.check_and_increment()
        b.check_and_increment()
        with pytest.raises(OECBudgetExceededError, match="budget exhausted"):
            b.check_and_increment()

    def test_total_cost_calculation(self):
        b = QueryBudget(max_queries=50, cost_per_query_usd=0.01)
        for _ in range(5):
            b.check_and_increment()
        assert abs(b.total_cost_usd - 0.05) < 1e-9


# ============================================================
# Key-missing Tests
# ============================================================

class TestKeyMissing:
    def test_raises_on_missing_key(self):
        os.environ.pop("OEC_BOTMARKET_API_KEY", None)
        with pytest.raises(OECKeyMissingError, match="OEC_BOTMARKET_API_KEY"):
            OECBotMarketLoader(contract_path=CONTRACT_PATH)


# ============================================================
# Fetch + Validation Tests
# ============================================================

class TestFetchTradeFlow:
    def _mock_response(self, data, status_code=200):
        mock_resp = MagicMock()
        mock_resp.status_code = status_code
        mock_resp.json.return_value = data
        mock_resp.text = json.dumps(data)
        return mock_resp

    def test_successful_fetch_enriches_provenance(self, loader):
        with patch("requests.get", return_value=self._mock_response(VALID_RESPONSE)):
            budget = QueryBudget(max_queries=5)
            records = loader.fetch_trade_flow(
                origin_iso3="VNM", destination_iso3="USA", budget=budget,
                rate_limit_sleep=0
            )

        assert len(records) == 1
        assert "_provenance" in records[0]
        prov = records[0]["_provenance"]
        assert prov["source_id"] == "oec_botmarket_v1"
        assert "checksum_sha256" in prov
        assert "provenance_id" in prov
        assert "acquisition_timestamp" in prov

    def test_budget_decremented_on_fetch(self, loader):
        with patch("requests.get", return_value=self._mock_response(VALID_RESPONSE)):
            budget = QueryBudget(max_queries=3)
            loader.fetch_trade_flow(
                origin_iso3="VNM", destination_iso3="USA", budget=budget,
                rate_limit_sleep=0
            )
        assert budget.consumed == 1

    def test_raises_on_http_error(self, loader):
        with patch("requests.get", return_value=self._mock_response({}, status_code=403)):
            budget = QueryBudget(max_queries=5)
            with pytest.raises(OECAPIError, match="HTTP 403"):
                loader.fetch_trade_flow(
                    origin_iso3="VNM", destination_iso3="USA", budget=budget,
                    rate_limit_sleep=0
                )

    def test_raises_on_missing_required_field(self, loader):
        broken_response = [{"trade_flow": "export", "year": 2023}]  # Missing required fields
        with patch("requests.get", return_value=self._mock_response(broken_response)):
            budget = QueryBudget(max_queries=5)
            with pytest.raises(OECContractViolationError, match="missing required contract fields"):
                loader.fetch_trade_flow(
                    origin_iso3="VNM", destination_iso3="USA", budget=budget,
                    rate_limit_sleep=0
                )

    def test_missingness_flags_populated(self, loader):
        response_with_null = [{
            "trade_flow": "export", "year": 2023,
            "origin_iso3": "VNM", "destination_iso3": "USA",
            "hs4_code": None, "trade_value_usd": 999.0,
        }]
        with patch("requests.get", return_value=self._mock_response(response_with_null)):
            budget = QueryBudget(max_queries=5)
            records = loader.fetch_trade_flow(
                origin_iso3="VNM", destination_iso3="USA", budget=budget,
                rate_limit_sleep=0
            )
        assert records[0]["_missingness"]["is_hs4_code_missing"] is True
        assert records[0]["_missingness"]["is_trade_value_usd_missing"] is False


# ============================================================
# Batch Tests
# ============================================================

class TestFetchBatch:
    def _mock_response(self, data):
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = data
        mock_resp.text = json.dumps(data)
        return mock_resp

    def test_batch_raises_if_budget_insufficient(self, loader):
        queries = [
            {"origin_iso3": "VNM", "destination_iso3": "USA"},
            {"origin_iso3": "CHN", "destination_iso3": "USA"},
        ]
        budget = QueryBudget(max_queries=1)  # Only 1 remaining
        with pytest.raises(OECBudgetExceededError, match="Batch has 2 queries"):
            loader.fetch_batch(queries, budget=budget, rate_limit_sleep=0)

    def test_batch_executes_sequentially(self, loader):
        queries = [
            {"origin_iso3": "VNM", "destination_iso3": "USA"},
            {"origin_iso3": "CHN", "destination_iso3": "USA"},
        ]
        budget = QueryBudget(max_queries=5)
        with patch("requests.get", return_value=self._mock_response(VALID_RESPONSE)):
            records = loader.fetch_batch(queries, budget=budget, rate_limit_sleep=0)
        assert len(records) == 2  # 1 record per query
        assert budget.consumed == 2
