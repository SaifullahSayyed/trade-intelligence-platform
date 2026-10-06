import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Compass,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  AlertTriangle,
  GitMerge,
  Filter,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  HelpCircle,
  Clock,
  Layers,
  FileText,
  X,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import { VisionLayout } from "@/vision/layout/VisionLayout";
import {
  GlassPanel,
  StatusChip,
  MockLabel,
  DenominatorMetric,
  ConfidenceBadge,
} from "@/vision/ui";
import { useVisionStore } from "@/vision/store/visionStore";
import {
  MOCK_COMPANIES,
  MOCK_SHIPMENTS,
  MOCK_CORRIDORS,
  MOCK_REVIEW_QUEUE,
  ProvenanceDrawerPayload,
  MockShipment,
} from "@/vision/mock";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";

// Dynamically import TradeGlobe with SSR disabled to guarantee smooth canvas rendering
const TradeGlobe = dynamic(() => import("@/vision/components/TradeGlobe"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full flex items-center justify-center bg-black/20 rounded-2xl border border-white/5 font-mono text-xs text-slate-500">
      Loading 3D Trade Horizon Canvas…
    </div>
  ),
});

// Q3 2024 Illustrative Corridor Monthly Volume Data (TEUs)
const CORRIDOR_CHART_DATA = [
  {
    month: "July 2024",
    "Trans-Pacific South": 14200,
    "Trans-Pacific North": 9800,
    "East Asia Mainline": 18400,
    "Trans-Atlantic": 4200,
  },
  {
    month: "August 2024",
    "Trans-Pacific South": 16800,
    "Trans-Pacific North": 11200,
    "East Asia Mainline": 21300,
    "Trans-Atlantic": 4600,
  },
  {
    month: "September 2024",
    "Trans-Pacific South": 18400,
    "Trans-Pacific North": 12200,
    "East Asia Mainline": 24500,
    "Trans-Atlantic": 4900,
  },
];

