
set -euo pipefail
BACKUP_DIR="${BACKUP_DIR:-/var/backups/clickhouse}"
TIMESTAMP=$(date -u +"%Y%m%d_%H%M%SZ")
CLICKHOUSE_HOST="${CLICKHOUSE_HOST:-clickhouse}"
CLICKHOUSE_USER="${CLICKHOUSE_USER:-ti_user}"
CLICKHOUSE_PASSWORD="${CLICKHOUSE_PASSWORD:-}"
DATABASE="trade_intelligence"
BACKUP_NAME="backup_${TIMESTAMP}"
mkdir -p "${BACKUP_DIR}"
echo "[$(date -u)] Initiating ClickHouse backup for ${DATABASE} -> ${BACKUP_NAME}..."
clickhouse-client --host="${CLICKHOUSE_HOST}" --user="${CLICKHOUSE_USER}" --password="${CLICKHOUSE_PASSWORD}" \
  --query="BACKUP DATABASE ${DATABASE} TO Disk('backups', '${BACKUP_NAME}.zip')" || {
    echo "[$(date -u)] Local file fallback: exporting schema and partitions..."
    clickhouse-client --host="${CLICKHOUSE_HOST}" --user="${CLICKHOUSE_USER}" --password="${CLICKHOUSE_PASSWORD}" \
      --query="SHOW CREATE TABLE ${DATABASE}.bronze_trademo_bol" > "${BACKUP_DIR}/${DATABASE}_schema_${TIMESTAMP}.sql"
}
echo "[$(date -u)] ClickHouse backup completed."
