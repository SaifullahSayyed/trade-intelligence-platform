import React, { useState, useEffect } from "react";
import Head from "next/head";
import { 
  Database, 
  ShieldCheck, 
  FileText, 
  Layers, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Info,
  ExternalLink,
  Code2,
  Lock
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"infrastructure" | "evidence" | "schemas" | "contracts">("infrastructure");
  const [healthData, setHealthData] = useState<any>(null);
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [hRes, eRes] = await Promise.all([
          fetch("/api/health"),
          fetch("/api/evidence-demo")
        ]);
        const hJson = await hRes.json();
        const eJson = await eRes.json();
        setHealthData(hJson);
        setEvidenceData(eJson);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Head>
        <title>Trade Intelligence Platform — Foundation Dashboard</title>
      </Head>

      {/* Top Banner */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Trade Intelligence Platform</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Phase 1 Foundation Live
                </span>
              </div>
              <p className="text-xs text-slate-400">U.S. Import Corridor • Real CBP Manifest Pipeline</p>
            </div>
          </div>

          {/* Framing Warning Badge */}
          <div className="flex items-center gap-2 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 px-3 py-1.5 rounded-md">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Built and proven on real CBP records (Sept 1–10, 2022); live ingestion is the next step once funded.</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 space-x-8 mb-8">
          <button
            onClick={() => setActiveTab("infrastructure")}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "infrastructure"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Server className="w-4 h-4" />
            Live Infrastructure Status
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "evidence"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Evidence & Trust Layer Preview
          </button>
          <button
            onClick={() => setActiveTab("schemas")}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "schemas"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Layers className="w-4 h-4" />
            Canonical Schema Architecture
          </button>
          <button
            onClick={() => setActiveTab("contracts")}
            className={`flex items-center gap-2 pb-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "contracts"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileText className="w-4 h-4" />
            Data Contracts & Policy
          </button>
        </div>

        {/* Tab 1: Live Infrastructure */}
        {activeTab === "infrastructure" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PostgreSQL Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Database className="w-5 h-5 text-blue-400" />
                    <h3 className="font-semibold text-white">PostgreSQL 16</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {healthData?.services?.postgres?.status?.toUpperCase() || "CONNECTING..."}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Transactional DB: Canonical Shipments, Provenance, Field Values, Review Queue, Multi-Tenancy.
                </p>
                <div className="text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-slate-400">Host: localhost:5432</div>
                  <div className="text-slate-400">Database: trade_intelligence</div>
                  <div className="text-blue-400 font-semibold pt-1">
                    Active Tables ({healthData?.services?.postgres?.tables?.length || 0}):
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-0.5 text-slate-300">
                    {healthData?.services?.postgres?.tables?.map((tbl: string) => (
                      <div key={tbl} className="flex items-center gap-1">
                        <span className="text-slate-600">•</span>
                        <span>{tbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ClickHouse Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Server className="w-5 h-5 text-amber-400" />
                    <h3 className="font-semibold text-white">ClickHouse 24.3</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    {healthData?.services?.clickhouse?.status?.toUpperCase() || "CONNECTING..."}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Analytical DB: Bronze append-only raw tables, Silver normalized, and Gold materialized aggregates.
                </p>
                <div className="text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-slate-400">HTTP: localhost:8123 | Native: 9000</div>
                  <div className="text-slate-400">Database: trade_intelligence</div>
                  <div className="text-amber-400 font-semibold pt-1">
                    Active Tables ({healthData?.services?.clickhouse?.tables?.length || 0}):
                  </div>
                  <div className="max-h-32 overflow-y-auto space-y-0.5 text-slate-300">
                    {healthData?.services?.clickhouse?.tables?.map((tbl: string) => (
                      <div key={tbl} className="flex items-center gap-1">
                        <span className="text-slate-600">•</span>
                        <span>{tbl}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MinIO Storage Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <Layers className="w-5 h-5 text-purple-400" />
                    <h3 className="font-semibold text-white">MinIO (S3 Drop Zone)</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    ONLINE
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Object Storage: S3-compatible raw file drop zone and immutable SHA-256 archive staging.
                </p>
                <div className="text-xs font-mono bg-slate-950 p-3 rounded border border-slate-800 space-y-2">
                  <div className="text-slate-400">Console: <a href="http://localhost:9003" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">http://localhost:9003</a></div>
                  <div className="text-purple-400 font-semibold pt-1">Initialized Buckets:</div>
                  <div className="space-y-1 text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>ti-bronze-raw</span>
                      <span className="text-slate-500 text-[10px]">(Raw upload staging)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                      <span>ti-bronze-archive</span>
                      <span className="text-slate-500 text-[10px]">(Immutable archive)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Platform Security Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <Lock className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Independent Multi-Store Tenant Isolation (Brief §2 Rule 5)</h3>
              </div>
              <p className="text-sm text-slate-400 mb-4">
                PostgreSQL row-level security (RLS) does NOT protect ClickHouse, OpenSearch, or object storage. 
                Our platform enforces isolation through the central <code className="text-blue-300 bg-slate-800 px-1.5 py-0.5 rounded text-xs">AuthorizationService</code>:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-blue-400 mb-1">PostgreSQL Isolation</div>
                  <div className="text-slate-400">Tenant context binding on parameterised queries + audit trail logging.</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-amber-400 mb-1">ClickHouse Isolation</div>
                  <div className="text-slate-400">Mandatory tenant filter clause dynamically injected on analytical queries.</div>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <div className="font-semibold text-emerald-400 mb-1">OpenSearch Isolation</div>
                  <div className="text-slate-400">Mandatory <code className="text-slate-300">bool.filter.term.tenant_id</code> injected on all search queries.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Evidence & Trust Layer */}
        {activeTab === "evidence" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-bold text-white">Bill of Lading: {evidenceData?.bill_of_lading}</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      Entity Confidence: {evidenceData?.entity_resolution?.confidence_tier}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Shipment ID: <span className="font-mono text-slate-300">{evidenceData?.shipment_id}</span>
                  </p>
                </div>

                {/* Trust Layer Metrics */}
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
                  <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">Entity Resolution Coverage</span>
                    <span className="text-emerald-400 font-bold">{evidenceData?.entity_resolution?.coverage?.text}</span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-lg">
                    <span className="text-slate-400 block text-[10px] uppercase">Matching Model</span>
                    <span className="text-slate-200 font-mono">{evidenceData?.entity_resolution?.model_version}</span>
                  </div>
                </div>
              </div>

              {/* Three Timestamps Display (Brief §8) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Source Timestamp</span>
                  </div>
                  <div className="text-sm font-mono text-white font-medium">{evidenceData?.timestamps?.source_timestamp}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Recorded arrival date from carrier</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Ingestion Timestamp</span>
                  </div>
                  <div className="text-sm font-mono text-white font-medium">{evidenceData?.timestamps?.ingestion_timestamp}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Landed into immutable Bronze layer</div>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <Clock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Normalization Timestamp</span>
                  </div>
                  <div className="text-sm font-mono text-white font-medium">{evidenceData?.timestamps?.normalization_timestamp}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Transformed into canonical Silver format</div>
                </div>
              </div>

              {/* Raw vs Normalized vs Derived Field Value Preservation Table */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-white">
                    Field Values Provenance (Brief §2 Rule 4: Never Overwrite Source Values)
                  </h3>
                  <span className="text-xs text-slate-400">Values preserved across raw, normalized, and derived states</span>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Field</th>
                        <th className="px-4 py-3">Raw Value (Source)</th>
                        <th className="px-4 py-3">Normalized Value</th>
                        <th className="px-4 py-3">Derived / Enriched</th>
                        <th className="px-4 py-3">Missingness Reason</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {evidenceData?.fields?.map((field: any) => (
                        <tr key={field.field_name} className="hover:bg-slate-800/30">
                          <td className="px-4 py-3 font-sans font-medium text-slate-300">
                            {field.label}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {field.raw_value ? field.raw_value : <span className="text-slate-600 italic">—</span>}
                          </td>
                          <td className="px-4 py-3 text-blue-300 font-semibold">
                            {field.normalized_value ? field.normalized_value : <span className="text-slate-600 italic">—</span>}
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {field.derived_value ? field.derived_value : <span className="text-slate-600 italic">—</span>}
                          </td>
                          <td className="px-4 py-3 font-sans">
                            {field.missingness ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30">
                                {field.missingness.reason}
                              </span>
                            ) : (
                              <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Present
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Provenance Footer */}
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row justify-between gap-2">
                <div>
                  <span className="font-semibold text-slate-300">Source: </span>
                  {evidenceData?.provenance?.source_name} ({evidenceData?.provenance?.jurisdiction})
                </div>
                <div>
                  <span className="font-semibold text-slate-300">SHA-256 Checksum: </span>
                  <span className="font-mono text-slate-400 text-[11px]">{evidenceData?.provenance?.checksum_sha256}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Canonical Schemas */}
        {activeTab === "schemas" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">Canonical Data Schema Architecture (Brief §5)</h2>
              <p className="text-sm text-slate-400 mb-6">
                Data pipeline progresses strictly through immutable Bronze → canonical Silver → aggregated Gold layers.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-amber-400">Bronze Layer</h3>
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                      ClickHouse
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Raw, uncoerced, immutable append-only tables. Partitioned by month of ingestion.
                  </p>
                  <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>bronze_trademo_bol</li>
                    <li>bronze_oec_botmarket</li>
                    <li className="text-slate-500">provenance_id, checksum, license_ref stamped on every row</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-blue-400">Silver Layer</h3>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                      Postgres & ClickHouse
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Normalized canonical schema. Stripped company legal suffixes, validated HS codes, separate timestamps.
                  </p>
                  <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>shipments</li>
                    <li>field_values (raw/norm/derived)</li>
                    <li>field_missingness (5 enum reasons)</li>
                    <li>provenance_records</li>
                  </ul>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-emerald-400">Gold Layer</h3>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                      Materialized
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-3">
                    Business-ready entities and trade analytics for rapid search and profile views.
                  </p>
                  <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc pl-4">
                    <li>canonical_entities</li>
                    <li>gold_company_trade_metrics</li>
                    <li>gold_corridor_hs_metrics</li>
                    <li>mv_gold_importer_metrics</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Data Contracts */}
        {activeTab === "contracts" && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-bold text-white mb-2">Data Contracts & Quality Enforcement (Brief §5)</h2>
              <p className="text-sm text-slate-400 mb-6">
                If the source schema changes unexpectedly (e.g., a field changes type), the pipeline fails loudly and stops — never silently coercing.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Contract 1 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">trademo_bol_v1.yaml</h3>
                    <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                      on_schema_change: FAIL
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-4">
                    <div><span className="text-slate-300 font-semibold">Source:</span> Trademo US Bill of Lading Evaluation Sample</div>
                    <div><span className="text-slate-300 font-semibold">Channel:</span> AWS Data Exchange</div>
                    <div><span className="text-slate-300 font-semibold">Evaluation Window:</span> Sept 1–10, 2022 (Fixed Historical)</div>
                    <div><span className="text-slate-300 font-semibold">Jurisdiction:</span> US (19 C.F.R. § 103.31 Public Record)</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                    <div className="text-blue-400 font-semibold">Required Columns (Non-Nullable):</div>
                    <div>• bill_of_lading (string)</div>
                    <div>• shipment_date (date)</div>
                    <div>• importer_name (string)</div>
                  </div>
                </div>

                {/* Contract 2 */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-white">oec_botmarket_v1.yaml</h3>
                    <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                      Budget Cap: 50 Queries
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 space-y-1 mb-4">
                    <div><span className="text-slate-300 font-semibold">Source:</span> OEC BotMarket API ($0.01/query)</div>
                    <div><span className="text-slate-300 font-semibold">Data Nature:</span> Aggregated Macro Trade (Country/HS4 level)</div>
                    <div><span className="text-slate-300 font-semibold">Hard Limit:</span> Max 50 queries per pipeline run</div>
                    <div><span className="text-slate-300 font-semibold">Purpose:</span> Supplementary live freshness validation</div>
                  </div>
                  <div className="p-3 bg-slate-900 rounded border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                    <div className="text-amber-400 font-semibold">Safety & AI Policy Guardrails (Brief §2 Rule 6):</div>
                    <div>• Banned output patterns strictly filtered (compliance conclusions, fraud judgments)</div>
                    <div>• AI provides citation-only explanations referencing shipment records</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
