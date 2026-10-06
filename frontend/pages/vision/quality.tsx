/**
 * Screen 6: Data Quality Monitor  /vision/quality
 *
 * Shows data contract health, field-level missingness, ingestion batch
 * provenance, and contract violation cards with EvidenceDrawer integration.
 *
 * Design: dark ink palette | amber accent | MOCK badges | N-of-M denominators
 * Disclaimer: Orchid does NOT issue compliance certifications.
 */

import React, { useState } from "react";
import { VisionLayout } from "../../vision/layout/VisionLayout";
import { GlassPanel } from "../../vision/ui/GlassPanel";
import { MockLabel } from "../../vision/ui/MockLabel";
import { DenominatorMetric } from "../../vision/ui/DenominatorMetric";
import { StatusChip } from "../../vision/ui/StatusChip";
import { useVisionStore } from "../../vision/store/visionStore";
import { mulberry32 } from "../../vision/mock/seed";
import type { ProvenanceDrawerPayload, MockFieldValue } from "../../vision/mock/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Database,
  FileText,
  Layers,
  ChevronDown,
  ChevronRight,
  Info,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

// ── Seeded RNG ─────────────────────────────────────────────────────────────
const rng = mulberry32(771293);
const rand = () => rng();
const randInt = (lo: number, hi: number) =>
  lo + Math.floor(rand() * (hi - lo + 1));
const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

// ── Types ─────────────────────────────────────────────────────────────────
type ViolationSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type ViolationStatus = "OPEN" | "ACKNOWLEDGED" | "RESOLVED";

interface DataContract {
  id: string;
  name: string;
  dataset: string;
  version: string;
  owner: string;
  totalRules: number;
  passingRules: number;
  lastChecked: string;
  health: "HEALTHY" | "DEGRADED" | "FAILING";
}

interface ContractViolation {
  id: string;
  contractId: string;
  contractName: string;
  ruleName: string;
  field: string;
  severity: ViolationSeverity;
  status: ViolationStatus;
  affectedRecords: number;
  totalRecords: number;
  description: string;
  recommendation: string;
  firstSeen: string;
  dataset: string;
}

interface BatchIngestion {
  batchId: string;
  source: string;
  ingestionDate: string;
  totalRecords: number;
  parsedRecords: number;
  rejectedRecords: number;
  duration: string;
  status: "SUCCESS" | "PARTIAL" | "FAILED";
}

