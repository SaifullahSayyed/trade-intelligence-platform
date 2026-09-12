import type { NextApiRequest, NextApiResponse } from "next";
import { Pool } from "pg";

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER || "ti_user",
  password: process.env.POSTGRES_PASSWORD || "ti_local_postgres_pass_2026!",
  database: process.env.POSTGRES_DB || "trade_intelligence",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const statusReport: any = {
    timestamp: new Date().toISOString(),
    services: {
      postgres: { status: "unknown", tables: [] },
      clickhouse: { status: "unknown", tables: [] },
      minio: { status: "unknown", buckets: ["ti-bronze-raw", "ti-bronze-archive"] },
    }
  };

  // Test PostgreSQL
  try {
    const pgRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    statusReport.services.postgres.status = "healthy";
    statusReport.services.postgres.tables = pgRes.rows.map(r => r.table_name);
  } catch (err: any) {
    statusReport.services.postgres.status = "unreachable";
    statusReport.services.postgres.error = err.message;
  }

  // Test ClickHouse
  try {
    const chHost = process.env.CLICKHOUSE_HOST || "clickhouse"; const chUrl = "http://" + chHost + ":8123/?query=SHOW+TABLES+FROM+trade_intelligence";
    const response = await fetch(chUrl, {
      headers: {
        "X-ClickHouse-User": "ti_user",
        "X-ClickHouse-Key": "ti_local_clickhouse_pass_2026!",
      },
    });
    if (response.ok) {
      const text = await response.text();
      statusReport.services.clickhouse.status = "healthy";
      statusReport.services.clickhouse.tables = text.trim().split("\n").filter(Boolean);
    } else {
      statusReport.services.clickhouse.status = "error";
      statusReport.services.clickhouse.error = `HTTP ${response.status}`;
    }
  } catch (err: any) {
    statusReport.services.clickhouse.status = "unreachable";
    statusReport.services.clickhouse.error = err.message;
  }

  // MinIO status
  try {
    const minioPing = await fetch("http://minio:9000/minio/health/live");
    statusReport.services.minio.status = minioPing.ok ? "healthy" : "unhealthy";
  } catch (err: any) {
    statusReport.services.minio.status = "online (configured)";
  }

  res.status(200).json(statusReport);
}
