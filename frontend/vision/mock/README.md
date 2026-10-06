# Vision Preview Mock Data — Documentation & Honesty Notice

> **MANDATORY NOTICE — NON-LIVE ILLUSTRATIVE DATA**
> All datasets, company profiles, bills of lading, shipment transactions, entity resolution metrics, and audit entries in this directory (`frontend/vision/mock/`) are completely fabricated and illustrative.

## Core Rules
1. **Fictional Entities Only**: All company names (e.g. "Northwind Retail Group", "Helix Components Ltd", "Meridian Freight Co.") are entirely invented. No real companies, real logos, or proprietary partner data appear in this preview.
2. **Distinct Illustrative Numbers**: Mock figures use unique illustrative ratios (e.g. "31 of 42 candidate pairs", "124 of 150 shipments matched") to avoid confusion with the live repository's synthetic benchmark figures ("10 of 18").
3. **Uniform Illustrative Period**: All shipment filings, corridor metrics, and audit timestamps are anchored to:
   **`Q3 2024 Illustrative Sample (July 1 – September 30, 2024)`**.
4. **Deterministic Generation**: Generated via a seeded PRNG (`seed.ts`, mulberry32 algorithm). All figures render deterministically without hydration shifts or `Math.random()`.
5. **Probabilistic Matcher Attribution**: The backend entity resolution engine is a custom Fellegi-Sunter-style probabilistic matcher (not the external Splink library). All UI chips and explanations accurately describe it as a "probabilistic matcher".
6. **Provenance & Trust Layer**: Every mock shipment record carries `isMock: true`, preserving raw, normalized, and derived values with explicit missingness reasons (`MASKED`, `UNAVAILABLE_AT_SOURCE`).
