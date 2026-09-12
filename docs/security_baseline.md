# Trade Intelligence Platform — Security Baseline Architecture

This document formalizes the Day 1–8 Security Baseline required by Section 7 of the Build Brief.

---

## 1. Secrets Management
* **Zero Hardcoded Secrets**: No passwords, private keys, API tokens, or HMAC secrets are stored in Git repositories or source code.
* **Environment Configuration**: Secrets are injected strictly via container environment variables (`.env` locally, Docker/Kubernetes secrets in production).
* **Git Pre-commit / Scan Protection**: `.gitignore` strictly rejects `.env`, `.env.*`, `*.pem`, `*.key`, and credential certificates. Regular automated scans (`git grep`) are run before each checkpoint release.

---

## 2. Multi-Store Tenant Isolation (Brief §2 Rule 5)
PostgreSQL Row-Level Security (RLS) does NOT protect ClickHouse, OpenSearch, MinIO, or cache layers.
Tenant isolation is enforced independently at application layer via `backend/auth/authorization_service.py`:
1. **PostgreSQL**: Queries enforce `tenant_id` context binding and parameterization.
2. **ClickHouse**: Analytical queries receive explicit tenant filter clauses injected dynamically.
3. **OpenSearch**: Search queries enforce mandatory `bool.filter.term.tenant_id` injection on all queries.
4. **MinIO / R2**: Storage paths are segmented by tenant namespace: `<bucket>/<tenant_id>/<dataset>/...`.

---

## 3. Encryption in Transit & at Rest
* **In Transit**:
  * All external web traffic terminates via TLS (HTTPS / WSS).
  * Inter-container communication inside production VPC is encrypted with mTLS or private network isolation.
* **At Rest**:
  * **PostgreSQL**: Tablespaces encrypted with disk-level encryption (LUKS / EBS KMS encryption) + `pgcrypto` for sensitive identifiers.
  * **ClickHouse**: Storage volumes configured on encrypted block devices.
  * **OpenSearch**: Node-level index encryption enabled via `plugins.security`.
  * **MinIO / Cloudflare R2**: Server-Side Encryption (SSE-S3 / SSE-KMS) enabled by default.

---

## 4. Authentication & MFA (Keycloak)
* **Identity Provider**: Self-hosted Keycloak 24.0 instance (OIDC / OAuth 2.0).
* **MFA Enforcement**: Keycloak realm configured with TOTP (Google Authenticator / FreeOTP) required for all interactive users.
* **Service Accounts**: Ingestion and background jobs use discrete OAuth client credentials with bounded scopes.

---

## 5. Security & Provenance Audit Logging
* Every search query, entity lookup, data export, human review decision, and AI explanation request is recorded in `audit_log` with:
  * `actor_id`, `actor_type`, `tenant_id`, `action`, `resource_type`, `resource_id`
  * Timestamp (UTC), IP address, and status (`SUCCESS` / `DENIED` / `ERROR`).

---

## 6. Automated Backup Strategy
* **PostgreSQL**: Daily `pg_dump` snapshot script (`scripts/backup_postgres.sh`) with retention of 30 days.
* **ClickHouse**: Periodic native partition backups (`scripts/backup_clickhouse.sh`) targeting MinIO/R2 object storage.