interface FieldMissingness {
  field: string;
  layer: "BRONZE" | "SILVER" | "GOLD";
  missingCount: number;
  totalCount: number;
  missingnessRate: number;
  primaryReason: "MASKED" | "UNAVAILABLE_AT_SOURCE" | "NOT_REPORTED";
  trend: "IMPROVING" | "STABLE" | "DEGRADING";
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const CONTRACTS: DataContract[] = [
  {
    id: "dc-001",
    name: "US Import Manifests Contract",
    dataset: "cbp_am_manifests",
    version: "v2.4.1",
    owner: "data-quality@orchid.io",
    totalRules: 24,
    passingRules: 21,
    lastChecked: "2024-09-30T06:00:00Z",
    health: "DEGRADED",
  },
  {
    id: "dc-002",
    name: "Entity Canonical Contract",
    dataset: "orchid_entities_gold",
    version: "v1.8.0",
    owner: "ml-ops@orchid.io",
    totalRules: 18,
    passingRules: 18,
    lastChecked: "2024-09-30T06:05:00Z",
    health: "HEALTHY",
  },
  {
    id: "dc-003",
    name: "Trade Volume Bronze Contract",
    dataset: "cbp_am_bronze",
    version: "v3.1.2",
    owner: "ingestion@orchid.io",
    totalRules: 31,
    passingRules: 26,
    lastChecked: "2024-09-30T05:58:00Z",
    health: "DEGRADED",
  },
  {
    id: "dc-004",
    name: "HS Code Taxonomy Contract",
    dataset: "wco_hs_taxonomy",
    version: "v1.0.3",
    owner: "data-quality@orchid.io",
    totalRules: 9,
    passingRules: 3,
    lastChecked: "2024-09-30T06:01:00Z",
    health: "FAILING",
  },
];

const VIOLATIONS: ContractViolation[] = [
  {
    id: "vio-001",
    contractId: "dc-004",
    contractName: "HS Code Taxonomy Contract",
    ruleName: "hs_code_length_check",
    field: "hs_code",
    severity: "CRITICAL",
    status: "OPEN",
    affectedRecords: 4821,
    totalRecords: 48210,
    description: "HS codes with fewer than 6 digits detected in 10.0% of bronze records. WCO standard requires minimum 6-digit classification.",
    recommendation: "Re-run WCO taxonomy enrichment pipeline. Check upstream CBP manifest parser for truncation bug introduced in v3.1.2.",
    firstSeen: "2024-09-28T14:22:00Z",
    dataset: "cbp_am_bronze",
  },
  {
    id: "vio-002",
    contractId: "dc-001",
    contractName: "US Import Manifests Contract",
    ruleName: "declared_value_null_check",
    field: "declared_value_usd",
    severity: "HIGH",
    status: "ACKNOWLEDGED",
    affectedRecords: 9142,
    totalRecords: 152367,
    description: "Declared value field is null or masked for 6 of 100 manifest records. Affects downstream trade-value aggregations.",
    recommendation: "Apply imputation from carrier invoice cross-reference where available. Flag remaining as MASKED in provenance.",
    firstSeen: "2024-09-15T09:11:00Z",
    dataset: "cbp_am_manifests",
  },
  {
    id: "vio-003",
    contractId: "dc-003",
    contractName: "Trade Volume Bronze Contract",
    ruleName: "shipper_address_completeness",
    field: "shipper_address",
    severity: "HIGH",
    status: "OPEN",
    affectedRecords: 7204,
    totalRecords: 144080,
    description: "Shipper address field missing street-level data in 5 of 100 records. Required for entity deduplication address-match signal.",
    recommendation: "Enrich via OFAC SDN address supplement. Fall back to country+postcode pair for partial address match.",
    firstSeen: "2024-09-22T07:45:00Z",
    dataset: "cbp_am_bronze",
  },
  {
    id: "vio-004",
    contractId: "dc-001",
    contractName: "US Import Manifests Contract",
    ruleName: "vessel_name_uniqueness",
    field: "vessel_name",
    severity: "MEDIUM",
    status: "OPEN",
    affectedRecords: 312,
    totalRecords: 152367,
    description: "Duplicate vessel IMO references detected across 312 records with conflicting vessel names. Possible carrier data entry error.",
    recommendation: "Cross-reference IMO vessel registry. Normalise vessel name via canonical vessel lookup table.",
    firstSeen: "2024-09-29T16:03:00Z",
    dataset: "cbp_am_manifests",
  },
  {
    id: "vio-005",
    contractId: "dc-001",
    contractName: "US Import Manifests Contract",
    ruleName: "filing_date_format_iso",
    field: "filing_date",
    severity: "LOW",
    status: "RESOLVED",
    affectedRecords: 0,
    totalRecords: 152367,
    description: "Non-ISO 8601 date formats detected in 48 legacy records. Now resolved by normalisation pipeline upgrade.",
    recommendation: "Resolved in pipeline v3.1.3. Monitor for recurrence in next batch cycle.",
    firstSeen: "2024-09-10T11:30:00Z",
    dataset: "cbp_am_manifests",
  },
];

const BATCHES: BatchIngestion[] = [
  { batchId: "btch-20240930-001", source: "CBP AM Manifests", ingestionDate: "2024-09-30T03:15:00Z", totalRecords: 18421, parsedRecords: 18311, rejectedRecords: 110, duration: "4m 12s", status: "PARTIAL" },
  { batchId: "btch-20240929-001", source: "CBP AM Manifests", ingestionDate: "2024-09-29T03:08:00Z", totalRecords: 17992, parsedRecords: 17992, rejectedRecords: 0, duration: "3m 55s", status: "SUCCESS" },
  { batchId: "btch-20240928-001", source: "WCO HS Taxonomy Sync", ingestionDate: "2024-09-28T01:00:00Z", totalRecords: 5432, parsedRecords: 3241, rejectedRecords: 2191, duration: "2m 07s", status: "FAILED" },
  { batchId: "btch-20240927-001", source: "CBP AM Manifests", ingestionDate: "2024-09-27T03:22:00Z", totalRecords: 19104, parsedRecords: 19104, rejectedRecords: 0, duration: "4m 01s", status: "SUCCESS" },
  { batchId: "btch-20240926-001", source: "OFAC SDN Supplement", ingestionDate: "2024-09-26T02:45:00Z", totalRecords: 1842, parsedRecords: 1842, rejectedRecords: 0, duration: "0m 48s", status: "SUCCESS" },
  { batchId: "btch-20240925-001", source: "CBP AM Manifests", ingestionDate: "2024-09-25T03:17:00Z", totalRecords: 16703, parsedRecords: 16703, rejectedRecords: 0, duration: "3m 42s", status: "SUCCESS" },
];

const FIELD_MISSINGNESS: FieldMissingness[] = [
  { field: "declared_value_usd", layer: "BRONZE", missingCount: 9142, totalCount: 152367, missingnessRate: 6.0, primaryReason: "MASKED", trend: "STABLE" },
  { field: "shipper_address", layer: "BRONZE", missingCount: 7204, totalCount: 144080, missingnessRate: 5.0, primaryReason: "UNAVAILABLE_AT_SOURCE", trend: "DEGRADING" },
  { field: "vessel_imo", layer: "BRONZE", missingCount: 3047, totalCount: 152367, missingnessRate: 2.0, primaryReason: "NOT_REPORTED", trend: "IMPROVING" },
  { field: "consignee_ein", layer: "SILVER", missingCount: 28901, totalCount: 144080, missingnessRate: 20.1, primaryReason: "UNAVAILABLE_AT_SOURCE", trend: "STABLE" },
  { field: "hs_code_6digit", layer: "BRONZE", missingCount: 4821, totalCount: 48210, missingnessRate: 10.0, primaryReason: "NOT_REPORTED", trend: "DEGRADING" },
  { field: "country_of_origin", layer: "SILVER", missingCount: 1204, totalCount: 144080, missingnessRate: 0.8, primaryReason: "UNAVAILABLE_AT_SOURCE", trend: "IMPROVING" },
  { field: "container_teu", layer: "GOLD", missingCount: 512, totalCount: 144080, missingnessRate: 0.4, primaryReason: "NOT_REPORTED", trend: "IMPROVING" },
];

// Trend chart: weekly violation count
const TREND_DATA = [
  { week: "Sep W1", critical: 1, high: 3, medium: 5 },
  { week: "Sep W2", critical: 1, high: 4, medium: 4 },
  { week: "Sep W3", critical: 2, high: 4, medium: 3 },
  { week: "Sep W4", critical: 2, high: 2, medium: 3 },
];

// ── Helper components ──────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: ViolationSeverity }) {
  const map: Record<ViolationSeverity, string> = {
    CRITICAL: "bg-red-500/20 text-red-400 border-red-500/30",
    HIGH: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    MEDIUM: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    LOW: "bg-slate-500/20 text-slate-400 border-slate-500/30",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${map[severity]}`}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: ViolationStatus }) {
  const map: Record<ViolationStatus, string> = {
    OPEN: "bg-red-500/15 text-red-400",
    ACKNOWLEDGED: "bg-amber-500/15 text-amber-400",
    RESOLVED: "bg-teal-500/15 text-teal-400",
  };
  const icons: Record<ViolationStatus, React.ReactNode> = {
    OPEN: <XCircle className="w-3 h-3" />,
    ACKNOWLEDGED: <Clock className="w-3 h-3" />,
    RESOLVED: <CheckCircle2 className="w-3 h-3" />,
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono ${map[status]}`}>
      {icons[status]} {status}
    </span>
  );
}

