/**
 * Screen 9: Trade-Lane Explorer  /vision/lanes
 *
 * Deep-dive analytics on trade corridors — volume trends, carrier breakdown,
 * port congestion status, HS code composition, and EvidenceDrawer integration.
 *
 * Design: dark ink | amber accent | MOCK badges | N-of-M denominators
 * Disclaimer: Orchid does NOT issue compliance certifications.
 */

import React, { useState } from "react";
import { VisionLayout } from "../../vision/layout/VisionLayout";
import { GlassPanel } from "../../vision/ui/GlassPanel";
import { MockLabel } from "../../vision/ui/MockLabel";
import { DenominatorMetric } from "../../vision/ui/DenominatorMetric";
import { useVisionStore } from "../../vision/store/visionStore";
import { MOCK_CORRIDORS, MOCK_PORTS } from "../../vision/mock/corridors";
import { MOCK_SHIPMENTS } from "../../vision/mock/shipments";
import { MOCK_COMPANIES } from "../../vision/mock/companies";
import type { ProvenanceDrawerPayload, MockFieldValue } from "../../vision/mock/types";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";
import {
  Globe2,
  Anchor,
  TrendingUp,
  TrendingDown,
  Clock,
  Package,
  Info,
  ChevronRight,
  MapPin,
  Ship,
  BarChart2,
  Layers,
} from "lucide-react";

// ── Mock trade-lane data ───────────────────────────────────────────────────
const CORRIDOR_DETAIL = {
  id: "tpc-south",
  name: "Trans-Pacific South",
  description: "Primary container corridor linking Southeast Asian manufacturing hubs (VNSGN, CNSHG, CNNGB) to US West Coast import terminals (USLAX, USLGB).",
  originRegion: "Southeast Asia",
  destinationRegion: "US West Coast",
  q3TotalShipments: 312,
  q3TotalTeu: 8420,
  q3DeclaredValueUsd: 284_500_000,
  avgTransitDays: 18.4,
  avgConfidenceScore: 0.887,
  topCarriers: [
    { name: "Evergreen Marine", shipments: 94, teu: 2680 },
    { name: "COSCO Shipping", shipments: 76, teu: 1940 },
    { name: "Yang Ming", shipments: 61, teu: 1580 },
    { name: "Hapag-Lloyd", shipments: 48, teu: 1220 },
    { name: "Others", shipments: 33, teu: 1000 },
  ],
  topHsCodes: [
    { code: "852852", desc: "Flat Panel Displays", pct: 34, teu: 2863 },
    { code: "847160", desc: "Computing Peripherals", pct: 21, teu: 1768 },
    { code: "940360", desc: "Furniture Parts", pct: 14, teu: 1179 },
    { code: "611020", desc: "Cotton Knit Apparel", pct: 11, teu: 926 },
    { code: "Other", desc: "All Others", pct: 20, teu: 1684 },
  ],
  monthlyVolume: [
    { month: "Oct 23", teu: 580, shipments: 21, confidence: 0.871 },
    { month: "Nov 23", teu: 620, shipments: 23, confidence: 0.883 },
    { month: "Dec 23", teu: 710, shipments: 27, confidence: 0.890 },
    { month: "Jan 24", teu: 540, shipments: 20, confidence: 0.875 },
    { month: "Feb 24", teu: 490, shipments: 18, confidence: 0.869 },
    { month: "Mar 24", teu: 650, shipments: 24, confidence: 0.884 },
    { month: "Apr 24", teu: 720, shipments: 26, confidence: 0.891 },
    { month: "May 24", teu: 780, shipments: 28, confidence: 0.895 },
    { month: "Jun 24", teu: 830, shipments: 31, confidence: 0.899 },
    { month: "Jul 24", teu: 910, shipments: 34, confidence: 0.901 },
    { month: "Aug 24", teu: 960, shipments: 36, confidence: 0.906 },
    { month: "Sep 24", teu: 1030, shipments: 38, confidence: 0.912 },
  ],
  portPairs: [
    { origin: "VNSGN", dest: "USLAX", shipments: 142, teu: 3940, avgDays: 17.2 },
    { origin: "CNSHG", dest: "USLAX", shipments: 88, teu: 2480, avgDays: 19.8 },
    { origin: "CNNGB", dest: "USLGB", shipments: 52, teu: 1430, avgDays: 20.1 },
    { origin: "VNSGN", dest: "USLGB", shipments: 30, teu: 570, avgDays: 17.8 },
  ],
};

