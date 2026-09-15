# Trademo Hot-Swap Readiness Checklist

> **When to use this document:** The moment Trademo AWS Data Exchange subscription is approved.
> Every step below has exactly one owner and one done-criterion. Zero ambiguity.

---

## Step 1 — Download the file (< 30 min)

- [ ] Log into AWS Console → Data Exchange → Subscriptions → Trademo US BOL Sample
- [ ] Export/download the dataset file to a known local path, e.g.
      `c:\ti-data\trademo_bol_sample_real.csv`
- [ ] Compute and record the SHA-256 checksum:
      `certutil -hashfile trademo_bol_sample_real.csv SHA256`
- [ ] Record the checksum in `contracts/trademo_bol_v1.yaml` under `source_sha256:`

**Done when:** File exists on disk, checksum recorded.

---

## Step 2 — Day 9 Gate: Inspect real columns (1–2 hours)

- [ ] Open the file and print column names:
      ```
      python -c "import pandas as pd; df = pd.read_csv('trademo_bol_sample_real.csv', nrows=3, dtype=str); print(df.columns.tolist())"
      ```
- [ ] Compare every column name against `contracts/trademo_bol_v1.yaml` line by line.
- [ ] If any column name differs (e.g. `bol_number` instead of `bill_of_lading`):
      - Update the column mapping in `ingestion/loaders/trademo_bol_loader.py`
      - Update the contract in `contracts/trademo_bol_v1.yaml`
      - Do NOT proceed to Step 3 until the contract and loader agree with the real file.
- [ ] Run the existing contract validator against a 100-row sample:
      ```
      python -c "
      from ingestion.loaders.trademo_bol_loader import read_and_validate_trademo_file
      df = read_and_validate_trademo_file('trademo_bol_sample_real.csv')
      print('PASSED — rows:', len(df))
      "
      ```

**Done when:** `read_and_validate_trademo_file` prints PASSED with no DataContractViolation.

---

## Step 3 — Full ingestion run (30 min)

- [ ] Run the loader against the full file:
      ```
      python -m ingestion.loaders.trademo_bol_loader --file trademo_bol_sample_real.csv
      ```
      *(or the equivalent dlt pipeline run — see trademo_bol_loader.py `get_dlt_source`)*
- [ ] Verify bronze row count in PostgreSQL:
      ```sql
      SELECT COUNT(*) FROM bronze_trademo_bol WHERE source_id = 'trademo_bol_v1';
      ```
      Expect: > 0, matches CSV row count.
- [ ] Verify provenance fields populated on every row:
      ```sql
      SELECT COUNT(*) FROM bronze_trademo_bol
      WHERE provenance_id IS NULL OR checksum IS NULL OR ingestion_timestamp IS NULL;
      ```
      Expect: 0 nulls.

**Done when:** Row count > 0, zero provenance nulls.

---

## Step 4 — Day 20 Gate: Re-run entity resolution on real data (2–4 hours)

- [ ] Extract distinct importer names from the real bronze table:
      ```sql
      SELECT DISTINCT raw_importer_name FROM bronze_trademo_bol;
      ```
- [ ] Run entity resolution pipeline against the real names:
      ```
      python -m backend.entity_resolution.run_matching --source real_trademo
      ```
- [ ] Record the new benchmark numbers (replace 10/18 with real figures):
      - Total candidate pairs: ___
      - Matched (MATCH): ___
      - Uncertain (NEEDS_REVIEW): ___
      - False Merges: ___
      - Precision: ___  Recall: ___
- [ ] Update the following files with real numbers:
      - `frontend/pages/api/evidence-demo.ts` lines ~21-35: `matched_records`, `denominator`, `text`
      - `frontend/pages/api/search.ts` line ~19: `coverage` string
      - `frontend/pages/company/[entity_id].tsx` lines ~114-118: coverage card
      - `frontend/pages/search.tsx` line ~51: coverage string in SAMPLE_DATA

**Done when:** All four files updated with real benchmark numbers.

---

## Step 5 — Update framing copy (30 min)

- [ ] In `frontend/pages/index.tsx`: change amber pill from
      `SYNTHETIC SAMPLE RECORDS — PENDING REAL TRADEMO INGESTION`
      to `REAL TRADEMO DATA — SEPT 2022 CBP MANIFEST SAMPLE`
- [ ] In `frontend/pages/index.tsx`: update dataset banner from
      `Synthetic Prototype & Pipeline Scaffolding` to
      `Trademo US Bill of Lading — CBP Ocean Manifest Sample (Sept 1–10, 2022)`
- [ ] In `frontend/pages/api/evidence-demo.ts`: change `data_source_mode` from
      `SYNTHETIC_MOCK_PENDING_REAL_DATA` to `REAL_TRADEMO_HISTORICAL_SAMPLE`
- [ ] In `frontend/pages/api/evidence-demo.ts`: change `compliance_disclaimer` to the
      `REAL_TRADEMO_HISTORICAL_SAMPLE` disclaimer text (see Knowledge Base).
- [ ] In `frontend/components/Hero.tsx`: update pill from
      `Synthetic Sample Records` to `Real CBP Manifest Sample`
- [ ] In `frontend/pages/search.tsx`: update header pill from
      `Synthetic Evaluation Sample` to `Trademo Evaluation Sample`

**Done when:** `grep -r "SYNTHETIC_MOCK_PENDING_REAL_DATA" frontend/` returns zero hits.

---

## Step 6 — Re-run contract violation tests (15 min)

- [ ] `python -m pytest tests/test_contract_violation.py -v`

**Done when:** All tests pass.

---

## Step 7 — Re-capture all four frontend screenshots (30 min)

Run the capture script (must use real Playwright/Edge — no generate_image):
```
python brain/0efbd825-e962-49fc-9353-a700feb47eb9/scratch/capture_fresh_context.py
```
- [ ] Read back DOM text from each image and confirm:
      - Home: `REAL TRADEMO DATA` visible, real matched-pair count visible
      - Search: `Trademo Evaluation Sample` visible, real coverage number visible
      - Company: real `10 / N` (or updated N) visible
      - Review: `Synthetic Review Queue` updated to `Trademo Review Queue`

**Done when:** All four PNGs captured and DOM text verified.

---

## Step 8 — Run full test suite (15 min)

```
python -m pytest tests/ -v
```

**Done when:** All tests pass (or known-skip conditions documented).

---

## Step 9 — Commit and tag

```
git add .
git commit -m "feat(data): swap synthetic benchmark for real Trademo BOL sample (Day 9+20 gates)"
git tag v0.2.0-real-data
git push && git push --tags
```

**Done when:** Tag visible in `git log --oneline -5`.

---

## Total Estimated Time

| Step | Time |
|---|---|
| Download + checksum | < 30 min |
| Day 9 column inspection + validation | 1–2 hours |
| Full ingestion run | 30 min |
| Day 20 entity resolution re-run | 2–4 hours |
| Framing copy update | 30 min |
| Tests | 15 min |
| Screenshots | 30 min |
| Final test suite + commit | 15 min |
| **Total** | **5–8 hours (1 working day)** |
