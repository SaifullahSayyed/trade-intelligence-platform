/**
 * Screen 8: Alerts & Watchlists  /vision/alerts
 *
 * Threshold-based alerting dashboard with watchlist management,
 * alert history feed, and EvidenceDrawer integration.
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
import { MOCK_COMPANIES } from "../../vision/mock/companies";
import { MOCK_SHIPMENTS } from "../../vision/mock/shipments";
import type { ProvenanceDrawerPayload, MockFieldValue } from "../../vision/mock/types";
import {
  Bell,
  BellRing,
  AlertTriangle,
  CheckCircle2,
  Clock,
  X,
  Plus,
  ChevronRight,
  Info,
  Building2,
  Layers,
  Globe,
  TrendingUp,
  Zap,
  Eye,
  EyeOff,
  Filter,
  Trash2,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type AlertStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
type AlertType =
  | "VOLUME_SPIKE"
  | "NEW_ENTITY"
  | "CONFIDENCE_DROP"
  | "WATCHLIST_HIT"
  | "BATCH_FAILURE"
  | "DUPLICATE_CLUSTER";

interface TradeAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  description: string;
  entityId?: string;
  entityName?: string;
  triggeredAt: string;
  metric: string;
  threshold: string;
  actual: string;
  affectedRecords: number;
  totalRecords: number;
}

interface Watchlist {
  id: string;
  name: string;
  description: string;
  entityCount: number;
  active: boolean;
  lastTriggered: string | null;
  triggerCount: number;
  criteriaType: "ENTITY_NAME" | "HS_CODE" | "CORRIDOR" | "COUNTRY";
  criteria: string[];
}

// ── Mock data ─────────────────────────────────────────────────────────────
const ALERTS: TradeAlert[] = [
  {
    id: "alrt-001",
    type: "VOLUME_SPIKE",
    severity: "HIGH",
    status: "ACTIVE",
    title: "Volume Spike — Helix Components Ltd via Trans-Pacific South",
    description: "Inbound TEU volume for Helix Components Ltd exceeded 2× the 30-day rolling average on the Trans-Pacific South corridor in the last 7 days.",
    entityId: "hlx-002",
    entityName: "Helix Components Ltd",
    triggeredAt: "2024-09-29T14:22:00Z",
    metric: "TEU Volume (7-day)",
    threshold: "≤ 2× 30-day avg",
    actual: "3.4× (412 TEU vs 121 TEU avg)",
    affectedRecords: 18,
    totalRecords: 600,
  },
  {
    id: "alrt-002",
    type: "WATCHLIST_HIT",
    severity: "CRITICAL",
    status: "ACTIVE",
    title: "Watchlist Match — HS 852852 Corridor Monitor",
    description: "5 new shipments filed under HS 852852 (flat panel displays) through USLAX in the last 48h match the HS Code Watchlist threshold of > 3 new filings.",
    triggeredAt: "2024-09-30T08:01:00Z",
    metric: "New HS 852852 Filings (48h)",
    threshold: "≤ 3 filings per 48h",
    actual: "5 filings",
    affectedRecords: 5,
    totalRecords: 600,
  },
  {
    id: "alrt-003",
    type: "CONFIDENCE_DROP",
    severity: "HIGH",
    status: "ACKNOWLEDGED",
    title: "Confidence Score Drop — Pacific Rim Trading Co.",
    description: "Entity confidence score for Pacific Rim Trading Co. dropped from 0.88 to 0.71 following a new unresolved alias cluster discovered in the latest batch.",
    entityId: "prc-003",
    entityName: "Pacific Rim Trading Co.",
    triggeredAt: "2024-09-28T11:45:00Z",
    metric: "Entity Confidence Score",
    threshold: "≥ 0.80",
    actual: "0.71 (↓ from 0.88)",
    affectedRecords: 34,
    totalRecords: 600,
  },
  {
    id: "alrt-004",
    type: "NEW_ENTITY",
    severity: "MEDIUM",
    status: "ACTIVE",
    title: "New Canonical Entity — Solar Tech International",
    description: "New canonical entity 'Solar Tech International' created from 3 manifest filings with no prior match in the entity registry. Requires baseline review.",
    entityId: "sti-019",
    entityName: "Solar Tech International",
    triggeredAt: "2024-09-27T03:18:00Z",
    metric: "New Entity Registry Events",
    threshold: "0 per batch",
    actual: "1 new entity",
    affectedRecords: 3,
    totalRecords: 600,
  },
  {
    id: "alrt-005",
    type: "DUPLICATE_CLUSTER",
    severity: "MEDIUM",
    status: "ACKNOWLEDGED",
    title: "Duplicate Cluster Pending — Meridian Logistics Group",
    description: "2 candidate pairs involving Meridian Logistics Group remain in PENDING status for > 5 days, blocking downstream entity aggregation.",
    entityId: "mlg-005",
    entityName: "Meridian Logistics Group",
    triggeredAt: "2024-09-25T09:00:00Z",
    metric: "Pending Review Age",
    threshold: "≤ 5 days pending",
    actual: "7 days pending",
    affectedRecords: 2,
    totalRecords: 8,
  },
  {
    id: "alrt-006",
    type: "BATCH_FAILURE",
    severity: "CRITICAL",
    status: "RESOLVED",
    title: "Batch Failure — WCO HS Taxonomy Sync",
    description: "WCO HS Taxonomy sync batch on 2024-09-28 rejected 2,191 of 5,432 records (40.3% rejection rate). Root cause: HS code length validation failure.",
    triggeredAt: "2024-09-28T01:05:00Z",
    metric: "Batch Rejection Rate",
    threshold: "< 5% rejection rate",
    actual: "40.3% (2,191 of 5,432 rejected)",
    affectedRecords: 2191,
    totalRecords: 5432,
  },
  {
    id: "alrt-007",
    type: "VOLUME_SPIKE",
    severity: "LOW",
    status: "RESOLVED",
    title: "Minor Spike — Northwind Retail Group (USLAX)",
    description: "Northwind Retail Group filed 12 manifests in a single day on 2024-09-24 at USLAX, 1.4× the 30-day daily average. Within normal operational bounds.",
    entityId: "nrg-001",
    entityName: "Northwind Retail Group",
    triggeredAt: "2024-09-24T23:59:00Z",
    metric: "Daily Filing Count",
    threshold: "≤ 1.5× 30-day avg",
    actual: "1.4× (12 vs 8.6 avg)",
    affectedRecords: 12,
    totalRecords: 600,
  },
];

const WATCHLISTS: Watchlist[] = [
  {
    id: "wl-001",
    name: "Trans-Pacific South Monitor",
    description: "Flag any entity with TEU volume > 2× rolling average on Trans-Pacific South corridor",
    entityCount: 8,
    active: true,
    lastTriggered: "2024-09-29T14:22:00Z",
    triggerCount: 3,
    criteriaType: "CORRIDOR",
    criteria: ["Trans-Pacific South", "TEU > 2× avg"],
  },
  {
    id: "wl-002",
    name: "HS 852852 New Filings",
    description: "Alert on > 3 new HS 852852 filings within 48h through any US port",
    entityCount: 0,
    active: true,
    lastTriggered: "2024-09-30T08:01:00Z",
    triggerCount: 5,
    criteriaType: "HS_CODE",
    criteria: ["HS 852852", "Filing count > 3/48h"],
  },
  {
    id: "wl-003",
    name: "High-Volume Consignees",
    description: "Track entities with > 50 matched shipments in the Q3 2024 sample",
    entityCount: 6,
    active: true,
    lastTriggered: "2024-09-22T06:00:00Z",
    triggerCount: 1,
    criteriaType: "ENTITY_NAME",
    criteria: ["Matched shipments > 50", "Q3 2024"],
  },
  {
    id: "wl-004",
    name: "VNSGN Origin Monitor",
    description: "All entities originating from Saigon Port (VNSGN) with declared value > $500K",
    entityCount: 12,
    active: false,
    lastTriggered: null,
    triggerCount: 0,
    criteriaType: "COUNTRY",
    criteria: ["Origin: VNSGN", "Declared value > $500K"],
  },
];

// Timeline data for alert trend
const ALERT_TREND = [
  { day: "Sep 23", critical: 0, high: 1, medium: 0, low: 1 },
  { day: "Sep 24", critical: 0, high: 0, medium: 1, low: 1 },
  { day: "Sep 25", critical: 0, high: 0, medium: 1, low: 0 },
  { day: "Sep 26", critical: 0, high: 0, medium: 0, low: 0 },
  { day: "Sep 27", critical: 0, high: 0, medium: 1, low: 0 },
  { day: "Sep 28", critical: 1, high: 1, medium: 0, low: 0 },
  { day: "Sep 29", critical: 0, high: 1, medium: 0, low: 0 },
  { day: "Sep 30", critical: 1, high: 0, medium: 0, low: 0 },
];

// ── Helper components ─────────────────────────────────────────────────────
function AlertSeverityBadge({ severity }: { severity: AlertSeverity }) {
  const map: Record<AlertSeverity, string> = {
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

function AlertStatusBadge({ status }: { status: AlertStatus }) {
  const map: Record<AlertStatus, { color: string; icon: React.ReactNode }> = {
    ACTIVE: { color: "text-red-400", icon: <BellRing className="w-3 h-3 animate-pulse" /> },
    ACKNOWLEDGED: { color: "text-amber-400", icon: <Clock className="w-3 h-3" /> },
    RESOLVED: { color: "text-teal-400", icon: <CheckCircle2 className="w-3 h-3" /> },
  };
  const { color, icon } = map[status];
  return (
    <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${color}`}>
      {icon} {status}
    </span>
  );
}

function AlertTypeIcon({ type }: { type: AlertType }) {
  const map: Record<AlertType, React.ReactNode> = {
    VOLUME_SPIKE: <TrendingUp className="w-4 h-4 text-orange-400" />,
    NEW_ENTITY: <Building2 className="w-4 h-4 text-teal-400" />,
    CONFIDENCE_DROP: <AlertTriangle className="w-4 h-4 text-amber-400" />,
    WATCHLIST_HIT: <Eye className="w-4 h-4 text-red-400" />,
    BATCH_FAILURE: <X className="w-4 h-4 text-red-500" />,
    DUPLICATE_CLUSTER: <Layers className="w-4 h-4 text-amber-400" />,
  };
  return <>{map[type]}</>;
}

// ── Main Page ─────────────────────────────────────────────────────────────
export default function AlertsPage() {
  const openDrawer = useVisionStore((s) => s.openDrawer);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [watchlists, setWatchlists] = useState<Watchlist[]>(WATCHLISTS);

  const filteredAlerts = ALERTS.filter((a) => {
    if (filterStatus !== "ALL" && a.status !== filterStatus) return false;
    if (filterSeverity !== "ALL" && a.severity !== filterSeverity) return false;
    return true;
  });

  const activeAlerts = ALERTS.filter((a) => a.status === "ACTIVE").length;
  const criticalAlerts = ALERTS.filter((a) => a.severity === "CRITICAL").length;
  const activeWatchlists = watchlists.filter((w) => w.active).length;

  function toggleWatchlist(id: string) {
    setWatchlists((prev) =>
      prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w))
    );
  }

  function openAlertDrawer(alert: TradeAlert) {
    const fields: MockFieldValue[] = [
      { fieldName: "alert_type", label: "Alert Type", rawValue: alert.type, normalizedValue: alert.type, derivedValue: null, missingness: null },
      { fieldName: "metric", label: "Metric", rawValue: alert.metric, normalizedValue: alert.metric, derivedValue: null, missingness: null },
      { fieldName: "threshold", label: "Threshold", rawValue: alert.threshold, normalizedValue: alert.threshold, derivedValue: null, missingness: null },
      { fieldName: "actual", label: "Actual Value", rawValue: alert.actual, normalizedValue: alert.actual, derivedValue: null, missingness: null },
      { fieldName: "triggered_at", label: "Triggered At", rawValue: alert.triggeredAt, normalizedValue: alert.triggeredAt, derivedValue: null, missingness: null },
    ];
    const payload: ProvenanceDrawerPayload = {
      claimLabel: alert.title,
      claimValue: `${alert.affectedRecords} of ${alert.totalRecords} records`,
      calculationFormula: `Alert triggered when ${alert.metric} ${alert.threshold}. Actual: ${alert.actual}`,
      contributingRecordsCount: alert.affectedRecords,
      contributingRecordsDenominator: alert.totalRecords,
      sourceDataset: "cbp_am_manifests",
      sourceJurisdiction: "US Customs and Border Protection",
      licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
      transformationPipeline: "Bronze ingest → Silver normalise → Gold aggregation → Alert rule engine",
      modelEngine: "Orchid Alert Engine v1.0 (Threshold-based)",
      modelVersion: "orchid_alerts_v1.0",
      uncertaintyRationale:
        "Alert thresholds are applied to [MOCK] illustrative data. Real production thresholds would be calibrated against actual historical baselines.",
      underlyingRecords: [],
      fieldComparison: fields,
      isMock: true,
    };
    openDrawer(payload);
  }

  return (
    <VisionLayout pageTitle="Alerts & Watchlists — Orchid Vision">
      <div className="p-6 max-w-screen-2xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-6 h-6 text-amber-400" />
              <h1 className="font-serif text-3xl font-bold text-slate-50">
                Alerts & Watchlists
              </h1>
              <MockLabel />
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Threshold-based alerting on trade volume anomalies, confidence drops, watchlist hits,
              and batch failures. Click any alert to inspect provenance.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`text-[10px] font-mono border rounded px-2 py-1 flex items-center gap-1 ${activeAlerts > 0 ? "text-red-400 border-red-500/30 bg-red-500/5" : "text-teal-400 border-teal-500/30"}`}>
              <BellRing className="w-3 h-3" /> {activeAlerts} Active Alerts
            </span>
            <span className="text-[10px] font-mono text-slate-500 border border-[#1E2A45] rounded px-2 py-1">
              Rule Engine: Orchid Alerts v1.0
            </span>
          </div>
        </div>

        {/* ── Statutory disclaimer ── */}
        <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg px-4 py-3 text-xs text-amber-300/80 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Disclaimer:</strong> Alert thresholds are operational data signals only, derived from{" "}
            <strong>[MOCK]</strong> illustrative data. Orchid does NOT issue compliance certifications,
            legal clearance, sanctions determinations, or fraud verdicts.
          </span>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DenominatorMetric
            label="Active Alerts"
            numerator={activeAlerts}
            denominator={ALERTS.length}
            unit="alerts"
            onClickEvidence={() => {
              const payload: ProvenanceDrawerPayload = {
                claimLabel: "Active Alerts",
                claimValue: `${activeAlerts} of ${ALERTS.length}`,
                calculationFormula: "COUNT(alerts WHERE status = 'ACTIVE') / COUNT(ALL alerts)",
                contributingRecordsCount: activeAlerts,
                contributingRecordsDenominator: ALERTS.length,
                sourceDataset: "orchid_alert_registry",
                sourceJurisdiction: "US Customs and Border Protection",
                licenseNote: "Derived from CBP AMS manifest data — 15-day delay per 19 CFR 103.31",
                transformationPipeline: "Gold aggregation → Alert rule engine → Alert registry",
                modelEngine: "Orchid Alert Engine v1.0",
                modelVersion: "orchid_alerts_v1.0",
                uncertaintyRationale: "Alert counts are point-in-time snapshots and may change as new batches arrive.",
                underlyingRecords: [],
                fieldComparison: [],
                isMock: true,
              };
              openDrawer(payload);
            }}
          />
          <DenominatorMetric
            label="Critical Alerts"
            numerator={criticalAlerts}
            denominator={ALERTS.length}
            unit="critical"
            onClickEvidence={() => {
              const payload: ProvenanceDrawerPayload = {
                claimLabel: "Critical Alerts",
                claimValue: `${criticalAlerts} of ${ALERTS.length}`,
                calculationFormula: "COUNT(alerts WHERE severity = 'CRITICAL') / COUNT(ALL alerts)",
                contributingRecordsCount: criticalAlerts,
                contributingRecordsDenominator: ALERTS.length,
                sourceDataset: "orchid_alert_registry",
                sourceJurisdiction: "US Customs and Border Protection",
                licenseNote: "Derived from CBP AMS manifest data",
                transformationPipeline: "Gold aggregation → Alert rule engine",
                modelEngine: "Orchid Alert Engine v1.0",
                modelVersion: "orchid_alerts_v1.0",
                uncertaintyRationale: "Critical severity threshold is defined as batch failure or watchlist match with > 3 records affected.",
                underlyingRecords: [],
                fieldComparison: [],
                isMock: true,
              };
              openDrawer(payload);
            }}
          />
          <DenominatorMetric
            label="Watchlists Active"
            numerator={activeWatchlists}
            denominator={watchlists.length}
            unit="watchlists"
            onClickEvidence={() => {
              const payload: ProvenanceDrawerPayload = {
                claimLabel: "Watchlists Active",
                claimValue: `${activeWatchlists} of ${watchlists.length}`,
                calculationFormula: "COUNT(watchlists WHERE active = true) / COUNT(ALL watchlists)",
                contributingRecordsCount: activeWatchlists,
                contributingRecordsDenominator: watchlists.length,
                sourceDataset: "orchid_watchlist_registry",
                sourceJurisdiction: "US Customs and Border Protection",
                licenseNote: "Internal Orchid watchlist configuration",
                transformationPipeline: "Alert rule engine → Watchlist match → Notification",
                modelEngine: "Orchid Alert Engine v1.0",
                modelVersion: "orchid_alerts_v1.0",
                uncertaintyRationale: "Watchlist activation is a user-controlled setting.",
                underlyingRecords: [],
                fieldComparison: [],
                isMock: true,
              };
              openDrawer(payload);
            }}
          />
          <DenominatorMetric
            label="Records Monitored"
            numerator={MOCK_SHIPMENTS.length}
            denominator={MOCK_SHIPMENTS.length}
            unit="BOLs"
            onClickEvidence={() => {
              const payload: ProvenanceDrawerPayload = {
                claimLabel: "Records Monitored",
                claimValue: `${MOCK_SHIPMENTS.length} of ${MOCK_SHIPMENTS.length}`,
                calculationFormula: "COUNT(MOCK_SHIPMENTS) — all records in the Q3 2024 sample",
                contributingRecordsCount: MOCK_SHIPMENTS.length,
                contributingRecordsDenominator: MOCK_SHIPMENTS.length,
                sourceDataset: "cbp_am_manifests",
                sourceJurisdiction: "US Customs and Border Protection",
                licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
                transformationPipeline: "Bronze ingest → Silver normalise → Alert monitoring",
                modelEngine: "Orchid Alert Engine v1.0",
                modelVersion: "orchid_alerts_v1.0",
                uncertaintyRationale: "Count reflects the Q3 2024 [MOCK] sample only.",
                underlyingRecords: [],
                fieldComparison: [],
                isMock: true,
              };
              openDrawer(payload);
            }}
          />
        </div>

        {/* ── Alert feed + Watchlists side-by-side ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Alert feed (2/3) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <BellRing className="w-3.5 h-3.5 text-red-400" /> Alert Feed
                <span className="text-amber-400 font-bold">{filteredAlerts.length}</span>
              </h2>
              <div className="flex items-center gap-3 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-[#0B1020] border border-[#1E2A45] rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none focus:border-amber-500/50"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="ACKNOWLEDGED">Acknowledged</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
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
              </div>
            </div>

            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="cursor-pointer"
                  onClick={() => openAlertDrawer(alert)}
                >
                <GlassPanel
                  className={`p-4 hover:border-amber-500/30 transition-all ${
                    alert.severity === "CRITICAL" ? "border-red-500/30" :
                    alert.status === "RESOLVED" ? "opacity-60" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <AlertTypeIcon type={alert.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <AlertSeverityBadge severity={alert.severity} />
                        <AlertStatusBadge status={alert.status} />
                        <span className="text-[9px] font-mono text-slate-600">{alert.id}</span>
                        <span className="text-[9px] font-mono text-slate-500 ml-auto">
                          {new Date(alert.triggeredAt).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-100 mb-1">{alert.title}</p>
                      <p className="text-xs text-slate-400 leading-relaxed mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 flex-wrap text-[10px] font-mono">
                        <span className="text-slate-500">
                          Metric: <span className="text-slate-400">{alert.metric}</span>
                        </span>
                        <span className="text-slate-500">
                          Threshold: <span className="text-slate-400">{alert.threshold}</span>
                        </span>
                        <span className={`${alert.severity === "CRITICAL" ? "text-red-400" : alert.severity === "HIGH" ? "text-orange-400" : "text-amber-400"}`}>
                          Actual: {alert.actual}
                        </span>
                        <span className="text-slate-500 ml-auto">
                          {alert.affectedRecords.toLocaleString("en-US")} of {alert.totalRecords.toLocaleString("en-US")} records
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-600 flex-shrink-0 mt-1" />
                  </div>
                </GlassPanel>
                </div>
              ))}
            </div>
          </div>

          {/* Watchlists (1/3) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-teal-400" /> Watchlists
              </h2>
              <button className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 border border-amber-500/30 hover:border-amber-400/50 rounded px-2 py-1 transition-colors">
                <Plus className="w-3 h-3" /> New
              </button>
            </div>

            <div className="space-y-3">
              {watchlists.map((wl) => (
                <GlassPanel key={wl.id} className={`p-4 ${!wl.active ? "opacity-50" : ""}`}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${wl.active ? "bg-teal-400 animate-pulse" : "bg-slate-600"}`} />
                        <span className="text-xs font-semibold text-slate-200 truncate">{wl.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{wl.description}</p>
                    </div>
                    <button
                      onClick={() => toggleWatchlist(wl.id)}
                      className="flex-shrink-0 text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      {wl.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {wl.criteria.map((c) => (
                      <span key={c} className="text-[9px] font-mono px-1.5 py-0.5 bg-[#1E2A45] rounded text-slate-400 border border-[#2E3A55]">
                        {c}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-[9px] font-mono text-slate-600">
                    <span>
                      Triggers: <span className="text-amber-400 font-bold">{wl.triggerCount}</span>
                    </span>
                    <span>
                      {wl.lastTriggered
                        ? `Last: ${new Date(wl.lastTriggered).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "short", timeStyle: "short" })} UTC`
                        : "Never triggered"}
                    </span>
                  </div>
                </GlassPanel>
              ))}
            </div>

            {/* Alert type legend */}
            <GlassPanel className="p-4">
              <h3 className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-3">Alert Types</h3>
              <div className="space-y-2">
                {[
                  { type: "VOLUME_SPIKE" as AlertType, label: "Volume Spike" },
                  { type: "WATCHLIST_HIT" as AlertType, label: "Watchlist Hit" },
                  { type: "CONFIDENCE_DROP" as AlertType, label: "Confidence Drop" },
                  { type: "NEW_ENTITY" as AlertType, label: "New Entity" },
                  { type: "DUPLICATE_CLUSTER" as AlertType, label: "Duplicate Cluster" },
                  { type: "BATCH_FAILURE" as AlertType, label: "Batch Failure" },
                ].map(({ type, label }) => (
                  <div key={type} className="flex items-center gap-2">
                    <AlertTypeIcon type={type} />
                    <span className="text-[10px] text-slate-400">{label}</span>
                    <span className="ml-auto text-[9px] font-mono text-slate-600">
                      {ALERTS.filter((a) => a.type === type).length} total
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* ── Alert activity timeline bar ── */}
        <GlassPanel className="p-4">
          <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-4">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Alert Activity — Last 8 Days <MockLabel />
          </h2>
          <div className="flex items-end gap-2 h-24">
            {ALERT_TREND.map((day) => {
              const total = day.critical + day.high + day.medium + day.low;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse gap-0.5 justify-end" style={{ height: "72px" }}>
                    {day.critical > 0 && (
                      <div className="w-full bg-red-500 rounded-sm" style={{ height: `${day.critical * 20}px` }} title="Critical" />
                    )}
                    {day.high > 0 && (
                      <div className="w-full bg-orange-500 rounded-sm" style={{ height: `${day.high * 20}px` }} title="High" />
                    )}
                    {day.medium > 0 && (
                      <div className="w-full bg-amber-500 rounded-sm" style={{ height: `${day.medium * 20}px` }} title="Medium" />
                    )}
                    {day.low > 0 && (
                      <div className="w-full bg-slate-500 rounded-sm" style={{ height: `${day.low * 20}px` }} title="Low" />
                    )}
                    {total === 0 && (
                      <div className="w-full bg-[#1E2A45] rounded-sm" style={{ height: "4px" }} />
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-600">{day.day.split(" ")[1]}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-2 flex-wrap">
            {[
              { color: "bg-red-500", label: "Critical" },
              { color: "bg-orange-500", label: "High" },
              { color: "bg-amber-500", label: "Medium" },
              { color: "bg-slate-500", label: "Low" },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-sm ${color}`} />
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          [MOCK] All alert thresholds, watchlist triggers, and activity metrics are synthetic illustrative data.
          Orchid does NOT issue compliance certifications, legal clearance, or fraud verdicts. · orchid_alerts_v1.0 · Q3 2024 Sample
        </p>
      </div>
    </VisionLayout>
  );
}
