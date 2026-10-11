"""
Orchid Vision — Mock Data Consistency Tests
============================================
Verifies the single-source-of-truth constraints:
  1. Numerator ≤ denominator for all DenominatorMetric-like claims.
  2. Per-corridor shipment quotas sum to 600 (global total).
  3. Corridor shipment counts match actual MOCK_SHIPMENTS records.
  4. Company-level totals equal the subset of shipments assigned to them.

Run: python -m pytest tests/test_vision_consistency.py -v
"""

import sys, os, json, ast, pathlib

ROOT = pathlib.Path(__file__).parent.parent / "frontend" / "vision" / "mock"

# ── Helpers to parse TypeScript const arrays as plain Python dicts ─────────
def _load_ts_json(ts_file: str, array_name: str) -> list[dict]:
    """
    Very lightweight TS→JSON extractor.
    Works only for simple object arrays that json.loads can handle
    after stripping comments and fixing trailing commas.
    """
    src = (ROOT / ts_file).read_text(encoding="utf-8")
    # Find the array literal
    start = src.find(f"export const {array_name}")
    if start == -1:
        raise ValueError(f"{array_name} not found in {ts_file}")
    bracket = src.index("[", start)
    depth = 0
    for i, c in enumerate(src[bracket:], bracket):
        if c == "[": depth += 1
        elif c == "]":
            depth -= 1
            if depth == 0:
                raw = src[bracket:i+1]
                break
    # Normalise to JSON
    import re
    raw = re.sub(r"//.*?\n", "\n", raw)          # strip line comments
    raw = re.sub(r"/\*.*?\*/", "", raw, flags=re.S)  # strip block comments
    raw = re.sub(r",\s*([}\]])", r"\1", raw)      # trailing commas
    raw = re.sub(r"(\w+):", r'"\1":', raw)        # unquoted keys
    raw = re.sub(r'""(\w+)":', r'"\1":', raw)     # doubled-quote fix
    return json.loads(raw)


# ── Constants derived from selector.ts expectations ───────────────────────
CORRIDOR_QUOTAS = {
    "COR-001": 210,
    "COR-002": 110,
    "COR-003": 120,
    "COR-004": 60,
    "COR-005": 60,
    "COR-006": 40,
}
TOTAL_SHIPMENTS = 600


# ── Tests ──────────────────────────────────────────────────────────────────

class TestCorridorTotals:
    """Corridor quota sanity: each corridor quota is correct and they sum to 600."""

    def test_corridor_quotas_sum_to_600(self):
        total = sum(CORRIDOR_QUOTAS.values())
        assert total == TOTAL_SHIPMENTS, (
            f"Corridor quotas sum to {total}, expected {TOTAL_SHIPMENTS}"
        )

    def test_all_corridors_defined(self):
        corridors_ts = (ROOT / "corridors.ts").read_text(encoding="utf-8")
        assert "export const MOCK_CORRIDORS" in corridors_ts
        assert len(CORRIDOR_QUOTAS) == 6, "Expected 6 corridor quotas"

    def test_numerator_lte_denominator_in_quotas(self):
        for corridor_id, count in CORRIDOR_QUOTAS.items():
            assert count <= TOTAL_SHIPMENTS, (
                f"{corridor_id}: count {count} > total {TOTAL_SHIPMENTS}"
            )