export default function VisionHome() {
  const {
    openDrawer,
    tourActive,
    tourStep,
    nextTourStep,
    prevTourStep,
    endTour,
  } = useVisionStore();

  const [selectedCorridorId, setSelectedCorridorId] = useState<string>("COR-001");
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard navigation for Guided Tour Mode
  useEffect(() => {
    if (!tourActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextTourStep();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevTourStep();
      } else if (e.key === "Escape") {
        e.preventDefault();
        endTour();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [tourActive, nextTourStep, prevTourStep, endTour]);

  // Evidence Payloads for the 5 Top Hero Denominator Metrics
  const handleOpenClusterEvidence = () => {
    openDrawer({
      claimLabel: "Canonical Corporate Entity Clusters",
      claimValue: "34 of 40 Clusters Resolved (85.0%)",
      calculationFormula:
        "COUNT(DISTINCT canonical_entity_id) / COUNT(DISTINCT raw_entity_groups) for candidate pairs with match_probability >= 0.85",
      contributingRecordsCount: 34,
      contributingRecordsDenominator: 40,
      sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
      sourceJurisdiction: "US (19 C.F.R. § 103.31 Public Record)",
      licenseNote: "Public domain government manifest record",
      transformationPipeline:
        "Bronze raw manifests -> Silver party cleaning -> Gold probabilistic matching (orchid_fs_matcher_v1)",
      modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
      modelVersion: "orchid_fs_matcher_v1",
      uncertaintyRationale:
        "6 corporate groups placed in [0.65, 0.85) human verification band due to shared logistics subsidiary addresses or subtle legal entity branch differences.",
      underlyingRecords: MOCK_SHIPMENTS.slice(0, 3).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD` : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "importer_name",
          label: "Consignee Legal Name",
          rawValue: "NORTHWIND RETAIL GRP LLC",
          normalizedValue: "NORTHWIND RETAIL GROUP",
          derivedValue: "NORTHWIND RETAIL GROUP (US)",
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  const handleOpenManifestEvidence = () => {
    openDrawer({
      claimLabel: "Customs Ocean Manifest Data Integrity",
      claimValue: "542 of 600 Bills of Lading Verified (90.3%)",
      calculationFormula:
        "COUNT(bol_id WHERE contract_status = 'VALIDATED') / COUNT(total_bols_ingested) against contracts/trademo_bol_v1.yaml",
      contributingRecordsCount: 542,
      contributingRecordsDenominator: 600,
      sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
      sourceJurisdiction: "US (19 C.F.R. § 103.31 Public Record)",
      licenseNote: "Public domain customs ocean manifest declaration",
      transformationPipeline: "Bronze raw manifest -> Data Contract Validation -> SHA-256 Stamp",
      modelEngine: "Data Contract Validator (YAML v1.0)",
      modelVersion: "contracts/trademo_bol_v1.yaml",
      uncertaintyRationale:
        "58 records flagged during Q3 evaluation for unverified foreign carrier codes or optional declared value omission.",
      underlyingRecords: MOCK_SHIPMENTS.slice(3, 6).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD` : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "bill_of_lading",
          label: "Bill of Lading Number",
          rawValue: "MEDU1928472910",
          normalizedValue: "MEDU1928472910",
          derivedValue: "MEDU1928472910",
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  const handleOpenCorridorEvidence = () => {
    openDrawer({
      claimLabel: "Active Maritime Corridors Monitored",
      claimValue: "6 of 6 Corridors Operational (100%)",
      calculationFormula:
        "COUNT(DISTINCT corridor_id WHERE active_vessel_calls >= 10 in Q3 2024 sample)",
      contributingRecordsCount: 6,
      contributingRecordsDenominator: 6,
      sourceDataset: "Global Terminal Call & Transit Observation Matrix",
      sourceJurisdiction: "Multi-Jurisdiction (Asia-Pacific & US)",
      licenseNote: "Illustrative operational corridor telemetry",
      transformationPipeline: "Vessel AIS Manifest Alignment -> Port Congestion Scoring",
      modelEngine: "Corridor Flow Aggregator",
      modelVersion: "gold_trade_lane_metrics_v1",
      uncertaintyRationale:
        "Transit times based on standard commercial container carriers; feeder transshipment dwell times estimated at Singapore and Busan.",
      underlyingRecords: MOCK_SHIPMENTS.slice(6, 9).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD` : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "transit_days",
          label: "Average Transit Days",
          rawValue: "19.4",
          normalizedValue: "19.4",
          derivedValue: "19.4 Days (Normal)",
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  const handleOpenReviewEvidence = () => {
    openDrawer({
      claimLabel: "Probabilistic Matcher Uncertainty Queue",
      claimValue: "8 of 42 Candidate Pairs Flagged (19.0%)",
      calculationFormula:
        "COUNT(candidate_pair WHERE score >= 0.6500 AND score < 0.8500) under Fellegi-Sunter scoring model",
      contributingRecordsCount: 8,
      contributingRecordsDenominator: 42,
      sourceDataset: "Candidate Pair Blocking & Scoring Matrix",
      sourceJurisdiction: "US & Asia-Pacific Manifest Entity Index",
      licenseNote: "Algorithmic audit record under orchid_fs_matcher_v1",
      transformationPipeline: "Blocking (First-Char + Soundex) -> Jaro-Winkler Scoring -> Review Queue",
      modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
      modelVersion: "orchid_fs_matcher_v1",
      uncertaintyRationale:
        "False-merge rate guardrail (< 5.0%) strictly enforced. Pairs exhibiting high token overlap but differing legal entity suffixes are deferred to human review.",
      underlyingRecords: MOCK_SHIPMENTS.slice(9, 12).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD` : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "score_band",
          label: "Review Decision Threshold",
          rawValue: "0.784",
          normalizedValue: "0.784",
          derivedValue: "NEEDS_REVIEW",
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  const handleOpenValueEvidence = () => {
    openDrawer({
      claimLabel: "Declared Manifest Cargo Value",
      claimValue: "$14.8M of $16.2M Declared Value Verified (91.4%)",
      calculationFormula:
        "SUM(declared_value_usd) across valid customs entries with unmasked commercial valuations",
      contributingRecordsCount: 542,
      contributingRecordsDenominator: 600,
      sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
      sourceJurisdiction: "US (19 C.F.R. § 103.31 Public Record)",
      licenseNote: "Public domain customs import entry declaration",
      transformationPipeline: "Bronze raw manifest -> Currency Normalization (USD) -> Value Index",
      modelEngine: "Customs Valuation Pipeline",
      modelVersion: "19 C.F.R. § 103.31 Parser",
      uncertaintyRationale:
        "$1.4M (58 records) masked under statutory confidentiality requests (19 C.F.R. § 103.31(d)). Declared values reflect commercial invoice totals, not cleared duty payments.",
      underlyingRecords: MOCK_SHIPMENTS.slice(0, 3).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD` : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "declared_value_usd",
          label: "Declared Commercial Invoice Value",
          rawValue: "342000",
          normalizedValue: "342000.00",
          derivedValue: "$342,000 USD",
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  // Click handler for shipment in activity ticker
  const handleOpenShipmentEvidence = (shipment: MockShipment) => {
    openDrawer({
      claimLabel: `Bill of Lading: ${shipment.bolNumber}`,
      claimValue: `${shipment.consigneeName} <- ${shipment.shipperName}`,
      calculationFormula: `Direct ocean manifest filing on ${shipment.filingDate} via carrier ${shipment.carrierName}`,
      contributingRecordsCount: 1,
      contributingRecordsDenominator: 1,
      sourceDataset: shipment.provenance.sourceDataset,
      sourceJurisdiction: shipment.provenance.sourceJurisdiction,
      licenseNote: shipment.provenance.licenseReference,
      transformationPipeline:
        "Raw Manifest -> Data Contract Validation -> Normalized Silver Record",
      modelEngine: shipment.provenance.modelEngine,
      modelVersion: shipment.provenance.modelVersion,
      uncertaintyRationale: shipment.provenance.uncertaintyRationale,
      underlyingRecords: [
        {
          id: shipment.id,
          bol: shipment.bolNumber,
          date: shipment.filingDate,
          consignee: shipment.consigneeName,
          shipper: shipment.shipperName,
          value: shipment.declaredValueUsd
            ? `$${shipment.declaredValueUsd.toLocaleString("en-US")} USD`
            : "MASKED",
          confidence: shipment.confidenceTier,
        },
      ],
      fieldComparison: shipment.provenance.fields,
      isMock: true,
    });
  };

  // Tour steps definition
  const TOUR_STEPS = [
    {
      title: "1. Verified Denominators & Honesty",
      content:
        "Every KPI card in Orchid displays both the numerator and the denominator, paired with a timestamp classification. Clicking any card opens the Evidence & Provenance Drawer.",
    },
    {
      title: "2. Interactive Trade-Lane Horizon",
      content:
        "Track maritime routes across global hubs. Switch between Trans-Pacific South, North, East Asia Mainline, and Trans-Atlantic corridors with live terminal congestion alerts.",
    },
    {
      title: "3. Probabilistic Review Queue",
      content:
        "When our custom Fellegi-Sunter matcher detects company name variants in the [0.65, 0.85) band, it routes them to human review to safeguard our <5% false-merge guardrail.",
    },
    {
      title: "4. Built vs Planned Transparency",
      content:
        "Every screen and widget clearly displays whether the underlying engine is 'Built today' in our working repo or 'Planned' for full investor preview demonstration.",
    },
  ];

  return (
    <VisionLayout pageTitle="Command Center">
      <Head>
        <title>Command Center — Orchid Trade Intelligence</title>
      </Head>

      <div className="space-y-6">
        {/* EXECUTIVE HEADER & CONTEXT BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Compass className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Executive Horizon / Q3 2024 Sample
              </span>
              <MockLabel size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Global Trade Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-1 max-w-3xl">
              Verifiable intelligence across trans-pacific maritime corridors, probabilistic entity
              clusters, and provenance-anchored trade flows.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <StatusChip
              type="built_simplified"
              tooltipText="Live app at localhost:3000 runs data contract validation, bronze provenance, and basic review queue on synthetic records. Vision adds real-time corridor telemetry, interactive 3D globe, and deep multi-metric drilldown."
            />
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-black/40 border border-white/10 hidden sm:inline-block">
              Jul 1 – Sep 30, 2024
            </span>
          </div>
        </div>

        {/* HERO KPI STRIP (5 METRICS WITH DENOMINATORS & TIMESTAMP TYPES) */}
        <section aria-label="Key Performance Indicators" className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Pipeline & Resolution Integrity Metrics (Click for Evidence)</span>
            </span>
            <span className="text-slate-500 text-[10px]">
              Denominator Standard: 100% Non-Bare Percentages
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <DenominatorMetric
              label="Resolved Entity Clusters"
              numerator={34}
              denominator={40}
              unit="clusters"
              timestampType="Run Timestamp"
              timestampValue="2024-09-30 23:59 UTC"
              onClickEvidence={handleOpenClusterEvidence}
            />

            <DenominatorMetric
              label="Customs Manifests Screened"
              numerator={542}
              denominator={600}
              unit="bills of lading"
              timestampType="Ingest Source"
              timestampValue="Q3 2024 CBP Feed"
              onClickEvidence={handleOpenManifestEvidence}
            />

            <DenominatorMetric
              label="Active Maritime Corridors"
              numerator={6}
              denominator={6}
              unit="monitored"
              timestampType="Coverage Scope"
              timestampValue="18 Global Ports"
              onClickEvidence={handleOpenCorridorEvidence}
            />

            <DenominatorMetric
              label="Uncertainty Review Band"
              numerator={8}
              denominator={42}
              unit="pairs flagged"
              timestampType="Decision Model"
              timestampValue="orchid_fs_matcher_v1"
              onClickEvidence={handleOpenReviewEvidence}
            />

            <DenominatorMetric
              label="Verified Customs Value"
              numerator="$14.8M"
              denominator="$16.2M"
              unit="unmasked USD"
              timestampType="Statutory Exemption"
              timestampValue="19 C.F.R. § 103.31"
              onClickEvidence={handleOpenValueEvidence}
            />
          </div>
        </section>

        {/* CENTERPIECE: 3D TRADE-LANE GLOBE & MARITIME HORIZON */}
        <section aria-label="Trade-Lane Horizon Globe">
          <GlassPanel hairlineAccent="amber" padding="md">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Global Maritime Trade Corridors
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time routing across Asia-Pacific export hubs & North American unlading ports.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip type="planned" />
                <MockLabel size="xs" />
              </div>
            </div>

            <TradeGlobe
              selectedCorridorId={selectedCorridorId}
              onSelectCorridor={(id) => setSelectedCorridorId(id)}
            />
          </GlassPanel>
        </section>

        {/* CORRIDOR VOLUME & MONTHLY FLOW BREAKDOWN (RECHARTS) */}
        <section aria-label="Corridor Flow Analysis">
          <GlassPanel hairlineAccent="teal" padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Q3 2024 Trade-Lane Container Throughput
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Monthly ocean container volume (TEUs) by key maritime transit corridor.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <StatusChip
                  type="backend_planned"
                  tooltipText="ClickHouse silver and gold materialized views defined in repo (clickhouse/schema/03_gold.sql); live API querying planned for Day 20."
                />
                <span className="text-[10px] font-mono text-slate-400 px-2 py-0.5 rounded bg-white/[0.04]">
                  Unit: TEU
                </span>
              </div>
            </div>

            {mounted ? (
              <div className="h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={CORRIDOR_CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis
                      dataKey="month"
                      stroke="#64748b"
                      fontSize={11}
                      fontFamily="monospace"
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#64748b"
                      fontSize={11}
                      fontFamily="monospace"
                      tickLine={false}
                      tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: "#0B1020",
                        borderColor: "#1E2A45",
                        borderRadius: "10px",
                        fontSize: "12px",
                        fontFamily: "monospace",
                        color: "#fff",
                      }}
                      cursor={{ fill: "rgba(255,255,255,0.04)" }}
                    />
                    <Bar dataKey="Trans-Pacific South" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="East Asia Mainline" fill="#14B8A6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Trans-Pacific North" fill="#6366F1" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Trans-Atlantic" fill="#64748B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[260px] w-full flex items-center justify-center font-mono text-xs text-slate-500">
                Rendering Recharts throughput distribution…
              </div>
            )}

            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-3 border-t border-white/[0.06] text-xs font-mono text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                <span>Trans-Pacific South (Vietnam)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#14B8A6]" />
                <span>East Asia Mainline (HK/TW)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#6366F1]" />
                <span>Trans-Pacific North (KR/JP)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
                <span>Trans-Atlantic Direct</span>
              </div>
            </div>
          </GlassPanel>
        </section>

        {/* TWO-COLUMN INTELLIGENCE SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMN A: LIVE CUSTOMS MANIFEST INGESTION STREAM (7 COLS) */}
          <section aria-label="Recent Ingested Manifest Stream" className="lg:col-span-7">
            <GlassPanel padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                    <h3 className="text-sm font-bold text-white font-serif">
                      Live Manifest Ingestion Stream
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip
                      type="built_simplified"
                      tooltipText="Live app has working Bronze MinIO landing and PostgreSQL storage; streaming ticker UI is modeled for demonstration."
                    />
                    <MockLabel size="xs" />
                  </div>
                </div>

                <div className="space-y-2.5">
                  {MOCK_SHIPMENTS.slice(0, 5).map((shipment, idx) => (
                    <div
                      key={shipment.id}
                      onClick={() => handleOpenShipmentEvidence(shipment)}
                      className="group p-3 rounded-xl bg-black/40 border border-white/5 hover:border-amber-400/30 hover:bg-black/70 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleOpenShipmentEvidence(shipment);
                        }
                      }}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                            {shipment.bolNumber}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {idx === 0 ? "2m ago" : idx === 1 ? "18m ago" : `${idx * 2}h ago`}
                          </span>
                          <ConfidenceBadge tier={shipment.confidenceTier} showScore={false} />
                        </div>
                        <div className="text-xs text-slate-300 font-sans truncate max-w-md">
                          <span className="text-white font-medium">{shipment.consigneeName}</span>
                          <span className="text-slate-500 mx-1.5">←</span>
                          <span className="text-slate-400">{shipment.shipperName}</span>
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                          <span>
                            {shipment.originPortCode} → {shipment.destPortCode}
                          </span>
                          <span>•</span>
                          <span>{shipment.hsCode} ({shipment.hsDescription.slice(0, 24)}…)</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
                        <span className="text-xs font-mono font-bold text-amber-300">
                          {shipment.declaredValueUsd
                            ? `$${shipment.declaredValueUsd.toLocaleString("en-US")}`
                            : "MASKED"}
                        </span>
                        <span className="text-[10px] font-mono text-teal-400 flex items-center gap-0.5 group-hover:underline">
                          Inspect Proof <ArrowUpRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Showing 5 of 600 Q3-2024 Illustrative Ingests</span>
                <Link
                  href="/vision/search"
                  className="text-amber-400 hover:text-amber-300 flex items-center gap-1 group font-semibold"
                >
                  <span>Query All Manifests</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            </GlassPanel>
          </section>

          {/* COLUMN B: PROBABILISTIC REVIEW QUEUE SNAPSHOT (5 COLS) */}
          <section aria-label="Probabilistic Entity Review Queue" className="lg:col-span-5">
            <GlassPanel padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <GitMerge className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white font-serif">
                      Review Queue (Needs Attention)
                    </h3>
                  </div>
                  <StatusChip
                    type="built_simplified"
                    tooltipText="Live app at localhost:3000/review presents human resolution queue for 2 ambiguous pairs; vision models full workbench integration."
                  />
                </div>

                <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 mb-3 flex items-center justify-between">
                  <span>False-Merge Guardrail:</span>
                  <span className="font-bold">&lt; 5.0% Required</span>
                </div>

                <div className="space-y-2.5">
                  {MOCK_REVIEW_QUEUE.slice(0, 3).map((item) => (
                    <div
                      key={item.reviewId}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between font-mono text-[10px]">
                        <span className="text-amber-400 font-semibold">{item.reviewId}</span>
                        <span className="text-slate-400">
                          Prob. Score: <strong className="text-white">{item.probabilisticScore.toFixed(3)}</strong>
                        </span>
                      </div>

                      <div className="space-y-1 font-mono text-[11px]">
                        <div className="text-slate-200 font-semibold truncate">
                          A: {item.rawNameA}
                        </div>
                        <div className="text-slate-400 truncate">
                          B: {item.rawNameB}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-white/[0.05] flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>JW: {item.signals.jaroWinkler.toFixed(3)}</span>
                        <span>Soundex: {item.signals.phoneticSoundexMatch ? "MATCH" : "DIFF"}</span>
                        <Link
                          href="/vision/workbench"
                          className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-0.5"
                        >
                          Resolve <ChevronRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">3 of 8 Queue Items</span>
                <Link
                  href="/vision/workbench"
                  className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 font-semibold transition-all"
                >
                  Open Resolution Workbench
                </Link>
              </div>
            </GlassPanel>
          </section>
        </div>
      </div>

      {/* GUIDED TOUR OVERLAY (WHEN TRIGGERED VIA TOP BAR) */}
      {tourActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4 animate-fade-in">
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0F1629]/95 border border-amber-500/40 shadow-2xl backdrop-blur-xl text-slate-100 space-y-3">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                  Investor Walkthrough Mode
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  Step {tourStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <button
                type="button"
                onClick={endTour}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
                aria-label="Exit Walkthrough"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="text-sm font-bold text-white font-sans">
                {TOUR_STEPS[tourStep % TOUR_STEPS.length].title}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {TOUR_STEPS[tourStep % TOUR_STEPS.length].content}
              </p>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs font-mono">
              <span className="text-[10px] text-slate-500 hidden sm:inline">
                Use ← / → keys or buttons
              </span>
              <div className="flex items-center gap-2 ml-auto">
                {tourStep > 0 && (
                  <button
                    type="button"
                    onClick={prevTourStep}
                    className="px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Prev</span>
                  </button>
                )}
                {tourStep < TOUR_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={nextTourStep}
                    className="px-3 py-1 rounded-lg bg-amber-500 text-black font-semibold hover:bg-amber-400 flex items-center gap-1 shadow-sm"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={endTour}
                    className="px-3 py-1 rounded-lg bg-teal-500 text-black font-semibold hover:bg-teal-400 flex items-center gap-1 shadow-sm"
                  >
                    <span>Finish Tour</span>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </VisionLayout>
  );
}
