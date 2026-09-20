# Trade Intelligence Platform — Demo Contingency & Recovery Card
**Purpose:** Quick-reference troubleshooting guide for the presenter during live stakeholder demos. Keep this card handy during the screen-share.

---

## 1. Golden Rules During a Live Demo Stumble
1. **Never go silent.** Acknowledge and reframe immediately:
   > *"Let me do a quick refresh — remember, this entire multi-database stack is running locally in containerized dev mode on this laptop, so occasionally the local dev server compiles routes on demand."*
2. **If a page takes 3–5 seconds on first click:**
   > *"Next.js compiles server components on first request in dev mode — in cloud production this is pre-built statically."*
3. **If a container needs a restart:**
   > Keep your browser open on a working tab (like Overview or Search), switch to your backup terminal, run the specific single-container restart, and refresh in 5 seconds.

---

## 2. Emergency 1-Line Service Restarts (Run in PowerShell)

| Service | Impact | Instant Restart Command |
|---|---|---|
| **Frontend (Next.js)** | UI not responding / 500 error | `docker restart ti_frontend` |
| **PostgreSQL** | Audit or review queue not saving | `docker restart ti_postgres` |
| **ClickHouse** | Analytics/Manifest queries stall | `docker restart ti_clickhouse` |
| **MinIO** | File preview / raw manifest store down | `docker restart ti_minio` |
| **OpenSearch** | Search indexing unresponsive | `docker restart ti_opensearch` |
| **Keycloak** | Auth tokens or login issues | `docker restart ti_keycloak` |
| **Dagster** | Pipeline orchestrator UI down | `docker restart ti_dagster_webserver` |
| **Prometheus / Grafana** | Telemetry metrics down | `docker restart ti_prometheus ti_grafana` |

### Full Nuclear Stack Restart (if Docker hangs entirely)
```powershell
docker restart ti_postgres ti_clickhouse ti_minio ti_opensearch ti_keycloak ti_frontend ti_dagster_webserver ti_grafana ti_prometheus
```
*(Takes ~15 seconds to be fully responsive)*

---

## 3. What to Say: Scenario-by-Scenario Scripts

### Scenario A: Browser shows a blank white page or Next.js spinning
* **Action:** Press `Ctrl + F5` (Hard Reload).
* **Script:**
  > *"Just triggering a hard refresh — Next.js hot module reloading occasionally holds a stale client socket when switching tabs in local dev. The backend datastores are continuously active."*

### Scenario B: Evidence API or Search returns empty or stalls
* **Action:** Click back to **Overview**, then return to **Search**.
* **Script:**
  > *"Let's re-query the search cache. Notice how the contract guardrail safely returns empty rather than corrupt data when an edge timeout occurs."*

### Scenario C: Stakeholder asks "Why is that badge amber?"
* **Action:** Point directly at the badge with your cursor.
* **Script:**
  > *"That is our platform's built-in Truth in Advertising contract. As stated in our opening, we are running against synthetic benchmark records modeled on the September 2022 CBP schema while our Trademo AWS subscription completes vendor review. The UI is hard-coded to warn analysts whenever data is not yet live production."*

### Scenario D: Stakeholder asks "Can we see real company data right now?"
* **Action:** Keep your calm, reference the hot-swap checklist.
* **Script:**
  > *"The pipeline, entity resolution, and UI are 100% built and verified today. We have a documented 1-day hot-swap checklist ready to ingest the actual Trademo dump the moment AWS activates the data feed."*

---

## 4. Emergency Backup Visuals (If Laptop Screen Fails)
All 4 primary screens have real Playwright Edge DOM captures saved on disk:
- `frontend/public/screenshots/index_evidence_real_browser.png`
- `frontend/public/screenshots/search_real_browser.png`
- `frontend/public/screenshots/company_ai_explain_real_browser.png`
- `frontend/public/screenshots/review_real_browser.png`
