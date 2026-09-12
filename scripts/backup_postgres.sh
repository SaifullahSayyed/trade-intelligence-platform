#!/bin/bash
# =============================================================
# Automated PostgreSQL Backup Script
# =============================================================
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/postgres}"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
POSTGRES_DB="${POSTGRES_DB:-trade_intelligence}"
POSTGRES_USER="${POSTGRES_USER:-ti_user}"
POSTGRES_HOST="${POSTGRES_HOST:-postgres}"
BACKUP_FILE="${BACKUP_DIR}/ti_postgres_${TIMESTAMP}.sql.gz"

mkdir -p "${BACKUP_DIR}"

echo "[$(date -u)] Starting PostgreSQL backup for ${POSTGRES_DB}..."
PGPASSWORD="${POSTGRES_PASSWORD}" pg_dump -h "${POSTGRES_HOST}" -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" --clean --if-exists | gzip > "${BACKUP_FILE}"

echo "[$(date -u)] Backup successfully created at ${BACKUP_FILE}"

# Retention: Delete local backups older than 30 days
find "${BACKUP_DIR}" -name "ti_postgres_*.sql.gz" -mtime +30 -delete
echo "[$(date -u)] Retention cleanup completed."