function HealthIndicator({ health }: { health: DataContract["health"] }) {
  const map: Record<DataContract["health"], { dot: string; label: string }> = {
    HEALTHY: { dot: "bg-teal-400", label: "Healthy" },
    DEGRADED: { dot: "bg-amber-400", label: "Degraded" },
    FAILING: { dot: "bg-red-500", label: "Failing" },
  };
  const { dot, label } = map[health];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${dot} animate-pulse`} />
      <span className={`text-xs font-mono ${health === "HEALTHY" ? "text-teal-400" : health === "DEGRADED" ? "text-amber-400" : "text-red-400"}`}>{label}</span>
    </span>
  );
}

function LayerBadge({ layer }: { layer: FieldMissingness["layer"] }) {
  const map: Record<FieldMissingness["layer"], string> = {
    BRONZE: "bg-orange-900/40 text-orange-400 border-orange-600/30",
    SILVER: "bg-slate-500/20 text-slate-300 border-slate-500/30",
    GOLD: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  };
  return (
    <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${map[layer]}`}>
      {layer}
    </span>
  );
}

function TrendIcon({ trend }: { trend: FieldMissingness["trend"] }) {
  if (trend === "IMPROVING") return <TrendingDown className="w-4 h-4 text-teal-400" />;
  if (trend === "DEGRADING") return <TrendingUp className="w-4 h-4 text-red-400" />;
  return <span className="text-slate-500 text-xs">—</span>;
}