const OTHER_CORRIDORS = [
  { id: "tpc-north", name: "Trans-Pacific North", shipments: 198, teu: 5840, trend: +12.3 },
  { id: "asia-eu", name: "Asia–Europe", shipments: 156, teu: 4920, trend: -3.1 },
  { id: "transatlantic", name: "Transatlantic West", shipments: 87, teu: 2310, trend: +5.7 },
  { id: "intra-asia", name: "Intra-Asia", shipments: 64, teu: 1680, trend: +1.2 },
];

const HS_PIE_COLORS = ["#F59E0B", "#14B8A6", "#6366F1", "#F97316", "#64748B"];

// ── Helper components ─────────────────────────────────────────────────────
function CongestionDot({ level }: { level: "LOW" | "NORMAL" | "HIGH" }) {
  const map = {
    LOW: "bg-teal-400",
    NORMAL: "bg-amber-400",
    HIGH: "bg-red-500 animate-pulse",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[level]}`} />;
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function TradeLanePage() {
  const openDrawer = useVisionStore((s) => s.openDrawer);
  const [selectedCorridor, setSelectedCorridor] = useState("tpc-south");

  const corridor = CORRIDOR_DETAIL; // Always show Trans-Pacific South as primary

  // Matched shipments on this corridor from mock
  const corridorShipments = MOCK_SHIPMENTS.filter(
    (s) => s.originPortCode === "VNSGN" || s.originPortCode === "CNSHG" || s.originPortCode === "CNNGB"
  );

  function openKpiDrawer(label: string, value: string, formula: string, count: number, denom: number, rationale: string) {
    const fields: MockFieldValue[] = [
      { fieldName: "corridor", label: "Corridor", rawValue: corridor.name, normalizedValue: corridor.name, derivedValue: null, missingness: null },
      { fieldName: "data_window", label: "Data Window", rawValue: "Q3 2024 (Jul–Sep)", normalizedValue: "Q3 2024", derivedValue: null, missingness: null },
      { fieldName: "source", label: "Source Dataset", rawValue: "cbp_am_manifests", normalizedValue: "cbp_am_manifests", derivedValue: null, missingness: null },
    ];
    const payload: ProvenanceDrawerPayload = {
      claimLabel: label,
      claimValue: value,
      calculationFormula: formula,
      contributingRecordsCount: count,
      contributingRecordsDenominator: denom,
      sourceDataset: "cbp_am_manifests",
      sourceJurisdiction: "US Customs and Border Protection",
      licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
      transformationPipeline: "Bronze ingest → Silver normalise → Gold corridor aggregation",
      modelEngine: "Orchid Corridor Analytics v1.0",
      modelVersion: "orchid_corridors_v1.0",
      uncertaintyRationale: rationale,
      underlyingRecords: [],
      fieldComparison: fields,
      isMock: true,
    };
    openDrawer(payload);
  }

  const portData = MOCK_PORTS.filter((p) =>
    ["VNSGN", "CNSHG", "CNNGB", "USLAX", "USLGB"].includes(p.code)
  );

  return (
    <VisionLayout pageTitle="Trade-Lane Explorer — Orchid Vision">
      <div className="p-6 max-w-screen-2xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Globe2 className="w-6 h-6 text-teal-400" />
              <h1 className="font-serif text-3xl font-bold text-slate-50">
                Trade-Lane Explorer
              </h1>
              <MockLabel />
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Deep-dive corridor analytics: volume trends, carrier concentration, HS code composition,
              and port pair throughput. Click any metric for full provenance.
            </p>
          </div>
          <div className="text-[10px] font-mono text-slate-500 border border-[#1E2A45] rounded px-3 py-2">
            Engine: Orchid Corridor Analytics v1.0 · Q3 2024 [MOCK]
          </div>
        </div>

        {/* ── Disclaimer ── */}
        <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg px-4 py-3 text-xs text-amber-300/80 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Disclaimer:</strong> All corridor volume, TEU counts, declared values, and transit times
            are derived from <strong>[MOCK]</strong> illustrative data. Orchid does NOT issue compliance
            certifications, legal clearance, or fraud verdicts.
          </span>
        </div>

        {/* ── Corridor selector strip ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            className="px-4 py-2 rounded-xl text-sm font-mono border border-amber-500/50 bg-amber-500/10 text-amber-300 transition-all"
            onClick={() => setSelectedCorridor("tpc-south")}
          >
            Trans-Pacific South ✓
          </button>
          {OTHER_CORRIDORS.map((c) => (
            <button
              key={c.id}
              className="px-4 py-2 rounded-xl text-sm font-mono border border-[#1E2A45] hover:border-amber-500/30 text-slate-400 hover:text-amber-300 transition-all"
            >
              {c.name}
              <span className={`ml-2 text-[10px] ${c.trend > 0 ? "text-teal-400" : "text-red-400"}`}>
                {c.trend > 0 ? "+" : ""}{c.trend}%
              </span>
            </button>
          ))}
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DenominatorMetric
            label="Q3 Shipments"
            numerator={corridor.q3TotalShipments}
            denominator={MOCK_SHIPMENTS.length}
            unit="BOLs"
            onClickEvidence={() => openKpiDrawer(
              "Q3 Shipments (Trans-Pacific South)",
              `${corridor.q3TotalShipments} of ${MOCK_SHIPMENTS.length}`,
              "COUNT(shipments WHERE corridor = 'Trans-Pacific South')",
              corridor.q3TotalShipments, MOCK_SHIPMENTS.length,
              "Shipment counts are derived from CBP AMS manifest records. Pending entity resolution pairs (26 of 34) are excluded from totals."
            )}
          />
          <DenominatorMetric
            label="Q3 TEU Volume"
            numerator={corridor.q3TotalTeu}
            denominator={42100}
            unit="TEUs"
            onClickEvidence={() => openKpiDrawer(
              "Q3 TEU Volume (Trans-Pacific South)",
              `${corridor.q3TotalTeu.toLocaleString("en-US")} of 42,100 total`,
              "SUM(teu WHERE corridor = 'Trans-Pacific South') / SUM(ALL teu)",
              corridor.q3TotalTeu, 42100,
              "TEU counts are declared values from manifest filings. Actual loaded TEU may differ from declared capacity."
            )}
          />
          <DenominatorMetric
            label="Active Port Pairs"
            numerator={corridor.portPairs.length}
            denominator={12}
            unit="pairs"
            onClickEvidence={() => openKpiDrawer(
              "Active Port Pairs (Trans-Pacific South)",
              `${corridor.portPairs.length} of 12 tracked pairs`,
              "COUNT(DISTINCT origin_port || '->' || dest_port WHERE corridor = 'Trans-Pacific South')",
              corridor.portPairs.length, 12,
              "Port pairs with fewer than 5 shipments in Q3 are excluded from the active count."
            )}
          />
          <DenominatorMetric
            label="Avg Transit Days"
            numerator={Math.round(corridor.avgTransitDays)}
            denominator={30}
            unit="days"
            onClickEvidence={() => openKpiDrawer(
              "Avg Transit Days (Trans-Pacific South)",
              `${corridor.avgTransitDays} of 30 day max`,
              "AVG(arrival_date - filing_date WHERE corridor = 'Trans-Pacific South')",
              Math.round(corridor.avgTransitDays), 30,
              "Transit days are estimated from filing date to arrival date in manifest records. Does not account for inland transit or customs hold delays."
            )}
          />
        </div>

        {/* ── Two-column: volume trend + carrier breakdown ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Volume trend chart */}
          <GlassPanel className="lg:col-span-2 p-4">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
              Monthly TEU Volume — Trans-Pacific South <MockLabel />
            </h2>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={corridor.monthlyVolume}>
                <defs>
                  <linearGradient id="teuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#14B8A6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <RechartsTooltip
                  contentStyle={{ background: "#0B1020", border: "1px solid #1E2A45", borderRadius: 8, fontSize: 11 }}
                  labelStyle={{ color: "#94a3b8" }}
                />
                <Area
                  type="monotone"
                  dataKey="teu"
                  stroke="#14B8A6"
                  strokeWidth={2}
                  fill="url(#teuGrad)"
                  name="TEU"
                />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-[9px] font-mono text-slate-600 mt-2 text-center">
              [MOCK] Oct 2023 – Sep 2024 · 12-month rolling window
            </p>
          </GlassPanel>

          {/* Carrier breakdown */}
          <GlassPanel className="p-4">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Ship className="w-3.5 h-3.5" /> Top Carriers <MockLabel />
            </h2>
            <div className="space-y-3">
              {corridor.topCarriers.map((c, i) => {
                const pct = Math.round((c.teu / corridor.q3TotalTeu) * 100);
                const colors = ["bg-teal-500", "bg-amber-500", "bg-indigo-500", "bg-orange-400", "bg-slate-500"];
                return (
                  <div key={c.name}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300">{c.name}</span>
                      <span className="text-[10px] font-mono text-slate-500">{c.teu.toLocaleString("en-US")} TEU</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[#1E2A45] overflow-hidden">
                        <div className={`h-full rounded-full ${colors[i]}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-500 w-8 text-right">{pct}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 pt-3 border-t border-[#1E2A45] text-[10px] font-mono text-slate-500">
              Total: {corridor.topCarriers.reduce((a, c) => a + c.shipments, 0)} shipments · {corridor.q3TotalTeu.toLocaleString("en-US")} TEU
            </div>
          </GlassPanel>
        </div>

        {/* ── HS Code composition + Port congestion ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* HS Code composition */}
          <GlassPanel className="p-4">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Package className="w-3.5 h-3.5 text-amber-400" /> HS Code Composition <MockLabel />
            </h2>
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={corridor.topHsCodes}
                    dataKey="pct"
                    nameKey="code"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={2}
                  >
                    {corridor.topHsCodes.map((entry, index) => (
                      <Cell key={entry.code} fill={HS_PIE_COLORS[index % HS_PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    contentStyle={{ background: "#0B1020", border: "1px solid #1E2A45", borderRadius: 8, fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {corridor.topHsCodes.map((hs, i) => (
                  <div key={hs.code} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ background: HS_PIE_COLORS[i] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[10px] font-mono text-slate-300">{hs.code}</span>
                        <span className="text-[10px] font-mono text-slate-500">{hs.pct}%</span>
                      </div>
                      <p className="text-[9px] text-slate-500 truncate">{hs.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          {/* Port congestion status */}
          <GlassPanel className="p-4">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
              <Anchor className="w-3.5 h-3.5 text-teal-400" /> Port Status <MockLabel />
            </h2>
            <div className="space-y-3">
              {portData.map((port) => (
                <div
                  key={port.code}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#0F1629] border border-[#1E2A45] hover:border-amber-500/20 transition-all cursor-pointer"
                  onClick={() => {
                    const fields: MockFieldValue[] = [
                      { fieldName: "port_code", label: "Port Code", rawValue: port.code, normalizedValue: port.code, derivedValue: null, missingness: null },
                      { fieldName: "port_name", label: "Port Name", rawValue: port.name, normalizedValue: port.name, derivedValue: null, missingness: null },
                      { fieldName: "congestion", label: "Congestion Level", rawValue: port.congestionLevel, normalizedValue: port.congestionLevel, derivedValue: null, missingness: null },
                      { fieldName: "q3_volume", label: "Q3 TEU Volume", rawValue: port.q3VolumeTeu.toString(), normalizedValue: port.q3VolumeTeu.toLocaleString("en-US"), derivedValue: null, missingness: null },
                    ];
                    const payload: ProvenanceDrawerPayload = {
                      claimLabel: `${port.code} — ${port.name}`,
                      claimValue: `${port.q3VolumeTeu.toLocaleString("en-US")} TEU`,
                      calculationFormula: "SUM(teu WHERE origin_port = port.code OR dest_port = port.code)",
                      contributingRecordsCount: Math.round(port.q3VolumeTeu / 28),
                      contributingRecordsDenominator: MOCK_SHIPMENTS.length,
                      sourceDataset: "cbp_am_manifests",
                      sourceJurisdiction: "US Customs and Border Protection",
                      licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
                      transformationPipeline: "Bronze ingest → Silver normalise → Gold port aggregation",
                      modelEngine: "Orchid Port Analytics v1.0",
                      modelVersion: "orchid_ports_v1.0",
                      uncertaintyRationale: "Congestion level is a synthetic illustrative signal. Real port congestion data would be sourced from marine terminal operator APIs.",
                      underlyingRecords: [],
                      fieldComparison: fields,
                      isMock: true,
                    };
                    openDrawer(payload);
                  }}
                >
                  <div className="flex-shrink-0">
                    <CongestionDot level={port.congestionLevel} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs font-mono font-bold text-slate-200">{port.code}</span>
                      <span className={`text-[10px] font-mono ${port.congestionLevel === "HIGH" ? "text-red-400" : port.congestionLevel === "NORMAL" ? "text-amber-400" : "text-teal-400"}`}>
                        {port.congestionLevel}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 truncate">{port.name} · {port.country}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xs font-mono text-slate-300">{port.q3VolumeTeu.toLocaleString("en-US")}</div>
                    <div className="text-[9px] text-slate-600">TEU Q3</div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {/* ── Port pair throughput table ── */}
        <GlassPanel className="p-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <BarChart2 className="w-3.5 h-3.5" /> Port Pair Throughput — Trans-Pacific South <MockLabel />
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A45]">
                  {["Origin Port", "Destination Port", "Shipments (N of M)", "TEU Volume", "Avg Transit", "Share"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {corridor.portPairs.map((pair, i) => {
                  const pct = Math.round((pair.teu / corridor.q3TotalTeu) * 100);
                  return (
                    <tr key={`${pair.origin}-${pair.dest}`} className={`border-b border-[#1E2A45]/40 hover:bg-[#1E2A45]/20 transition-colors ${i % 2 === 0 ? "" : "bg-[#0F1629]/20"}`}>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
                          <MapPin className="w-3 h-3 text-amber-400" /> {pair.origin}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 font-mono text-xs text-slate-300">
                          <Anchor className="w-3 h-3 text-teal-400" /> {pair.dest}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-300">
                        {pair.shipments} <span className="text-slate-600">of</span> {corridor.q3TotalShipments}
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-300">
                        {pair.teu.toLocaleString("en-US")} TEU
                      </td>
                      <td className="py-3 px-3 font-mono text-xs text-slate-400">
                        {pair.avgDays} days
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 rounded-full bg-[#1E2A45] overflow-hidden">
                            <div className="h-full rounded-full bg-teal-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-teal-400">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* ── Other corridors summary ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {OTHER_CORRIDORS.map((c) => (
            <GlassPanel key={c.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <Globe2 className="w-4 h-4 text-slate-500" />
                <span className={`text-xs font-mono flex items-center gap-1 ${c.trend > 0 ? "text-teal-400" : "text-red-400"}`}>
                  {c.trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {c.trend > 0 ? "+" : ""}{c.trend}%
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-200 mb-1">{c.name}</p>
              <p className="text-lg font-mono font-bold text-white">{c.shipments}</p>
              <p className="text-[10px] text-slate-500">shipments · {c.teu.toLocaleString("en-US")} TEU</p>
              <div className="mt-3 pt-2 border-t border-[#1E2A45] text-[9px] font-mono text-slate-600">[MOCK] Q3 2024</div>
            </GlassPanel>
          ))}
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          [MOCK] All corridor volumes, TEU counts, declared values, transit times, and carrier concentrations are synthetic illustrative data.
          Orchid does NOT issue compliance certifications, legal clearance, or fraud verdicts. · orchid_corridors_v1.0 · Q3 2024 Sample
        </p>
      </div>
    </VisionLayout>
  );
}
