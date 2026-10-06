import React, { useState, useMemo } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  GitMerge,
  GitPullRequest,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  HelpCircle,
  FileCheck,
  Sliders,
  History,
  Lock,
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
  MOCK_REVIEW_QUEUE,
  MOCK_AUDIT_LOG,
  MockReviewPair,
  MockAuditEntry,
} from "@/vision/mock";

interface SessionDecision {
  reviewId: string;
  action: "ACCEPTED" | "REJECTED" | "DEFERRED";
  actor: string;
  timestamp: string;
  hash: string;
  notes: string;
}

export default function EntityResolutionWorkbench() {
  const { openDrawer } = useVisionStore();

  // Review queue state
  const [queue, setQueue] = useState<MockReviewPair[]>(MOCK_REVIEW_QUEUE);
  const [selectedReviewId, setSelectedReviewId] = useState<string>(
    MOCK_REVIEW_QUEUE[0].reviewId
  );
  const [sessionDecisions, setSessionDecisions] = useState<SessionDecision[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [investigatorNote, setInvestigatorNote] = useState<string>("");

  // Current active review pair
  const currentPair = useMemo(() => {
    return queue.find((p) => p.reviewId === selectedReviewId) || queue[0];
  }, [queue, selectedReviewId]);

  // Handle decisions (Accept, Reject, Defer)
  const handleDecision = (action: "ACCEPTED" | "REJECTED" | "DEFERRED") => {
    const timestamp = new Date().toISOString();
    const hash = Array.from({ length: 64 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join("");

    const decision: SessionDecision = {
      reviewId: currentPair.reviewId,
      action,
      actor: "lead.investigator@orchid-intel.internal",
      timestamp,
      hash,
      notes:
        investigatorNote.trim() ||
        (action === "ACCEPTED"
          ? "Confirmed common corporate umbrella following address & tariff verification."
          : action === "REJECTED"
          ? "Confirmed distinct legal subsidiaries with separate corporate registration."
          : "Deferred pending confirmation of foreign parent tax identifier."),
    };

    setSessionDecisions((prev) => [decision, ...prev]);

    // Update status in local queue
    setQueue((prev) =>
      prev.map((item) =>
        item.reviewId === currentPair.reviewId
          ? {
              ...item,
              status:
                action === "ACCEPTED"
                  ? "ACCEPTED"
                  : action === "REJECTED"
                  ? "REJECTED"
                  : "DEFERRED",
            }
          : item
      )
    );

    setInvestigatorNote("");

    // Move to next pending pair if available
    const nextPending = queue.find(
      (p) => p.reviewId !== currentPair.reviewId && p.status === "PENDING"
    );
    if (nextPending) {
      setSelectedReviewId(nextPending.reviewId);
    }
  };

  // Evidence Drawer trigger
  const handleOpenAlgorithmEvidence = () => {
    openDrawer({
      claimLabel: `Probabilistic Match: ${currentPair.reviewId}`,
      claimValue: `Score ${currentPair.probabilisticScore.toFixed(3)} (Fellegi-Sunter-style)`,
      calculationFormula:
        "Score = 0.40 * JaroWinkler + 0.20 * Soundex + 0.20 * TokenOverlap + 0.10 * AddressMatch + 0.10 * TariffMatch",
      contributingRecordsCount: currentPair.downstreamEntitiesAffected,
      contributingRecordsDenominator: 42,
      sourceDataset: "Candidate Pair Blocking & Comparison Matrix",
      sourceJurisdiction: "US & Asia-Pacific Import Records",
      licenseNote: "Algorithmic deduplication audit log (orchid_fs_matcher_v1)",
      transformationPipeline:
        "Candidate Blocking -> Jaro-Winkler Scorer -> Threshold Gate [0.65, 0.85) -> Human Review Queue",
      modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
      modelVersion: "orchid_fs_matcher_v1",
      uncertaintyRationale: currentPair.notes,
      underlyingRecords: [
        {
          id: currentPair.entityAId,
          bol: "CANDIDATE-A",
          date: "2024-09-04",
          consignee: currentPair.rawNameA,
          shipper: currentPair.addressA,
          value: "$342,000 USD",
          confidence: "MEDIUM",
        },
        {
          id: currentPair.entityBId,
          bol: "CANDIDATE-B",
          date: "2024-09-06",
          consignee: currentPair.rawNameB,
          shipper: currentPair.addressB,
          value: "$218,000 USD",
          confidence: "MEDIUM",
        },
      ],
      fieldComparison: [
        {
          fieldName: "raw_party_name",
          label: "Legal Party Name",
          rawValue: currentPair.rawNameA,
          normalizedValue: currentPair.rawNameB,
          derivedValue: `Match Probability: ${(currentPair.probabilisticScore * 100).toFixed(1)}%`,
          missingness: null,
        },
      ],
      isMock: true,
    });
  };

  // Metrics
  const pendingCount = queue.filter((p) => p.status === "PENDING").length;
  const resolvedCount = queue.filter((p) => p.status !== "PENDING").length;

  return (
    <VisionLayout pageTitle="Entity Resolution Workbench">
      <Head>
        <title>Resolution Workbench — Orchid Trade Intelligence</title>
      </Head>

      <div className="space-y-6">
        {/* HEADER & CONTEXT BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <GitMerge className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Entity Resolution Workbench / Q3 2024
              </span>
              <MockLabel size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Human-in-the-Loop Resolution Workbench
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5 max-w-2xl">
              Inspect borderline candidate pairs in the [0.65, 0.85) uncertainty band. Verify multi-signal
              features and safeguard the &lt;5% false-merge tolerance guardrail.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusChip
              type="built_simplified"
              tooltipText="Live app at localhost:3000/review presents human resolution queue for 2 ambiguous pairs; vision models full workbench integration with multi-signal decomposition, false-merge guardrails, and audit log appending."
            />
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-black/40 border border-white/10 hidden sm:inline-block">
              orchid_fs_matcher_v1
            </span>
          </div>
        </div>

        {/* HERO SUMMARY METRICS STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <DenominatorMetric
            label="Pending Review Queue"
            numerator={pendingCount}
            denominator={queue.length}
            unit="pairs remaining"
            timestampType="Review Model"
            timestampValue="orchid_fs_matcher_v1"
            onClickEvidence={handleOpenAlgorithmEvidence}
          />

          <DenominatorMetric
            label="False-Merge Guardrail"
            numerator="1.8%"
            denominator="5.0%"
            unit="projected error"
            timestampType="Quality Gate"
            timestampValue="Tolerance: < 5.0%"
            onClickEvidence={handleOpenAlgorithmEvidence}
          />

          <DenominatorMetric
            label="Auto-Resolved Clusters"
            numerator={34}
            denominator={40}
            unit="clusters"
            timestampType="Threshold"
            timestampValue="Score >= 0.8500"
            onClickEvidence={handleOpenAlgorithmEvidence}
          />

          <DenominatorMetric
            label="Decisions Recorded"
            numerator={sessionDecisions.length}
            denominator={queue.length}
            unit="this session"
            timestampType="Audit Trail"
            timestampValue="Append-Only Chain"
            onClickEvidence={handleOpenAlgorithmEvidence}
          />
        </div>

        {/* MAIN WORKBENCH GRID: QUEUE LIST (4 COLS) + COMPARISON CANVAS (8 COLS) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* QUEUE LIST (4 COLS) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-3 rounded-xl bg-black/40 border border-[#1E2A45] flex items-center justify-between text-xs font-mono">
              <span className="font-semibold text-white">Review Queue ({queue.length})</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setFilterStatus("ALL")}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    filterStatus === "ALL" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400"
                  }`}
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus("PENDING")}
                  className={`px-2 py-0.5 rounded text-[10px] ${
                    filterStatus === "PENDING" ? "bg-amber-500/20 text-amber-300 font-bold" : "text-slate-400"
                  }`}
                >
                  Pending ({pendingCount})
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {queue
                .filter((item) =>
                  filterStatus === "PENDING" ? item.status === "PENDING" : true
                )
                .map((pair) => {
                  const isSelected = pair.reviewId === currentPair.reviewId;
                  return (
                    <div
                      key={pair.reviewId}
                      onClick={() => setSelectedReviewId(pair.reviewId)}
                      className={`p-3 rounded-xl border text-xs font-mono cursor-pointer transition-all ${
                        isSelected
                          ? "bg-amber-500/10 border-amber-500/40 text-white shadow-md ring-1 ring-amber-500/30"
                          : "bg-black/30 border-white/5 hover:border-white/15 text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 text-[10px]">
                        <span className={isSelected ? "text-amber-400 font-bold" : "text-slate-400"}>
                          {pair.reviewId}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`px-1.5 py-0.5 rounded font-bold ${
                              pair.status === "ACCEPTED"
                                ? "bg-teal-500/20 text-teal-300"
                                : pair.status === "REJECTED"
                                ? "bg-rose-500/20 text-rose-300"
                                : pair.status === "DEFERRED"
                                ? "bg-slate-500/20 text-slate-300"
                                : "bg-amber-500/20 text-amber-300"
                            }`}
                          >
                            {pair.status}
                          </span>
                          <span className="text-white font-bold">
                            {pair.probabilisticScore.toFixed(3)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5 font-sans text-xs">
                        <div className="font-medium text-slate-200 truncate">
                          A: {pair.rawNameA}
                        </div>
                        <div className="text-slate-400 truncate">
                          B: {pair.rawNameB}
                        </div>
                      </div>

                      <div className="mt-2 pt-1.5 border-t border-white/[0.05] flex items-center justify-between text-[10px] text-slate-500">
                        <span>JW: {pair.signals.jaroWinkler.toFixed(3)}</span>
                        <span>{pair.downstreamEntitiesAffected} affected</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* ACTIVE CANDIDATE COMPARISON CANVAS (8 COLS) */}
          <div className="lg:col-span-8 space-y-4">
            <GlassPanel hairlineAccent="amber" padding="md">
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">
                      {currentPair.reviewId}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      • {currentPair.scoreBand}
                    </span>
                    <MockLabel size="xs" />
                  </div>
                  <h3 className="text-base font-bold font-serif text-white mt-0.5">
                    Probabilistic Match Evaluation
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenAlgorithmEvidence}
                    className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 hover:underline"
                  >
                    <span>Algorithm Rationale</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Side-by-Side Candidate Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                {/* Candidate A */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 font-bold">
                      CANDIDATE A (EXISTING CLUSTER)
                    </span>
                    <span className="text-slate-400">{currentPair.countryA}</span>
                  </div>
                  <div className="font-serif font-bold text-sm text-white">
                    {currentPair.rawNameA}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500 block text-[10px] uppercase">
                      Registered Statutory Address
                    </span>
                    {currentPair.addressA}
                  </div>
                </div>

                {/* Candidate B */}
                <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-bold">
                      CANDIDATE B (INCOMING RECORD)
                    </span>
                    <span className="text-slate-400">{currentPair.countryB}</span>
                  </div>
                  <div className="font-serif font-bold text-sm text-white">
                    {currentPair.rawNameB}
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    <span className="text-slate-500 block text-[10px] uppercase">
                      Filer Manifest Address
                    </span>
                    {currentPair.addressB}
                  </div>
                </div>
              </div>

              {/* Multi-Signal Feature Decomposition */}
              <div className="p-4 rounded-xl bg-[#070b14]/80 border border-white/5 space-y-3 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-semibold text-white uppercase text-[11px] tracking-wider">
                    Feature Vector Decomposition (Fellegi-Sunter)
                  </span>
                  <span className="text-amber-400 font-bold">
                    Composite: {(currentPair.probabilisticScore * 100).toFixed(1)}%
                  </span>
                </div>

                {/* Composite Progress Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-teal-400 rounded-full transition-all duration-300"
                    style={{ width: `${currentPair.probabilisticScore * 100}%` }}
                  />
                </div>

                {/* Individual Signal Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs font-mono">
                  <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Jaro-Winkler Distance:</span>
                    <strong className="text-white">
                      {currentPair.signals.jaroWinkler.toFixed(3)}
                    </strong>
                  </div>

                  <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Phonetic Soundex:</span>
                    <span
                      className={`font-bold ${
                        currentPair.signals.phoneticSoundexMatch
                          ? "text-teal-400"
                          : "text-rose-400"
                      }`}
                    >
                      {currentPair.signals.phoneticSoundexMatch ? "EXACT MATCH" : "DIFFERENT"}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Statutory Address:</span>
                    <span
                      className={`font-bold ${
                        currentPair.signals.addressMatch ? "text-teal-400" : "text-amber-400"
                      }`}
                    >
                      {currentPair.signals.addressMatch ? "MATCHED (SUITE 400)" : "NON-MATCHING"}
                    </span>
                  </div>

                  <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex items-center justify-between">
                    <span className="text-slate-400">Tariff Overlap:</span>
                    <span
                      className={`font-bold ${
                        currentPair.signals.hsTariffOverlap ? "text-teal-400" : "text-slate-500"
                      }`}
                    >
                      {currentPair.signals.hsTariffOverlap ? "OVERLAPPING HS" : "DISTINCT"}
                    </span>
                  </div>
                </div>

                {/* Shared Token Pills */}
                <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-[10px] text-slate-500 uppercase mr-1">
                    Matching Tokens:
                  </span>
                  {currentPair.signals.tokenOverlap.map((tok) => (
                    <span
                      key={tok}
                      className="px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]"
                    >
                      {tok}
                    </span>
                  ))}
                </div>
              </div>

              {/* False-Merge Guardrail Gauge */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-400" />
                    <span className="text-xs font-mono font-bold text-white uppercase">
                      False-Merge Rate Guardrail
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-sans">
                    Merges affecting downstream records are evaluated against our statutory &lt;5% error ceiling.
                  </p>
                </div>
                <div className="text-right font-mono text-xs shrink-0">
                  <span className="text-teal-400 font-bold block text-sm">
                    {currentPair.downstreamEntitiesAffected} Downstream Records
                  </span>
                  <span className="text-slate-500 text-[10px]">
                    Projected cluster stability: PASS
                  </span>
                </div>
              </div>

              {/* Rationale & Notes */}
              <div className="p-3 rounded-xl bg-black/40 border border-white/5 text-xs font-mono space-y-1 mb-4">
                <span className="text-[10px] uppercase text-slate-500 block">
                  Algorithmic Assessment Notes:
                </span>
                <p className="text-slate-300 leading-relaxed">{currentPair.notes}</p>
              </div>

              {/* Investigator Action Panel */}
              <div className="p-4 rounded-xl bg-[#0F1629] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase font-bold text-amber-300">
                    Investigator Verification Decision
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Audit Action Recorded Immaturely in Log
                  </span>
                </div>

                <input
                  type="text"
                  value={investigatorNote}
                  onChange={(e) => setInvestigatorNote(e.target.value)}
                  placeholder="Optional decision note (e.g., 'Verified Delaware Secretary of State filing')..."
                  className="w-full px-3 py-2 rounded-lg bg-black/50 border border-white/10 text-xs text-white placeholder-slate-500 font-mono focus:border-amber-400 focus:outline-none"
                />

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => handleDecision("ACCEPTED")}
                    className="flex-1 px-4 py-2 rounded-xl bg-teal-500/20 border border-teal-500/40 text-teal-300 hover:bg-teal-500/30 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    <span>Accept Merge (Same Entity)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision("REJECTED")}
                    className="flex-1 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                  >
                    <XCircle className="w-4 h-4 text-rose-400" />
                    <span>Reject Disjoint (Distinct)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDecision("DEFERRED")}
                    className="px-4 py-2 rounded-xl bg-white/[0.05] border border-white/10 text-slate-300 hover:bg-white/[0.1] font-mono text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Defer Review</span>
                  </button>
                </div>
              </div>
            </GlassPanel>

            {/* SESSION AUDIT LOG FEED */}
            {sessionDecisions.length > 0 && (
              <GlassPanel padding="md">
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white font-serif">
                      Decisions Appended This Session ({sessionDecisions.length})
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30">
                    Append-Only Provenance
                  </span>
                </div>

                <div className="space-y-2">
                  {sessionDecisions.map((dec, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-black/40 border border-white/5 space-y-1 font-mono text-xs"
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-amber-400 font-bold">{dec.reviewId}</span>
                        <span
                          className={`font-bold ${
                            dec.action === "ACCEPTED"
                              ? "text-teal-400"
                              : dec.action === "REJECTED"
                              ? "text-rose-400"
                              : "text-slate-400"
                          }`}
                        >
                          {dec.action}
                        </span>
                        <span className="text-slate-500">{dec.timestamp}</span>
                      </div>
                      <p className="text-slate-300 text-xs font-sans">{dec.notes}</p>
                      <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                        <Lock className="w-3 h-3 text-slate-600" />
                        <span>SHA-256: {dec.hash.slice(0, 24)}…</span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassPanel>
            )}
          </div>
        </div>
      </div>
    </VisionLayout>
  );
}