function missingnessBar(rate: number) {
  const color = rate >= 10 ? "bg-red-500" : rate >= 5 ? "bg-amber-500" : rate >= 2 ? "bg-orange-400" : "bg-teal-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-[#1E2A45] overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(rate * 5, 100)}%` }} />
      </div>
      <span className={`text-xs font-mono w-10 text-right ${rate >= 10 ? "text-red-400" : rate >= 5 ? "text-amber-400" : "text-teal-400"}`}>
        {rate.toFixed(1)}%
      </span>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function DataQualityPage() {
  const openDrawer = useVisionStore((s) => s.openDrawer);
  const [expandedVio, setExpandedVio] = useState<string | null>("vio-001");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  // KPI drawer helper
  function openKpiDrawer(
    label: string,
    value: string,
    formula: string,
    count: number,
    denom: number,
    source: string,
    rationale: string
  ) {
    const fields: MockFieldValue[] = [
      { fieldName: "data_contract_version", label: "Contract Version", rawValue: "v2.4.1", normalizedValue: "v2.4.1", derivedValue: null, missingness: null },
      { fieldName: "check_timestamp", label: "Last Checked", rawValue: "2024-09-30T06:00:00Z", normalizedValue: "2024-09-30T06:00:00Z", derivedValue: null, missingness: null },
      { fieldName: "rule_engine", label: "Rule Engine", rawValue: "Great Expectations v0.18", normalizedValue: "Great Expectations v0.18", derivedValue: null, missingness: null },
    ];
    const payload: ProvenanceDrawerPayload = {
      claimLabel: label,
      claimValue: value,
      calculationFormula: formula,
      contributingRecordsCount: count,
      contributingRecordsDenominator: denom,
      sourceDataset: source,
      sourceJurisdiction: "US Customs and Border Protection",
      licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
      transformationPipeline: "Bronze ingest → Silver normalise → Gold contract-check → Violation registry",
      modelEngine: "Great Expectations v0.18 + custom Orchid rule adapters",
      modelVersion: "orchid_dq_v1.3",
      uncertaintyRationale: rationale,
      underlyingRecords: [],
      fieldComparison: fields,
      isMock: true,
    };
    openDrawer(payload);
  }

  const filteredViolations = VIOLATIONS.filter((v) => {
    if (filterSeverity !== "ALL" && v.severity !== filterSeverity) return false;
    if (filterStatus !== "ALL" && v.status !== filterStatus) return false;
    return true;
  });

  const openViolations = VIOLATIONS.filter((v) => v.status === "OPEN").length;
  const totalRules = CONTRACTS.reduce((a, c) => a + c.totalRules, 0);
  const passingRules = CONTRACTS.reduce((a, c) => a + c.passingRules, 0);
  const failingContracts = CONTRACTS.filter((c) => c.health !== "HEALTHY").length;
  const totalBatchRecords = BATCHES.reduce((a, b) => a + b.totalRecords, 0);
  const totalRejected = BATCHES.reduce((a, b) => a + b.rejectedRecords, 0);

  return (
    <VisionLayout pageTitle="Data Quality Monitor — Orchid Vision">
      <div className="p-6 max-w-screen-2xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
              <h1 className="font-serif text-3xl font-bold text-slate-50">
                Data Quality Monitor
              </h1>
              <MockLabel />
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Live data contract health across the ingestion medallion (Bronze → Silver → Gold).
              All violation counts are illustrative. Click any metric to inspect provenance.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-mono text-slate-500 border border-[#1E2A45] rounded px-2 py-1">
              Rule Engine: Great Expectations v0.18
            </span>
            <span className="text-[10px] font-mono text-teal-400 border border-teal-500/30 rounded px-2 py-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Last scan: 2024-09-30 06:05 UTC
            </span>
          </div>
        </div>

        {/* ── Statutory disclaimer ── */}
        <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg px-4 py-3 text-xs text-amber-300/80 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Disclaimer:</strong> Orchid does NOT issue compliance certifications, legal clearance,
            or fraud verdicts. Data quality scores are internal operational signals only, derived from{" "}
            <strong>[MOCK]</strong> illustrative data. They must not be used for regulatory or legal purposes.
          </span>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DenominatorMetric
            label="Contract Rules Passing"
            numerator={passingRules}
            denominator={totalRules}
            unit="rules"
            onClickEvidence={() =>
              openKpiDrawer(
                "Contract Rules Passing",
                `${passingRules} of ${totalRules}`,
                "SUM(passing_rules) / SUM(total_rules) across all active contracts",
                passingRules,
                totalRules,
                "orchid_entities_gold",
                "Rule results are point-in-time snapshots. Counts may differ if contracts are edited between scan cycles."
              )
            }
          />
          <DenominatorMetric
            label="Open Violations"
            numerator={openViolations}
            denominator={VIOLATIONS.length}
            unit="violations"
            onClickEvidence={() =>
              openKpiDrawer(
                "Open Violations",
                `${openViolations} of ${VIOLATIONS.length}`,
                "COUNT(violations WHERE status = 'OPEN') / COUNT(ALL violations)",
                openViolations,
                VIOLATIONS.length,
                "cbp_am_manifests",
                "Violation counts update on each scan cycle. Acknowledged or resolved violations are excluded from OPEN count."
              )
            }
          />
          <DenominatorMetric
            label="Contracts Healthy"
            numerator={CONTRACTS.length - failingContracts}
            denominator={CONTRACTS.length}
            unit="contracts"
            onClickEvidence={() =>
              openKpiDrawer(
                "Contracts Healthy",
                `${CONTRACTS.length - failingContracts} of ${CONTRACTS.length}`,
                "COUNT(contracts WHERE health = 'HEALTHY') / COUNT(ALL contracts)",
                CONTRACTS.length - failingContracts,
                CONTRACTS.length,
                "orchid_dq_registry",
                "Health status is computed from the ratio of passing to total rules per contract. Thresholds: HEALTHY ≥ 95%, DEGRADED ≥ 80%, FAILING < 80%."
              )
            }
          />
          <DenominatorMetric
            label="Batch Records Accepted"
            numerator={totalBatchRecords - totalRejected}
            denominator={totalBatchRecords}
            unit="records"
            onClickEvidence={() =>
              openKpiDrawer(
                "Batch Records Accepted",
                `${(totalBatchRecords - totalRejected).toLocaleString("en-US")} of ${totalBatchRecords.toLocaleString("en-US")}`,
                "SUM(parsed_records) / SUM(total_records) across last 6 batches",
                totalBatchRecords - totalRejected,
                totalBatchRecords,
                "cbp_am_bronze",
                "Record counts are from the raw parse stage. Downstream normalisation may further reduce usable record counts."
              )
            }
          />
        </div>

        {/* ── Two-col layout: Contract health + Trend chart ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* Contract health cards */}
          <div className="lg:col-span-3 space-y-3">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Active Data Contracts
            </h2>
            {CONTRACTS.map((contract) => {
              const pct = Math.round((contract.passingRules / contract.totalRules) * 100);
              return (
                <GlassPanel key={contract.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-100 truncate">{contract.name}</span>
                        <span className="text-[9px] font-mono text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                          {contract.version}
                        </span>
                        <HealthIndicator health={contract.health} />
                      </div>
                      <p className="text-[10px] font-mono text-slate-500 mb-2">
                        dataset: <span className="text-slate-400">{contract.dataset}</span> · owner: <span className="text-slate-400">{contract.owner}</span>
                      </p>
                      {/* Rule pass bar */}
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 rounded-full bg-[#1E2A45] overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pct === 100 ? "bg-teal-500" : pct >= 80 ? "bg-amber-500" : "bg-red-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-xs font-mono text-slate-300 w-20 text-right">
                          {contract.passingRules} of {contract.totalRules} rules
                        </span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-2xl font-mono font-bold ${pct === 100 ? "text-teal-400" : pct >= 80 ? "text-amber-400" : "text-red-400"}`}>
                        {pct}%
                      </div>
                      <div className="text-[9px] font-mono text-slate-500 mt-0.5">pass rate</div>
                    </div>
                  </div>
                </GlassPanel>
              );
            })}
          </div>

          {/* Violation trend chart */}
          <div className="lg:col-span-2">
            <GlassPanel className="p-4 h-full">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
                <TrendingUp className="w-3.5 h-3.5" /> Weekly Violation Trend <MockLabel />
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={TREND_DATA} barSize={14}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1E2A45" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{ background: "#0B1020", border: "1px solid #1E2A45", borderRadius: 8, fontSize: 11 }}
                    labelStyle={{ color: "#94a3b8" }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 10, color: "#64748b" }} />
                  <Bar dataKey="critical" fill="#ef4444" name="Critical" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="high" fill="#f97316" name="High" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="medium" fill="#f59e0b" name="Medium" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-[9px] font-mono text-slate-600 mt-2 text-center">[MOCK] Illustrative weekly violation counts — Q3 2024</p>
            </GlassPanel>
          </div>
        </div>

        {/* ── Field Missingness table ── */}
        <GlassPanel className="p-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Database className="w-3.5 h-3.5" /> Bronze / Silver / Gold Field Missingness <MockLabel />
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A45]">
                  <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase">Field</th>
                  <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase">Layer</th>
                  <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase">Missing (N of M)</th>
                  <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase min-w-[160px]">Rate</th>
                  <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase">Primary Reason</th>
                  <th className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase">Trend</th>
                </tr>
              </thead>
              <tbody>
                {FIELD_MISSINGNESS.map((row, i) => (
                  <tr
                    key={row.field}
                    className={`border-b border-[#1E2A45]/40 hover:bg-[#1E2A45]/20 transition-colors ${i % 2 === 0 ? "" : "bg-[#0F1629]/30"}`}
                  >
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{row.field}</td>
                    <td className="py-2.5 px-3"><LayerBadge layer={row.layer} /></td>
                    <td className="py-2.5 px-3 font-mono text-xs text-slate-300">
                      {row.missingCount.toLocaleString("en-US")} of {row.totalCount.toLocaleString("en-US")}
                    </td>
                    <td className="py-2.5 px-3">{missingnessBar(row.missingnessRate)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        row.primaryReason === "MASKED"
                          ? "bg-amber-500/10 text-amber-400"
                          : row.primaryReason === "UNAVAILABLE_AT_SOURCE"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-slate-500/10 text-slate-400"
                      }`}>
                        {row.primaryReason.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <TrendIcon trend={row.trend} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* ── Contract Violation Cards ── */}
        <div>
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-red-400" /> Contract Violations
              <span className="text-amber-400 font-bold">{filteredViolations.length}</span>
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="bg-[#0B1020] border border-[#1E2A45] rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/50"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">Critical</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-[#0B1020] border border-[#1E2A45] rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/50"
              >
                <option value="ALL">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ACKNOWLEDGED">Acknowledged</option>
                <option value="RESOLVED">Resolved</option>
              </select>
            </div>
          </div>
          <div className="space-y-3">
            {filteredViolations.map((vio) => {
              const isExpanded = expandedVio === vio.id;
              return (
                <GlassPanel
                  key={vio.id}
                  className={`overflow-hidden transition-all ${vio.severity === "CRITICAL" ? "border-red-500/30" : vio.severity === "HIGH" ? "border-orange-500/20" : ""}`}
                >
                  {/* Violation header */}
                  <button
                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-[#1E2A45]/10 transition-colors"
                    onClick={() => setExpandedVio(isExpanded ? null : vio.id)}
                  >
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <SeverityBadge severity={vio.severity} />
                          <StatusBadge status={vio.status} />
                          <span className="text-[10px] font-mono text-slate-500">{vio.id}</span>
                        </div>
                        <p className="text-sm font-semibold text-slate-100">{vio.ruleName}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {vio.contractName} · field: <span className="text-slate-400 font-mono">{vio.field}</span> · dataset: <span className="text-slate-400 font-mono">{vio.dataset}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className={`text-lg font-mono font-bold ${vio.severity === "CRITICAL" ? "text-red-400" : vio.severity === "HIGH" ? "text-orange-400" : vio.severity === "MEDIUM" ? "text-amber-400" : "text-slate-400"}`}>
                        {vio.affectedRecords.toLocaleString("en-US")}
                      </div>
                      <div className="text-[9px] font-mono text-slate-500">
                        of {vio.totalRecords.toLocaleString("en-US")} records
                      </div>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-[#1E2A45] pt-3 space-y-3">
                      <p className="text-xs text-slate-300 leading-relaxed">{vio.description}</p>
                      <div className="bg-[#0F1629] border border-[#1E2A45] rounded p-3">
                        <p className="text-[10px] font-mono text-amber-400 mb-1">▸ Recommendation</p>
                        <p className="text-xs text-slate-300 leading-relaxed">{vio.recommendation}</p>
                      </div>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <p className="text-[10px] font-mono text-slate-500">
                          First seen: <span className="text-slate-400">{new Date(vio.firstSeen).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC</span>
                        </p>
                        <button
                          className="text-[10px] font-mono text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/50 rounded px-3 py-1 transition-colors"
                          onClick={() => {
                            const fields: MockFieldValue[] = [
                              { fieldName: "rule_name", label: "Rule Name", rawValue: vio.ruleName, normalizedValue: vio.ruleName, derivedValue: null, missingness: null },
                              { fieldName: "field", label: "Affected Field", rawValue: vio.field, normalizedValue: vio.field, derivedValue: null, missingness: null },
                              { fieldName: "dataset", label: "Dataset", rawValue: vio.dataset, normalizedValue: vio.dataset, derivedValue: null, missingness: null },
                              { fieldName: "severity", label: "Severity", rawValue: vio.severity, normalizedValue: vio.severity, derivedValue: null, missingness: null },
                            ];
                            const payload: ProvenanceDrawerPayload = {
                              claimLabel: vio.ruleName,
                              claimValue: `${vio.affectedRecords.toLocaleString("en-US")} of ${vio.totalRecords.toLocaleString("en-US")} records`,
                              calculationFormula: `COUNT(records WHERE ${vio.field} FAILS ${vio.ruleName}) / COUNT(ALL records IN ${vio.dataset})`,
                              contributingRecordsCount: vio.affectedRecords,
                              contributingRecordsDenominator: vio.totalRecords,
                              sourceDataset: vio.dataset,
                              sourceJurisdiction: "US Customs and Border Protection",
                              licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
                              transformationPipeline: "Bronze ingest → Silver normalise → Gold contract-check → Violation registry",
                              modelEngine: "Great Expectations v0.18 + custom Orchid rule adapters",
                              modelVersion: "orchid_dq_v1.3",
                              uncertaintyRationale: `Violation counts are point-in-time snapshots from the last scan cycle. Actual affected record count may vary if upstream data is reprocessed.`,
                              underlyingRecords: [],
                              fieldComparison: fields,
                              isMock: true,
                            };
                            openDrawer(payload);
                          }}
                        >
                          Inspect Provenance →
                        </button>
                      </div>
                    </div>
                  )}
                </GlassPanel>
              );
            })}
          </div>
        </div>

        {/* ── Ingestion Batch log ── */}
        <GlassPanel className="p-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Layers className="w-3.5 h-3.5" /> Recent Ingestion Batches (Last 6) <MockLabel />
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1E2A45]">
                  {["Batch ID", "Source", "Date (UTC)", "Records (Parsed / Total)", "Rejected", "Duration", "Status"].map((h) => (
                    <th key={h} className="text-left py-2 px-3 text-[10px] font-mono text-slate-500 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BATCHES.map((b, i) => {
                  const statusColor = b.status === "SUCCESS" ? "text-teal-400" : b.status === "PARTIAL" ? "text-amber-400" : "text-red-400";
                  const statusIcon = b.status === "SUCCESS" ? <CheckCircle2 className="w-3 h-3" /> : b.status === "PARTIAL" ? <Clock className="w-3 h-3" /> : <XCircle className="w-3 h-3" />;
                  return (
                    <tr key={b.batchId} className={`border-b border-[#1E2A45]/40 hover:bg-[#1E2A45]/20 transition-colors ${i % 2 === 0 ? "" : "bg-[#0F1629]/20"}`}>
                      <td className="py-2.5 px-3 font-mono text-[10px] text-slate-400">{b.batchId}</td>
                      <td className="py-2.5 px-3 text-xs text-slate-300">{b.source}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{b.ingestionDate.replace("T", " ").replace(":00Z", " UTC")}</td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-300">
                        {b.parsedRecords.toLocaleString("en-US")} <span className="text-slate-600">of</span> {b.totalRecords.toLocaleString("en-US")}
                      </td>
                      <td className={`py-2.5 px-3 font-mono text-xs ${b.rejectedRecords > 0 ? "text-red-400" : "text-slate-500"}`}>
                        {b.rejectedRecords.toLocaleString("en-US")}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-xs text-slate-400">{b.duration}</td>
                      <td className="py-2.5 px-3">
                        <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${statusColor}`}>
                          {statusIcon} {b.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* ── Footer disclaimer ── */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          [MOCK] All data contract metrics, violation counts, batch statistics, and field missingness rates are synthetic illustrative data.
          Orchid does NOT issue compliance certifications, legal clearance, or fraud verdicts. · orchid_dq_v1.3 · Q3 2024 Sample
        </p>
      </div>
    </VisionLayout>
  );
}