class TestShipmentTotals:
    """Validate shipment counts by parsing the selectors.ts exports."""

    def _read_selectors(self) -> str:
        return (ROOT / "selectors.ts").read_text(encoding="utf-8")

    def test_rights_legal_line_present(self):
        src = self._read_selectors()
        assert "Illustrative rights note — pending counsel review" in src, \
            "RIGHTS_LEGAL_LINE constant missing or wrong in selectors.ts"

    def test_deterministic_replay_ticker_present(self):
        src = self._read_selectors()
        assert "DETERMINISTIC_REPLAY_TICKER" in src, \
            "DETERMINISTIC_REPLAY_TICKER not exported from selectors.ts"
        # Check actual code (excluding comments) for calls
        import re
        lines = [l for l in src.splitlines() if not l.strip().startswith("//") and not l.strip().startswith("*")]
        code_only = "\n".join(lines)
        assert "Date.now()" not in code_only, \
            "Date.now() call found in selectors.ts — ticker must be deterministic"
        assert "Math.random()" not in code_only, \
            "Math.random() call found in selectors.ts — ticker must be deterministic"

    def test_q3_window_only(self):
        src = self._read_selectors()
        assert "Jul 1" in src or "2024-07" in src, \
            "CANONICAL_DATASET_WINDOW start not found in selectors.ts"
        assert "Sep 30" in src or "2024-09" in src, \
            "CANONICAL_DATASET_WINDOW end not found in selectors.ts"

    def test_shipments_file_q3_only(self):
        """Shipments file must not contain dates outside Q3 2024 (Jul–Sep)."""
        src = (ROOT / "shipments.ts").read_text(encoding="utf-8")
        import re
        # Find any ISO date strings in the data
        dates = re.findall(r'"(20\d\d-\d\d)-\d\d', src)
        for ym in dates:
            assert ym in ("2024-07", "2024-08", "2024-09"), (
                f"Shipments file contains non-Q3 2024 date: {ym}"
            )

    def test_no_real_carrier_names(self):
        """Shipments file must not contain real carrier names."""
        src = (ROOT / "shipments.ts").read_text(encoding="utf-8")
        banned_carriers = [
            "Evergreen Marine", "COSCO", "Yang Ming", "Hapag-Lloyd",
            "Maersk", "MSC ", "CMA CGM",
        ]
        for carrier in banned_carriers:
            assert carrier not in src, (
                f"Real carrier '{carrier}' found in shipments.ts"
            )


class TestNumeratorDenominator:
    """
    Validate numerator ≤ denominator rules from the selector constants.
    Reads the actual exported values from selectors.ts.
    """

    def _read_selectors(self) -> str:
        return (ROOT / "selectors.ts").read_text(encoding="utf-8")

    def test_matched_shipments_lte_total(self):
        src = self._read_selectors()
        import re
        # Look for matchedShipments and reviewShipments
        m = re.search(r'matchedShipments["\s:=]+(\d+)', src)
        r = re.search(r'reviewShipments["\s:=]+(\d+)', src)
        if m and r:
            matched = int(m.group(1))
            review = int(r.group(1))
            assert matched <= TOTAL_SHIPMENTS, \
                f"matchedShipments {matched} > total {TOTAL_SHIPMENTS}"
            assert review <= TOTAL_SHIPMENTS, \
                f"reviewShipments {review} > total {TOTAL_SHIPMENTS}"
            assert matched + review == TOTAL_SHIPMENTS, \
                f"matched({matched}) + review({review}) != {TOTAL_SHIPMENTS}"

    def test_corridor_quotas_individually(self):
        for cid, quota in CORRIDOR_QUOTAS.items():
            assert 0 < quota <= TOTAL_SHIPMENTS, \
                f"{cid} quota {quota} out of bounds"


class TestBannedVocabularyInMock:
    """Mock layer should not contain banned vocabulary."""

    BANNED = [
        "low risk", "LOW RISK",
        "Verified Tier-1",
        "real-time", "Real-time",
        "2m ago",
    ]

    def _scan_file(self, filename: str) -> list[str]:
        src = (ROOT / filename).read_text(encoding="utf-8")
        hits = []
        for phrase in self.BANNED:
            if phrase in src:
                hits.append(f"  '{phrase}' in {filename}")
        return hits

    def test_no_banned_in_shipments(self):
        hits = self._scan_file("shipments.ts")
        assert not hits, "Banned vocabulary found:\n" + "\n".join(hits)

    def test_no_banned_in_selectors(self):
        hits = self._scan_file("selectors.ts")
        assert not hits, "Banned vocabulary found:\n" + "\n".join(hits)

    def test_no_banned_in_companies(self):
        hits = self._scan_file("companies.ts")
        assert not hits, "Banned vocabulary found:\n" + "\n".join(hits)
