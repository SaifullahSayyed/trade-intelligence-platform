import React, { useState, useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Building2,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Activity,
  Layers,
  Clock,
  FileText,
  AlertTriangle,
  ExternalLink,
  GitMerge,
  Share2,
  PackageCheck,
  CheckCircle2,
  Info,
  ChevronRight,
  Filter,
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
  getCompanyTimeSeries,
  MockShipment,
  MockCompany,
} from "@/vision/mock";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";

export default function Company360Profile() {
  const router = useRouter();
  const { id } = router.query;
  const { openDrawer } = useVisionStore();

  const [aliasesExpanded, setAliasesExpanded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Resolve target company (default to featured Northwind Retail Group if invalid or initial render)
  const companyId = typeof id === "string" ? id : "nrg-001";
  const company: MockCompany =
    MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];

  // Time-series points with confidence bands
  const timeSeriesData = getCompanyTimeSeries(company.id);

  // Shipments for this company
  const companyShipments = MOCK_SHIPMENTS.filter((s) => s.companyId === company.id);
  const pageSize = 8;
  const totalPages = Math.ceil(companyShipments.length / pageSize) || 1;
  const paginatedShipments = companyShipments.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Evidence handlers for header KPI strip
  const handleOpenShipmentMatchEvidence = () => {
    openDrawer({
      claimLabel: `Canonical Shipment Resolution: ${company.canonicalName}`,
      claimValue: `${company.matchedShipments} of ${company.totalShipments} Shipments Matched`,
      calculationFormula:
        "COUNT(manifest_record WHERE canonical_entity_id = '" +
        company.id +
        "' AND match_probability >= 0.85)",
      contributingRecordsCount: company.matchedShipments,
      contributingRecordsDenominator: company.totalShipments,
      sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
      sourceJurisdiction: company.jurisdiction,
      licenseNote: "Public domain customs declaration under 19 C.F.R. § 103.31",
      transformationPipeline:
        "Bronze Manifest Landing -> Silver Canonical Cleaning -> Gold Fellegi-Sunter Matcher",
      modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
      modelVersion: "orchid_fs_matcher_v1",
      uncertaintyRationale: `${
        company.totalShipments - company.matchedShipments
      } records in uncertainty band [0.65, 0.85) pending manual investigator confirmation.`,
      underlyingRecords: companyShipments.slice(0, 3).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd
          ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD`
          : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "consignee_name",
          label: "Consignee Legal Name",
          rawValue: company.aliasCluster[0],
          normalizedValue: company.canonicalName,
          derivedValue: `${company.canonicalName} (${company.country})`,
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  const handleOpenClusterEvidence = () => {
    openDrawer({
      claimLabel: `Alias Cluster Deduplication Proof: ${company.canonicalName}`,
      claimValue: `${company.aliasCount} Jurisdictional & Spelling Variants Merged`,
      calculationFormula:
        "Union-Find BFS clustering over candidate pairs with Fellegi-Sunter match score >= 0.8500",
      contributingRecordsCount: company.aliasCount,
      contributingRecordsDenominator: company.aliasCount,
      sourceDataset: "Consolidated Party Master Index (US & Asia-Pacific)",
      sourceJurisdiction: company.jurisdiction,
      licenseNote: "Algorithmic deduplication record",
      transformationPipeline: "Token Sort -> Jaro-Winkler String Distance -> Phonetic Soundex",
      modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
      modelVersion: "orchid_fs_matcher_v1",
      uncertaintyRationale:
        "False-merge guardrail (< 5.0%) verified: all merged variants share identical statutory address or registered corporate employer identification.",
      underlyingRecords: companyShipments.slice(0, 3).map((s) => ({
        id: s.id,
        bol: s.bolNumber,
        date: s.filingDate,
        consignee: s.consigneeName,
        shipper: s.shipperName,
        value: s.declaredValueUsd
          ? `$${s.declaredValueUsd.toLocaleString("en-US")} USD`
          : "MASKED",
        confidence: s.confidenceTier,
      })),
      fieldComparison: [
        {
          fieldName: "canonical_entity_id",
          label: "Canonical Identifier",
          rawValue: company.aliasCluster[1] || company.canonicalName,
          normalizedValue: company.canonicalName,
          derivedValue: company.id,
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  const handleOpenShipmentDetail = (shipment: MockShipment) => {
    openDrawer({
      claimLabel: `Bill of Lading: ${shipment.bolNumber}`,
      claimValue: `${shipment.consigneeName} <- ${shipment.shipperName}`,
      calculationFormula: `Customs vessel manifest declaration on ${shipment.filingDate}`,
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

  return (
    <VisionLayout pageTitle={`${company.canonicalName} — Company 360`}>
      <Head>
        <title>{company.canonicalName} — Company 360 Profile (Vision Preview)</title>
      </Head>

      <div className="space-y-6">
        {/* BREADCRUMB / BACK LINK */}
        <div className="flex items-center justify-between">
          <Link
            href="/vision/home"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400 hover:text-amber-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Command Center</span>
          </Link>
          <div className="flex items-center gap-2">
            <StatusChip
              type="built_simplified"
              tooltipText="Live app at localhost:3000/company/ent_walmart_inc presents core entity profile; Vision Preview adds alias cluster drill-down, Recharts confidence band time series, partner network graph, and trust layer."
            />
            <MockLabel size="xs" />
          </div>
        </div>

        {/* CANONICAL ENTITY HEADER & ALIAS CLUSTER CARD */}
        <GlassPanel hairlineAccent="amber" padding="lg">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Building2 className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                  Canonical Corporate Entity
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-slate-300">
                  {company.jurisdiction}
                </span>
                <ConfidenceBadge
                  tier={company.confidenceTier}
                  score={company.confidenceScore}
                  showScore={true}
                />
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-white tracking-tight">
                {company.canonicalName}
              </h1>

              <p className="text-xs sm:text-sm text-slate-300 font-sans max-w-2xl leading-relaxed">
                Primary ocean manifest importer of containerized electronics and consumer retail
                freight across Trans-Pacific corridors. Clustered via probabilistic matching
                (Fellegi-Sunter-style) across multiple customs filer variations.
              </p>

              {/* ALIAS CLUSTER ACCORDION TRIGGER */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setAliasesExpanded(!aliasesExpanded)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-mono font-medium transition-all"
                  aria-expanded={aliasesExpanded}
                  aria-controls="alias-cluster-panel"
                >
                  <GitMerge className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    {company.aliasCount} Name Variants Merged — See Proof & Rationale
                  </span>
                  {aliasesExpanded ? (
                    <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                  )}
                </button>
              </div>
            </div>

            {/* QUICK ACTIONS & CITATION PILL */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenClusterEvidence}
                className="px-4 py-2 rounded-xl bg-black/50 border border-white/15 hover:border-amber-400/40 text-slate-200 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all shadow-sm"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Verify Deduplication Proof</span>
              </button>
              <Link
                href="/vision/search"
                className="px-4 py-2 rounded-xl bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] text-slate-300 hover:text-white text-xs font-mono flex items-center justify-center gap-2 transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-amber-400" />
                <span>Filter Manifests ({company.totalShipments})</span>
              </Link>
            </div>
          </div>

          {/* EXPANDED ALIAS CLUSTER DRAWER */}
          {aliasesExpanded && (
            <div
              id="alias-cluster-panel"
              className="mt-6 pt-5 border-t border-white/10 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-mono uppercase font-semibold text-white tracking-wider">
                    Resolved Name & Spelling Variants ({company.aliasCluster.length})
                  </h4>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                    Clustered using Jaro-Winkler string similarity, token sort normalization, and
                    Soundex phonetic blocking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenClusterEvidence}
                  className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
                >
                  <span>Audit Algorithm</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {company.aliasCluster.map((alias, idx) => (
                  <div
                    key={alias}
                    className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="truncate pr-2">
                      <span className="text-slate-500 text-[10px] mr-2">#{idx + 1}</span>
                      <span className="text-slate-200">{alias}</span>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-300 shrink-0">
                      MATCH
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>

        {/* 4 CORE KPI METRICS WITH DENOMINATORS */}
        <section aria-label="Company Key Metrics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DenominatorMetric
            label="Matched Shipments"
            numerator={company.matchedShipments}
            denominator={company.totalShipments}
            unit="shipments"
            timestampType="Evaluation Window"
            timestampValue="Q3 2024 Illustrative"
            onClickEvidence={handleOpenShipmentMatchEvidence}
          />

          <DenominatorMetric
            label="Declared Volume"
            numerator={company.totalTeu}
            denominator={320}
            unit="TEU containers"
            timestampType="Cargo Standard"
            timestampValue="Twenty-Foot Equivalent"
            onClickEvidence={handleOpenShipmentMatchEvidence}
          />

          <DenominatorMetric
            label="Gross Manifest Weight"
            numerator={(company.totalWeightKg / 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })}
            denominator="2,000"
            unit="metric tons"
            timestampType="Customs Scale"
            timestampValue="Gross Invoiced Weight"
            onClickEvidence={handleOpenShipmentMatchEvidence}
          />

          <DenominatorMetric
            label="Primary Tariff Chapter"
            numerator={`HS ${company.primaryHsCode}`}
            denominator="Ch. 85"
            unit="monitors"
            timestampType="WCO Classification"
            timestampValue="Harmonized Tariff 2024"
            onClickEvidence={handleOpenShipmentMatchEvidence}
          />
        </section>

        {/* TRADE-VOLUME TIME SERIES WITH CONFIDENCE BAND & PARTNER NETWORK */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* TIME SERIES WITH CONFIDENCE BANDS (7 COLS) */}
          <section aria-label="Trade Volume Time Series" className="lg:col-span-7">
            <GlassPanel hairlineAccent="teal" padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white font-serif">
                      12-Month Trade Volume & Match Confidence Band
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Monthly container volume with algorithmic confidence boundary [Low CI, High CI].
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip
                      type="backend_planned"
                      tooltipText="Time series aggregations modeled for ClickHouse trade_lane_metrics materialized view; visual confidence band demonstrated."
                    />
                    <MockLabel size="xs" />
                  </div>
                </div>

                {mounted ? (
                  <div className="h-[260px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={timeSeriesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0} />
                          </linearGradient>
                          <linearGradient id="ciBand" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          fontSize={10}
                          fontFamily="monospace"
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={10}
                          fontFamily="monospace"
                          tickLine={false}
                        />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: "#0B1020",
                            borderColor: "#1E2A45",
                            borderRadius: "10px",
                            fontSize: "11px",
                            fontFamily: "monospace",
                            color: "#fff",
                          }}
                          cursor={{ stroke: "rgba(255,255,255,0.15)" }}
                          formatter={(value: any, name: string) => {
                            if (name === "shipmentCount")
                              return [`${value} shipments`, "Monthly Volume"];
                            if (name === "confidenceMean")
                              return [`${(Number(value) * 100).toFixed(1)}%`, "Confidence Score"];
                            return [value, name];
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="shipmentCount"
                          stroke="#14B8A6"
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#volumeGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[260px] w-full flex items-center justify-center font-mono text-xs text-slate-500">
                    Loading time series telemetry…
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Confidence Mean: {(company.confidenceScore * 100).toFixed(1)}%</span>
                <span className="text-teal-400">Seasonal Peak: August – September 2024</span>
              </div>
            </GlassPanel>
          </section>

          {/* PARTNER NETWORK MINI-GRAPH (5 COLS) */}
          <section aria-label="Partner Network Topology" className="lg:col-span-5">
            <GlassPanel hairlineAccent="indigo" padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white font-serif">
                      Supply Network Topology
                    </h3>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      Tier-1 verified exporters & unlading entry terminals.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusChip type="planned" />
                    <MockLabel size="xs" />
                  </div>
                </div>

                {/* Central Entity Node */}
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/40 text-center space-y-1">
                    <span className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                      Canonical Focal Importer
                    </span>
                    <div className="text-xs font-bold text-white font-serif">
                      {company.canonicalName}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 block">
                      {company.country} • {company.matchedShipments} of {company.totalShipments} Verified
                    </span>
                  </div>

                  {/* Connected Exporters */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500 block">
                      Top Verified Exporters (Origin)
                    </span>
                    {company.topShippers.map((shipper, idx) => (
                      <div
                        key={shipper}
                        className="p-2.5 rounded-lg bg-black/40 border border-white/5 flex items-center justify-between text-xs font-mono"
                      >
                        <div className="truncate pr-2">
                          <span className="text-teal-400 text-[10px] mr-2">T-1</span>
                          <span className="text-slate-200">{shipper}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-semibold shrink-0">
                          {idx === 0 ? "54%" : idx === 1 ? "28%" : "18%"} Vol
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">3 Verified Suppliers</span>
                <Link
                  href="/vision/network"
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
                >
                  <span>Explore 3D Network</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </GlassPanel>
          </section>
        </div>

        {/* RISK INDICATOR PANEL & TRUST LAYER */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* RISK INDICATOR PANEL (6 COLS) */}
          <section aria-label="Risk Indicators" className="lg:col-span-6">
            <GlassPanel padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-bold text-white font-serif">
                      Risk Indicators (Statistical Signals Only)
                    </h3>
                  </div>
                  <MockLabel size="xs" />
                </div>

                {/* Important Honesty Notice */}
                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-white/10 text-[11px] font-mono text-slate-400 mb-3 space-y-1">
                  <span className="text-amber-300 font-semibold block">
                    Statutory Disclaimer (Brief §0 Rule 7)
                  </span>
                  <p className="leading-relaxed">
                    Signals reflect statistical pattern anomalies and data missingness rates. Orchid
                    does NOT issue compliance certifications, legal clearance, or fraud verdicts.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {company.riskIndicators.map((indicator) => (
                    <div
                      key={indicator.label}
                      className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white font-sans">
                          {indicator.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            indicator.level === "MONITOR"
                              ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              : "bg-teal-500/15 text-teal-300 border border-teal-500/30"
                          }`}
                        >
                          {indicator.level}
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs font-mono leading-relaxed">
                        {indicator.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>Audited via orchid_fs_matcher_v1</span>
                <span>3 of 3 Rules Evaluated</span>
              </div>
            </GlassPanel>
          </section>

          {/* THE TRUST LAYER (6 COLS) */}
          <section aria-label="Trust Layer & Provenance" className="lg:col-span-6">
            <GlassPanel padding="md" className="h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white font-serif">
                      The Trust Layer (Provenance & Completeness)
                    </h3>
                  </div>
                  <StatusChip type="built_simplified" />
                </div>

                {/* 3 Separate Timestamps */}
                <div className="grid grid-cols-3 gap-2 text-center font-mono mb-3">
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 block">1. Source Event</span>
                    <span className="text-[11px] font-bold text-slate-200">2024-09-04 14:32Z</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 block">2. Ingested Bronze</span>
                    <span className="text-[11px] font-bold text-teal-300">2024-09-04 18:05Z</span>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                    <span className="text-[10px] text-slate-500 block">3. Normalized Silver</span>
                    <span className="text-[11px] font-bold text-indigo-300">2024-09-04 18:07Z</span>
                  </div>
                </div>

                {/* Completeness Table */}
                <div className="space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] uppercase text-slate-500 block">
                    Field Completeness & Missingness Diagnostics
                  </span>

                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300">consignee_name</span>
                    <span className="text-teal-400 font-semibold">100% Present</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300">shipper_name</span>
                    <span className="text-teal-400 font-semibold">100% Present</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300">hs_tariff_code</span>
                    <span className="text-teal-400 font-semibold">100% Present</span>
                  </div>
                  <div className="p-2 rounded bg-black/40 border border-white/5 flex items-center justify-between">
                    <span className="text-slate-300">declared_value_usd</span>
                    <span className="text-amber-400 font-semibold">83.8% (24 Masked)</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.06] text-[10px] font-mono text-slate-500 flex items-center justify-between">
                <span>Statutory Exemption: 19 C.F.R. § 103.31(d)</span>
                <span>Hash: 8f2b…a41c (Verified)</span>
              </div>
            </GlassPanel>
          </section>
        </div>

        {/* SHIPMENT HISTORY TABLE WITH PAGINATION & CLICKABLE EVIDENCE */}
        <section aria-label="Verified Shipment Manifest Records">
          <GlassPanel padding="md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white font-serif">
                  Verified Shipment History ({companyShipments.length} Records)
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Click any bill of lading row to open full raw-to-normalized provenance proof.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-slate-400">
                  Page {currentPage} of {totalPages}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    className="px-2.5 py-1 rounded bg-white/[0.05] disabled:opacity-30 text-xs font-mono hover:bg-white/[0.1] text-white"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    className="px-2.5 py-1 rounded bg-white/[0.05] disabled:opacity-30 text-xs font-mono hover:bg-white/[0.1] text-white"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Bill of Lading</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Consignee Variant</th>
                    <th className="py-2.5 px-3">Shipper</th>
                    <th className="py-2.5 px-3">Route</th>
                    <th className="py-2.5 px-3">HS Code</th>
                    <th className="py-2.5 px-3 text-right">Value (USD)</th>
                    <th className="py-2.5 px-3 text-center">Confidence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {paginatedShipments.map((shipment) => (
                    <tr
                      key={shipment.id}
                      onClick={() => handleOpenShipmentDetail(shipment)}
                      className="group hover:bg-white/[0.03] transition-colors cursor-pointer"
                    >
                      <td className="py-2.5 px-3 text-amber-300 font-semibold group-hover:underline">
                        {shipment.bolNumber}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{shipment.filingDate}</td>
                      <td className="py-2.5 px-3 text-slate-200 truncate max-w-[180px]">
                        {shipment.consigneeName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 truncate max-w-[180px]">
                        {shipment.shipperName}
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        {shipment.originPortCode} → {shipment.destPortCode}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{shipment.hsCode}</td>
                      <td className="py-2.5 px-3 text-right text-slate-200">
                        {shipment.declaredValueUsd
                          ? `$${shipment.declaredValueUsd.toLocaleString("en-US")}`
                          : "MASKED"}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <ConfidenceBadge
                          tier={shipment.confidenceTier}
                          showScore={false}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span>Showing {paginatedShipments.length} of {companyShipments.length} records</span>
              <span className="text-teal-400">Click any row to open Evidence & Provenance Drawer</span>
            </div>
          </GlassPanel>
        </section>
      </div>
    </VisionLayout>
  );
}
