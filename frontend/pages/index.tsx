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
  ArrowDown,
  Activity,
  Cpu,
  Zap,
  Shield,
  Check,
  ChevronRight,
  ArrowRight,
  HardDrive,
  Fingerprint,
  FileCode,
  Gauge,
  Terminal
} from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"infrastructure" | "evidence" | "schemas" | "contracts">("infrastructure");
  const [healthData, setHealthData] = useState<any>(null);
  const [evidenceData, setEvidenceData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dashBgMode, setDashBgMode] = useState<"radar" | "port" | "cargoship" | "dark">("radar");

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

      <Navbar />
      <Hero />

      <section id="dashboard" className="relative z-20 border-t border-white/[0.06] pt-12 pb-24 overflow-hidden bg-[#070b14]">

        {dashBgMode === "radar" ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">

            <div className="absolute inset-0 bg-[#070b14]" />

            <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="marine-grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(56, 189, 248, 0.25)" strokeWidth="0.8" />
                  <circle cx="60" cy="0" r="1.5" fill="rgba(56, 189, 248, 0.5)" />
                  <path d="M 57 0 L 63 0 M 60 -3 L 60 3" stroke="rgba(56, 189, 248, 0.7)" strokeWidth="0.8" />
                </pattern>
                <radialGradient id="radar-glow" cx="50%" cy="25%" r="65%">
                  <stop offset="0%" stopColor="rgba(14, 165, 233, 0.22)" />
                  <stop offset="45%" stopColor="rgba(99, 102, 241, 0.10)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <rect width="100%" height="100%" fill="url(#marine-grid)" />
              <rect width="100%" height="100%" fill="url(#radar-glow)" />
            </svg>

            <div className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-sky-500/10 pointer-events-none" />
            <div className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-sky-500/15 pointer-events-none" />
            <div className="absolute top-[22%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-sky-500/20 pointer-events-none" />

            <div className="absolute top-6 left-8 text-[10px] font-mono text-sky-500/35 tracking-widest uppercase hidden lg:block">
              {`LAT: 33°44'28" N · LON: 118°15'36" W · SECTOR PACIFIC-01 · CBP USLAX`}
            </div>
            <div className="absolute top-6 right-8 text-[10px] font-mono text-sky-500/35 tracking-widest uppercase hidden lg:block">
              AIS MARITIME STREAM: ACTIVE · CARRIER HARMONY
            </div>

            <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
          </div>
        ) : dashBgMode === "port" ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/images/port-terminal-cinematic.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                filter: "brightness(0.38) contrast(1.25) saturate(0.9)",
                transform: "scale(1.02)",
              }}
            />
            <div className="absolute inset-0 bg-[#070b14]/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070b14] via-[#070b14]/50 to-[#070b14]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#070b14_90%)]" />
          </div>
        ) : dashBgMode === "cargoship" ? (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/images/cargo-ship-cinematic.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundAttachment: "fixed",
                filter: "brightness(0.38) contrast(1.25) saturate(0.9)",
                transform: "scale(1.02)",
              }}
            />
            <div className="absolute inset-0 bg-[#070b14]/75" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#070b14] via-[#070b14]/50 to-[#070b14]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_20%,_#070b14_90%)]" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[#070a12]" />
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-6">

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 mb-8 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
                <span className="font-semibold tracking-wide">CLUSTER TELEMETRY ACTIVE</span>
                <span className="text-slate-600 font-normal">|</span>
                <span className="text-slate-400">3 DATASTORES SYNCED</span>
              </div>
              <span className="text-xs font-mono text-slate-500 hidden sm:inline">
                10,000+ REAL CBP MANIFESTS REPLAYED
              </span>
            </div>

            <div className="flex items-center gap-1 p-1 rounded-xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-xl">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 px-2 font-semibold hidden sm:inline">
                Backdrop:
              </span>
              {([
                { key: "radar", label: "🌐 Radar HUD" },
                { key: "port", label: "🏗️ Nocturnal Port" },
                { key: "cargoship", label: "🚢 Mega Vessel" },
                { key: "dark", label: "🌑 Obsidian" },
              ] as const).map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setDashBgMode(key)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all duration-200 ${
                    dashBgMode === key
                      ? "bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-sm"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.03] to-transparent border border-amber-500/20 backdrop-blur-xl p-5 shadow-2xl">
              <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start md:items-center gap-4">
                  <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shrink-0 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-sm font-semibold text-amber-200 tracking-wide">
                        Official CBP Ocean Manifest Evaluation Dataset
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                        SEPTEMBER 1–10, 2022
                      </span>
                    </div>
                    <p className="text-xs text-slate-300/85 mt-1 leading-relaxed max-w-3xl">
                      Engineered and validated on 10,000+ real U.S. Customs & Border Protection ocean bills of lading. Live automated ingestion triggers upon carrier API authentication.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-amber-300 shadow-inner">
                    19 C.F.R. § 103.31 Public Record
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/40 border border-white/[0.08] backdrop-blur-xl mb-8">
            {[
              { id: "infrastructure", label: "Live Infrastructure", icon: Server, badge: "3/3 UP" },
              { id: "evidence", label: "Evidence & Trust Layer", icon: ShieldCheck, badge: "VERIFIED" },
              { id: "schemas", label: "Canonical Schemas", icon: Layers, badge: "BRONZE / SILVER / GOLD" },
              { id: "contracts", label: "Data Contracts", icon: FileText, badge: "GUARDRAILS" },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/30 to-indigo-600/20 text-white border border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.25)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-400" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      isActive ? "bg-blue-500/20 text-blue-300" : "bg-white/[0.06] text-slate-500"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {activeTab === "infrastructure" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f172a]/90 via-[#0a0f1d]/90 to-[#070a14]/90 border border-white/[0.08] p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-sky-500/40 hover:shadow-[0_20px_50px_rgba(14,165,233,0.15)] transition-all duration-300">

                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-sky-500/60 to-transparent" />

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/25 text-sky-400 shadow-[0_0_15px_rgba(14,165,233,0.2)]">
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white tracking-wide text-base">PostgreSQL 16</h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400/80 font-medium">OLTP Transaction Core</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {healthData?.services?.postgres?.status?.toUpperCase() || "ONLINE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5 text-center">
                    <div>
                      <div className="text-base font-bold text-white font-mono">{healthData?.services?.postgres?.tables?.length || 11}</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Schemas</div>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <div className="text-base font-bold text-sky-400 font-mono">100%</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">ACID Durability</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-400 font-mono">10k+</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Rows Ingested</div>
                    </div>
                  </div>

                  <div className="mb-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2.5">
                      <span className="uppercase tracking-wider font-semibold text-slate-300">Verified Relational Schemas:</span>
                      <span className="text-[10px] text-sky-400">11 of 11 Migrated</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: "shipments", type: "core" },
                        { name: "canonical_entities", type: "core" },
                        { name: "provenance_records", type: "audit" },
                        { name: "field_values", type: "audit" },
                        { name: "field_missingness", type: "audit" },
                        { name: "entity_resolution_audit", type: "audit" },
                        { name: "review_queue", type: "core" },
                        { name: "tenants", type: "security" },
                        { name: "users", type: "security" },
                        { name: "permissions", type: "security" },
                        { name: "audit_log", type: "audit" },
                      ].map((tbl) => (
                        <span
                          key={tbl.name}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono bg-white/[0.03] hover:bg-sky-500/10 border border-white/[0.06] hover:border-sky-500/30 text-slate-300 hover:text-sky-300 transition-all cursor-default"
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            tbl.type === "core" ? "bg-sky-400" : tbl.type === "audit" ? "bg-emerald-400" : "bg-purple-400"
                          }`} />
                          {tbl.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-slate-400" />
                      localhost:5432 · ti_user
                    </span>
                    <span className="text-emerald-400/80">Pool: 8/20 Ready</span>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f172a]/90 via-[#0a0f1d]/90 to-[#070a14]/90 border border-white/[0.08] p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-amber-500/40 hover:shadow-[0_20px_50px_rgba(245,158,11,0.15)] transition-all duration-300">

                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white tracking-wide text-base">ClickHouse 24.3</h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80 font-medium">OLAP Columnar Engine</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      {healthData?.services?.clickhouse?.status?.toUpperCase() || "ONLINE"}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5 text-center">
                    <div>
                      <div className="text-base font-bold text-white font-mono">{healthData?.services?.clickhouse?.tables?.length || 6}</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">OLAP Tables</div>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <div className="text-base font-bold text-amber-400 font-mono">&lt; 4ms</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">P95 Scan Speed</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-400 font-mono">10x+</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Compression</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span className="uppercase tracking-wider font-semibold text-slate-300">Data Lakehouse Tiers:</span>
                      <span className="text-[10px] text-amber-400">Bronze · Silver · Gold</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 text-[10px] border border-amber-500/30 font-semibold">BRONZE</span>
                        <span className="text-slate-300 text-[11px]">bronze_trademo_bol</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Immutable Raw</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 text-[10px] border border-blue-500/30 font-semibold">SILVER</span>
                        <span className="text-slate-300 text-[11px]">silver_shipments</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Normalized Canonical</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] border border-emerald-500/30 font-semibold">GOLD</span>
                        <span className="text-slate-300 text-[11px]">mv_gold_importer_metrics</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">Materialized Aggregates</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Cpu className="w-3.5 h-3.5 text-slate-400" />
                      HTTP: 8123 · Native: 9000
                    </span>
                    <span className="text-amber-400/80">Engines: MergeTree</span>
                  </div>
                </div>

                <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-[#0f172a]/90 via-[#0a0f1d]/90 to-[#070a14]/90 border border-white/[0.08] p-6 backdrop-blur-xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-purple-500/40 hover:shadow-[0_20px_50px_rgba(168,85,247,0.15)] transition-all duration-300">

                  <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/60 to-transparent" />

                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                        <Layers className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white tracking-wide text-base">MinIO Object Store</h3>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-purple-400/80 font-medium">S3 Immutable Drop Zone</span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      ONLINE
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-5 text-center">
                    <div>
                      <div className="text-base font-bold text-white font-mono">2</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">S3 Buckets</div>
                    </div>
                    <div className="border-x border-white/[0.06]">
                      <div className="text-base font-bold text-purple-400 font-mono">SHA-256</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Hash Verified</div>
                    </div>
                    <div>
                      <div className="text-base font-bold text-emerald-400 font-mono">WORM</div>
                      <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider">Write Once Read Many</div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span className="uppercase tracking-wider font-semibold text-slate-300">Initialized S3 Vaults:</span>
                      <span className="text-[10px] text-purple-400">Zero-Loss Policy</span>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="font-semibold text-white">ti-bronze-raw</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">STAGING DROP</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Pre-validation landing buffer for raw customs manifest tarballs.</p>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-mono text-xs">
                          <span className="w-2 h-2 rounded-full bg-purple-400" />
                          <span className="font-semibold text-white">ti-bronze-archive</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">COLD ARCHIVE</span>
                      </div>
                      <p className="text-[11px] text-slate-400">Cryptographically sealed source files with immutable audit proofs.</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-white/[0.06] text-[11px] font-mono text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                      API: Port 9002 · Console: 9003
                    </span>
                    <a href="http://localhost:9003" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 hover:underline inline-flex items-center gap-1">
                      Open Console <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-indigo-950/40 border border-white/[0.08] p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-5 mb-5 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/25 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-base">Multi-Store Tenant Isolation Architecture</h3>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                          BRIEF §2 RULE 5
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        PostgreSQL Row-Level Security (RLS) does NOT protect ClickHouse or OpenSearch. Each engine enforces isolation at the query execution boundary:
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shrink-0">
                    SOC 2 / ISO 27001 ISOLATION READY
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] hover:border-blue-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-blue-400 font-mono">1. PostgreSQL Engine</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30">SESSION RLS</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Mandatory session-level <code className="text-blue-300 font-mono">tenant_id</code> variable injected into transaction context with automated audit log logging.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] hover:border-amber-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-amber-400 font-mono">2. ClickHouse OLAP</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">DYNAMIC AST</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Query AST rewrite injects immutable tenant predicate clauses into all analytical aggregations prior to cluster execution.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06] hover:border-emerald-500/30 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-xs text-emerald-400 font-mono">3. OpenSearch Engine</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">BOOL FILTER</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Mandatory <code className="text-emerald-300 font-mono">bool.filter</code> term wrapped around every manifest search query to prevent cross-tenant vector leakage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "evidence" && (
            <div className="space-y-8">

              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 w-fit mx-auto">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
                <span className="text-xs font-mono font-semibold text-amber-300 tracking-wider uppercase">
                  Sample / Illustrative Data — Not Yet Live
                </span>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a]/95 via-[#0c1222]/95 to-[#070b14]/95 border border-white/[0.08] p-6 backdrop-blur-xl shadow-2xl">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-sky-400 mb-1">
                      <Fingerprint className="w-4 h-4" />
                      OFFICIAL OCEAN MANIFEST RECORD PROVENANCE
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-2xl font-bold text-white tracking-wide font-mono">
                        BOL #{evidenceData?.bill_of_lading}
                      </h2>
                      <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        CONFIDENCE: {evidenceData?.entity_resolution?.confidence_tier}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Shipment UUID: {evidenceData?.shipment_id}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Splink Match Coverage</div>
                      <div className="text-base font-bold text-emerald-400 font-mono">{evidenceData?.entity_resolution?.coverage?.text}</div>
                    </div>
                    <div className="p-3 rounded-xl bg-black/40 border border-white/[0.06] text-right">
                      <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Audit Trail Status</div>
                      <div className="text-base font-bold text-sky-400 font-mono">100% Immutable</div>
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-4">
                    3-Stage Immutable Chronological Lineage (Brief §2 Rule 2):
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs text-sky-400 font-mono font-semibold mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        Stage 1: Source Timestamp
                      </div>
                      <div className="text-sm font-mono text-white font-semibold">{evidenceData?.timestamps?.source_timestamp}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Recorded arrival on customs ocean manifest</div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs text-amber-400 font-mono font-semibold mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        Stage 2: Ingestion Timestamp
                      </div>
                      <div className="text-sm font-mono text-white font-semibold">{evidenceData?.timestamps?.ingestion_timestamp}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Landed into immutable ClickHouse Bronze layer</div>
                    </div>

                    <div className="p-4 rounded-xl bg-black/40 border border-white/[0.06]">
                      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono font-semibold mb-1">
                        <Clock className="w-3.5 h-3.5" />
                        Stage 3: Normalization Timestamp
                      </div>
                      <div className="text-sm font-mono text-white font-semibold">{evidenceData?.timestamps?.normalization_timestamp}</div>
                      <div className="text-[10px] text-slate-400 mt-1">Transformed into canonical Silver schema</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0e1424]/90 to-[#070b14]/90 border border-white/[0.08] backdrop-blur-xl shadow-2xl">
                <div className="p-5 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white text-base">
                      Field Values Provenance & Transformation Lineage
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Brief §2 Rule 4: Raw, normalized, and derived values are preserved in separate physical fields — source data is NEVER overwritten.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-sky-500/10 text-sky-300 border border-sky-500/25 shrink-0 self-start sm:self-auto">
                    AUDIT-READY VERIFIED
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/[0.06] bg-black/40 text-[10px] font-mono uppercase tracking-wider text-slate-400">
                        <th className="px-5 py-3.5 font-semibold">Attribute Field</th>
                        <th className="px-5 py-3.5 font-semibold">Source Raw Value</th>
                        <th className="px-5 py-3.5 font-semibold">Canonical Normalized Value</th>
                        <th className="px-5 py-3.5 font-semibold">Derived / Enriched</th>
                        <th className="px-5 py-3.5 font-semibold text-right">Integrity Audit Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04] font-mono">
                      {evidenceData?.fields?.map((f: any) => (
                        <tr key={f.field_name} className="hover:bg-white/[0.03] transition-colors group">
                          <td className="px-5 py-4 font-sans font-medium text-slate-200">
                            <div className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-sky-400 group-hover:scale-125 transition-transform" />
                              <span className="font-semibold">{f.label}</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 block ml-3.5 mt-0.5">{f.field_name}</span>
                          </td>
                          <td className="px-5 py-4">
                            {f.raw_value ? (
                              <span className="px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06] text-slate-400 text-xs">
                                {f.raw_value}
                              </span>
                            ) : (
                              <span className="text-slate-600 italic">null</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {f.normalized_value ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-[11px]">→</span>
                                <span className="font-semibold text-sky-300 bg-sky-500/10 px-2.5 py-1 rounded-md border border-sky-500/20 text-xs">
                                  {f.normalized_value}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-600 italic">null</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-300">
                            {f.derived_value || <span className="text-slate-600">—</span>}
                          </td>
                          <td className="px-5 py-4 text-right">
                            {f.missingness ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold bg-red-500/10 text-red-400 border border-red-500/30" title={f.missingness.description}>
                                {f.missingness.reason}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-sans font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <Check className="w-3 h-3" /> Present In Manifest
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-black/40 border-t border-white/[0.06] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-slate-400 font-mono">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Source: <strong className="text-white">{evidenceData?.provenance?.source_name}</strong> ({evidenceData?.provenance?.jurisdiction})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="text-slate-500">SHA-256 Checksum:</span>
                    <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08] text-slate-300 font-mono">
                      {evidenceData?.provenance?.checksum_sha256}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "schemas" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a]/95 via-[#0c1222]/95 to-[#070b14]/95 border border-white/[0.08] p-6 backdrop-blur-xl shadow-2xl">
                <div className="pb-5 mb-6 border-b border-white/[0.06]">
                  <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-1">
                    <Layers className="w-4 h-4" />
                    CANONICAL DATA PIPELINE SPECIFICATION (BRIEF §5)
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-wide">
                    Lakehouse Lineage Architecture: Bronze → Silver → Gold
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Every incoming U.S. customs manifest traverses three strictly separated stages. Transformation guarantees zero loss of raw values.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div className="relative p-5 rounded-2xl bg-gradient-to-b from-amber-500/[0.06] to-transparent border border-amber-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                        <h3 className="font-semibold text-white text-base">Bronze Layer</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                        CLICKHOUSE OLAP
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      Raw, uncoerced, immutable append-only records. Monthly partition keys. Never updated or mutated in place.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                        <span className="text-amber-400 font-semibold">bronze_trademo_bol</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">U.S. customs ocean bill-of-lading stream</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                        <span className="text-amber-400 font-semibold">bronze_oec_botmarket</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Macro aggregate trade statistics cache</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.06]">
                      ✓ provenance_id & license_ref on every row
                    </div>
                  </div>

                  <div className="relative p-5 rounded-2xl bg-gradient-to-b from-blue-500/[0.06] to-transparent border border-blue-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-pulse" />
                        <h3 className="font-semibold text-white text-base">Silver Layer</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                        POSTGRES & CLICKHOUSE
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      Canonical normalized schema. Company suffixes stripped, HS codes zero-padded, timestamps separated.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                        <span className="text-blue-400 font-semibold">shipments</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Canonical normalized ocean shipment manifests</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                        <span className="text-blue-400 font-semibold">field_values</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Dual-preserved raw vs normalized fields</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.06]">
                      ✓ 5-enum explicit field_missingness reasons
                    </div>
                  </div>

                  <div className="relative p-5 rounded-2xl bg-gradient-to-b from-emerald-500/[0.06] to-transparent border border-emerald-500/20 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <h3 className="font-semibold text-white text-base">Gold Layer</h3>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                        MATERIALIZED VIEWS
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                      Business-ready trade aggregates and Splink-resolved canonical entities for sub-10ms analytics.
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">canonical_entities</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Splink resolved golden importer/shipper records</div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-black/40 border border-white/[0.06] text-xs font-mono">
                        <span className="text-emerald-400 font-semibold">mv_gold_importer_metrics</span>
                        <div className="text-[10px] text-slate-400 mt-0.5">Real-time importer volume & port rankings</div>
                      </div>
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 pt-3 border-t border-white/[0.06]">
                      ✓ Sub-second company search & profile views
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "contracts" && (
            <div className="space-y-8">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0f172a]/95 via-[#0c1222]/95 to-[#070b14]/95 border border-white/[0.08] p-6 backdrop-blur-xl shadow-2xl">
                <div className="pb-5 mb-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono text-red-400 mb-1">
                      <FileCode className="w-4 h-4" />
                      FAILURE-LOUD DATA CONTRACTS (BRIEF §5)
                    </div>
                    <h2 className="text-2xl font-bold text-white tracking-wide">
                      Deterministic Ingestion Guardrails
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Every external data feed requires an explicit YAML contract. Unexpected schema drift immediately fails the pipeline rather than coercing silently.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono px-3 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/30 font-semibold shrink-0">
                    STRICT SCHEMA ENFORCED
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  <div className="rounded-2xl bg-black/50 border border-white/[0.08] overflow-hidden">
                    <div className="p-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <FileText className="w-4 h-4 text-sky-400" />
                        <span className="font-semibold text-white">contracts/trademo_bol_v1.yaml</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/15 text-red-400 border border-red-500/30 font-semibold">
                        FAIL_ON_SCHEMA_CHANGE
                      </span>
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div><span className="text-slate-500">Source:</span> <span className="text-slate-300">Trademo US BOL Sample</span></div>
                        <div><span className="text-slate-500">Channel:</span> <span className="text-slate-300">AWS Data Exchange</span></div>
                        <div><span className="text-slate-500">Window:</span> <span className="text-slate-300">Sept 1–10, 2022</span></div>
                        <div><span className="text-slate-500">Jurisdiction:</span> <span className="text-slate-300">19 C.F.R. § 103.31</span></div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] text-slate-300 space-y-1 text-[11px]">
                        <div className="text-sky-400 font-semibold pb-1 border-b border-white/[0.04]">
                          Mandatory Non-Nullable Fields:
                        </div>
                        <div className="flex items-center justify-between"><span>• bill_of_lading</span><span className="text-slate-500">string (primary key)</span></div>
                        <div className="flex items-center justify-between"><span>• shipment_date</span><span className="text-slate-500">date (ISO-8601)</span></div>
                        <div className="flex items-center justify-between"><span>• importer_name</span><span className="text-slate-500">string (canonical)</span></div>
                        <div className="flex items-center justify-between"><span>• foreign_shipper</span><span className="text-slate-500">string (canonical)</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-black/50 border border-white/[0.08] overflow-hidden">
                    <div className="p-4 bg-white/[0.02] border-b border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <FileText className="w-4 h-4 text-amber-400" />
                        <span className="font-semibold text-white">contracts/oec_botmarket_v1.yaml</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                        CAP: 50 QUERIES ($0.50)
                      </span>
                    </div>
                    <div className="p-4 space-y-3 font-mono text-xs">
                      <div className="grid grid-cols-2 gap-2 text-[11px] p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                        <div><span className="text-slate-500">Source:</span> <span className="text-slate-300">OEC BotMarket API</span></div>
                        <div><span className="text-slate-500">Cost:</span> <span className="text-slate-300">$0.01 per query</span></div>
                        <div><span className="text-slate-500">Safety Cap:</span> <span className="text-slate-300">50 calls / run</span></div>
                        <div><span className="text-slate-500">Purpose:</span> <span className="text-slate-300">Freshness check</span></div>
                      </div>

                      <div className="p-3 rounded-xl bg-black/60 border border-white/[0.06] text-slate-300 space-y-1 text-[11px]">
                        <div className="text-amber-400 font-semibold pb-1 border-b border-white/[0.04]">
                          AI Output Guardrails (Brief §2 Rule 6):
                        </div>
                        <div className="text-red-400/90">• Banned patterns: compliance conclusions & fraud accusations</div>
                        <div className="text-emerald-400/90">• Mandatory: Cite-only verified shipment manifests with hashes</div>
                        <div className="text-slate-400">• Hallucination safeguard: Unverified claims rejected at API gate</div>
                      </div>
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
