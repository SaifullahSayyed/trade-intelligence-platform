import React, { useState, useEffect } from "react";
import Head from "next/head";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
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
  Lock,
  ArrowDown
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
    const interval = setInterval(fetchData, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      <Head>
        <title>Orchid Trade Intelligence — U.S. Import Corridor</title>
      </Head>

      {/* Hero & Fixed Navbar */}
      <Navbar />
      <Hero />

      {/* Dashboard Section */}
      <section id="dashboard" className="relative z-20 bg-slate-950 border-t border-slate-900 pt-16 pb-24">
        {/* Compliance and Data Window Notice Banner */}
        <div className="max-w-7xl mx-auto px-6 mb-10">
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-amber-200">
                  Real CBP Ocean Manifest Evaluation Dataset (September 1–10, 2022)
                </h4>
                <p className="text-xs text-amber-300/80 mt-0.5">
                  Built and proven on real U.S. customs bill-of-lading records; live ingestion pipeline runs automatically once live feed is authorized.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono px-3 py-1 rounded bg-amber-500/20 text-amber-200 whitespace-nowrap">
              19 C.F.R. § 103.31 Public Record
            </span>
          </div>
        </div>

        {/* Interactive Dashboard Container */}
        <div className="max-w-7xl mx-auto px-6">
          {/* Tabs Navigation */}
          <div className="flex flex-wrap border-b border-slate-800 gap-2 md:gap-8 mb-8">
            <button
              onClick={() => setActiveTab("infrastructure")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === "infrastructure"
                  ? "border-blue-500 text-blue-400 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Server className="w-4 h-4" />
              Live Infrastructure
            </button>
            <button
              onClick={() => setActiveTab("evidence")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === "evidence"
                  ? "border-blue-500 text-blue-400 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Evidence & Trust Layer
            </button>
            <button
              onClick={() => setActiveTab("schemas")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === "schemas"
                  ? "border-blue-500 text-blue-400 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              Canonical Schemas (Bronze / Silver / Gold)
            </button>
            <button
              onClick={() => setActiveTab("contracts")}
              className={`flex items-center gap-2 pb-3.5 text-sm font-medium transition-all border-b-2 ${
                activeTab === "contracts"
                  ? "border-blue-500 text-blue-400 shadow-sm"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              Data Contracts & Guardrails
            </button>
          </div>

          {/* TAB 1: Infrastructure */}
          {activeTab === "infrastructure" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* PostgreSQL */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <Database className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-white">PostgreSQL 16</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {healthData?.services?.postgres?.status?.toUpperCase() || "CONNECTING..."}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    Transactional core: shipments, provenance, preserved raw/norm/derived values, entity resolution review queue.
                  </p>
                  <div className="text-xs font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-500">Host: localhost:5432 • ti_user</div>
                    <div className="text-blue-400 font-semibold pt-1">
                      Active Tables ({healthData?.services?.postgres?.tables?.length || 0}):
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 text-slate-300 pr-1">
                      {healthData?.services?.postgres?.tables?.map((tbl: string) => (
                        <div key={tbl} className="flex items-center gap-1.5">
                          <span className="text-slate-600">•</span>
                          <span>{tbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ClickHouse */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
                        <Server className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-white">ClickHouse 24.3</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {healthData?.services?.clickhouse?.status?.toUpperCase() || "CONNECTING..."}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    High-performance analytical engine: raw immutable Bronze manifests, normalized Silver, and Gold aggregates.
                  </p>
                  <div className="text-xs font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-1">
                    <div className="text-slate-500">HTTP: localhost:8123 • Native: 9000</div>
                    <div className="text-amber-400 font-semibold pt-1">
                      Active Tables ({healthData?.services?.clickhouse?.tables?.length || 0}):
                    </div>
                    <div className="max-h-36 overflow-y-auto space-y-1 text-slate-300 pr-1">
                      {healthData?.services?.clickhouse?.tables?.map((tbl: string) => (
                        <div key={tbl} className="flex items-center gap-1.5">
                          <span className="text-slate-600">•</span>
                          <span>{tbl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* MinIO */}
                <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="font-semibold text-white">MinIO (S3 Drop Zone)</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                    S3-compatible object storage staging raw manifest files and immutable checksummed archives before ingestion.
                  </p>
                  <div className="text-xs font-mono bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <div className="text-slate-400">
                      Console: <a href="http://localhost:9003" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline">http://localhost:9003</a>
                    </div>
                    <div className="text-purple-400 font-semibold pt-1">Initialized Storage Buckets:</div>
                    <div className="space-y-1 text-slate-300">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span>ti-bronze-raw</span>
                        <span className="text-slate-500 text-[10px]">(Staging Drop Zone)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                        <span>ti-bronze-archive</span>
                        <span className="text-slate-500 text-[10px]">(SHA-256 Archive)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Independent Tenant Isolation Card */}
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-5 h-5 text-blue-400" />
                  <h3 className="font-semibold text-white">Multi-Store Tenant Isolation (Brief §2 Rule 5)</h3>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  PostgreSQL Row-Level Security (RLS) does NOT protect ClickHouse or OpenSearch. Authorization is enforced across all datastores independently:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-blue-400 font-sans font-semibold mb-1">PostgreSQL Isolation</div>
                    <div className="text-slate-400">Parameterised queries with mandatory tenant_id context & audit log logging.</div>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-amber-400 font-sans font-semibold mb-1">ClickHouse Isolation</div>
                    <div className="text-slate-400">Dynamic tenant filter clause injected into analytical queries before execution.</div>
                  </div>
                  <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800/80">
                    <div className="text-emerald-400 font-sans font-semibold mb-1">OpenSearch Isolation</div>
                    <div className="text-slate-400">Mandatory bool.filter term injected into every search document query.</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Evidence & Trust Layer */}
          {activeTab === "evidence" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5 mb-6">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-white">Bill of Lading: {evidenceData?.bill_of_lading}</h2>
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/40">
                        Entity Confidence: {evidenceData?.entity_resolution?.confidence_tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Shipment UUID: {evidenceData?.shipment_id}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-950 border border-slate-800 px-4 py-2 rounded-xl text-xs">
                      <span className="text-slate-400 block text-[10px] uppercase font-semibold">Entity Resolution Coverage</span>
                      <span className="text-emerald-400 font-bold">{evidenceData?.entity_resolution?.coverage?.text}</span>
                    </div>
                  </div>
                </div>

                {/* 3 Separated Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      <span>Source Timestamp</span>
                    </div>
                    <div className="text-sm font-mono text-white font-medium">{evidenceData?.timestamps?.source_timestamp}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Recorded arrival on customs manifest</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ingestion Timestamp</span>
                    </div>
                    <div className="text-sm font-mono text-white font-medium">{evidenceData?.timestamps?.ingestion_timestamp}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Landed into immutable Bronze layer</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                      <Clock className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Normalization Timestamp</span>
                    </div>
                    <div className="text-sm font-mono text-white font-medium">{evidenceData?.timestamps?.normalization_timestamp}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Transformed into canonical Silver schema</div>
                  </div>
                </div>

                {/* Raw vs Normalized vs Derived Field Value Preservation */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">
                      Field Values Provenance (Brief §2 Rule 4: Never Overwrite Source Values)
                    </h3>
                    <span className="text-xs text-slate-400">Raw, normalized, and derived values stored separately</span>
                  </div>

                  <div className="border border-slate-800 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3.5">Field</th>
                          <th className="px-4 py-3.5">Raw Value (Source)</th>
                          <th className="px-4 py-3.5">Normalized Value</th>
                          <th className="px-4 py-3.5">Derived / Enriched</th>
                          <th className="px-4 py-3.5">Missingness Reason</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono">
                        {evidenceData?.fields?.map((f: any) => (
                          <tr key={f.field_name} className="hover:bg-slate-800/40 transition-colors">
                            <td className="px-4 py-3 font-sans font-medium text-slate-200">{f.label}</td>
                            <td className="px-4 py-3 text-slate-400">{f.raw_value || <span className="text-slate-600">—</span>}</td>
                            <td className="px-4 py-3 text-blue-300 font-semibold">{f.normalized_value || <span className="text-slate-600">—</span>}</td>
                            <td className="px-4 py-3 text-slate-300">{f.derived_value || <span className="text-slate-600">—</span>}</td>
                            <td className="px-4 py-3 font-sans">
                              {f.missingness ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-red-500/10 text-red-400 border border-red-500/30" title={f.missingness.description}>
                                  {f.missingness.reason}
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

                {/* Provenance Record Footer */}
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row justify-between gap-2">
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

          {/* TAB 3: Canonical Schemas */}
          {activeTab === "schemas" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-2">Canonical Data Schema Architecture (Brief §5)</h2>
                <p className="text-xs text-slate-400 mb-6">
                  End-to-end lineage: Immutable raw Bronze → Normalized Silver canonical records → Business Gold entities.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-amber-400">Bronze Layer</h3>
                      <span className="text-[10px] font-mono bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded">
                        ClickHouse
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Raw, uncoerced, immutable append-only tables. Partitioned by month of ingestion.
                    </p>
                    <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc pl-4">
                      <li>bronze_trademo_bol</li>
                      <li>bronze_oec_botmarket</li>
                      <li className="text-slate-500">provenance_id, checksum, license_ref stamped on every row</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-blue-400">Silver Layer</h3>
                      <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded">
                        Postgres & ClickHouse
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Canonical normalized schema. Stripped company legal suffixes, zero-padded HS codes, separate timestamps.
                    </p>
                    <ul className="text-xs font-mono text-slate-300 space-y-1.5 list-disc pl-4">
                      <li>shipments</li>
                      <li>field_values (raw/norm/derived)</li>
                      <li>field_missingness (5 enum reasons)</li>
                      <li>provenance_records</li>
                    </ul>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-emerald-400">Gold Layer</h3>
                      <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded">
                        Materialized
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                      Business-ready entities and trade analytics for rapid company search and profile views.
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

          {/* TAB 4: Data Contracts */}
          {activeTab === "contracts" && (
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl">
                <h2 className="text-lg font-bold text-white mb-2">Data Contracts & Failure-Loud Guardrails (Brief §5)</h2>
                <p className="text-xs text-slate-400 mb-6">
                  Every source requires a strict contract. If schema changes unexpectedly, the pipeline stops immediately — never silently coercing.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">trademo_bol_v1.yaml</h3>
                      <span className="text-xs font-bold text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded">
                        on_schema_change: FAIL
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 mb-4 font-mono">
                      <div>Source: Trademo US Bill of Lading Evaluation Sample</div>
                      <div>Channel: AWS Data Exchange</div>
                      <div>Window: Sept 1–10, 2022 (Fixed Historical)</div>
                      <div>Jurisdiction: US (19 C.F.R. § 103.31)</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                      <div className="text-blue-400 font-semibold">Non-Nullable Required Fields:</div>
                      <div>• bill_of_lading (string)</div>
                      <div>• shipment_date (date)</div>
                      <div>• importer_name (string)</div>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-white">oec_botmarket_v1.yaml</h3>
                      <span className="text-xs font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                        Cap: 50 Queries ($0.50)
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 space-y-1 mb-4 font-mono">
                      <div>Source: OEC BotMarket API ($0.01/query)</div>
                      <div>Data Type: Aggregated Macro Trade Statistics</div>
                      <div>Safety Limit: Max 50 queries per pipeline run</div>
                      <div>Purpose: Supplementary live freshness check</div>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs font-mono text-slate-300 space-y-1">
                      <div className="text-amber-400 font-semibold">AI Output Guardrails (Brief §2 Rule 6):</div>
                      <div>• Banned patterns: compliance conclusions & fraud labels</div>
                      <div>• Allowed: cite-only verified shipment evidence</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
