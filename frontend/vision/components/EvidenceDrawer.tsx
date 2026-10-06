import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import {
  X,
  ShieldCheck,
  Clock,
  Layers,
  FileText,
  AlertTriangle,
  Fingerprint,
  ExternalLink,
  CheckCircle2,
  Database,
} from "lucide-react";
import { useVisionStore } from "../store/visionStore";
import { MockLabel } from "../ui/MockLabel";
import { ConfidenceBadge } from "../ui/ConfidenceBadge";

export const EvidenceDrawer: React.FC = () => {
  const { drawerOpen, drawerPayload, closeDrawer } = useVisionStore();

  if (!drawerPayload) return null;

  return (
    <Dialog.Root open={drawerOpen} onOpenChange={(open) => !open && closeDrawer()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-fade-in" />

        {/* Slide-over panel */}
        <Dialog.Content
          aria-describedby="evidence-drawer-desc"
          className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-[#0B1020] border-l border-[#1E2A45] shadow-2xl flex flex-col focus:outline-none animate-slide-right overflow-hidden"
        >
          {/* Header */}
          <div className="p-5 border-b border-[#1E2A45] bg-[#0F1629]/80 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <span className="text-[11px] font-mono text-teal-300 font-semibold tracking-wider uppercase">
                  Evidence & Provenance Drawer
                </span>
                <MockLabel size="xs" />
              </div>
              <Dialog.Title className="text-lg font-bold text-white font-sans">
                {drawerPayload.claimLabel}
              </Dialog.Title>
              <p id="evidence-drawer-desc" className="text-xs text-slate-400 font-mono mt-0.5">
                Full chronological lineage, calculation formula, and source verification proofs.
              </p>
            </div>

            <Dialog.Close asChild>
              <button
                type="button"
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400"
                aria-label="Close Evidence Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs text-slate-300">
            {/* Section 1: The Claim & Calculation */}
            <div className="p-4 rounded-xl bg-black/40 border border-[#1E2A45] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold">
                  1. Value Claim & Aggregation
                </span>
                <span className="text-base font-bold font-mono text-amber-300">
                  {typeof drawerPayload.claimValue === "number"
                    ? drawerPayload.claimValue.toLocaleString("en-US")
                    : drawerPayload.claimValue}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-[#070b14] border border-white/[0.06] font-mono text-[11px] text-slate-300">
                <span className="text-slate-500">Formula: </span>
                <span className="text-sky-300">{drawerPayload.calculationFormula}</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Contributing sample records:</span>
                <span className="font-semibold text-white">
                  {drawerPayload.contributingRecordsCount} of {drawerPayload.contributingRecordsDenominator} verified
                </span>
              </div>
            </div>

            {/* Section 2: Uncertainty Rationale (What could make this wrong?) */}
            <div className="p-4 rounded-xl bg-amber-500/[0.08] border border-amber-500/30 space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-mono font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>What Could Make This Wrong? (Trust Boundary)</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed font-sans">
                {drawerPayload.uncertaintyRationale}
              </p>
              <div className="pt-2 border-t border-amber-500/20 text-[10px] font-mono text-amber-300/80">
                Manifest figures reflect commercial carrier filings, not audited corporate balance sheets.
              </div>
            </div>

            {/* Section 3: 3-Stage Chronological Lineage */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-sky-400" />
                <span>3-Stage Chronological Lineage (Rule 2)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 rounded-xl bg-black/40 border border-[#1E2A45]">
                  <div className="text-[10px] font-mono text-sky-400 uppercase">Stage 1: Source</div>
                  <div className="font-mono text-xs font-semibold text-white mt-1">2024-09-04 14:32Z</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Customs ACE Filing</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-[#1E2A45]">
                  <div className="text-[10px] font-mono text-amber-400 uppercase">Stage 2: Ingested</div>
                  <div className="font-mono text-xs font-semibold text-white mt-1">2024-10-01 04:12Z</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">ClickHouse Bronze Tier</div>
                </div>
                <div className="p-3 rounded-xl bg-black/40 border border-[#1E2A45]">
                  <div className="text-[10px] font-mono text-teal-400 uppercase">Stage 3: Normalized</div>
                  <div className="font-mono text-xs font-semibold text-white mt-1">2024-10-01 04:13Z</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Silver Schema Canonical</div>
                </div>
              </div>
            </div>

            {/* Section 4: Raw vs Normalized vs Derived Field Comparison (Rule 4) */}
            <div className="space-y-3">
              <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                <span>Field-Level Provenance & Transformation</span>
                <span className="text-[10px] text-slate-500 font-normal">Source never overwritten</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-[#1E2A45] bg-black/40">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[10px] uppercase text-slate-400">
                      <th className="p-3">Attribute</th>
                      <th className="p-3">Raw Manifest</th>
                      <th className="p-3">Canonical</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {drawerPayload.fieldComparison.map((f) => (
                      <tr key={f.fieldName} className="hover:bg-white/[0.02]">
                        <td className="p-3 font-sans font-medium text-slate-200">
                          {f.label}
                          <span className="block text-[10px] font-mono text-slate-500">{f.fieldName}</span>
                        </td>
                        <td className="p-3 text-slate-400">
                          {f.rawValue ? (
                            <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.08]">
                              {f.rawValue}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">null</span>
                          )}
                        </td>
                        <td className="p-3 text-sky-300 font-semibold">
                          {f.normalizedValue ? (
                            <span className="px-2 py-0.5 rounded bg-sky-500/10 border border-sky-500/25">
                              {f.normalizedValue}
                            </span>
                          ) : (
                            <span className="text-slate-600 italic">null</span>
                          )}
                        </td>
                        <td className="p-3">
                          {f.missingness ? (
                            <span
                              className="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/25"
                              title={f.missingness.description}
                            >
                              {f.missingness.reason}
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] text-teal-400">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Section 5: Underlying Contributing Records */}
            {drawerPayload.underlyingRecords.length > 0 && (
              <div className="space-y-3">
                <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center justify-between">
                  <span>Contributing Sample Records</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    Showing top {drawerPayload.underlyingRecords.length}
                  </span>
                </div>

                <div className="space-y-2">
                  {drawerPayload.underlyingRecords.map((r) => (
                    <div
                      key={r.id}
                      className="p-3 rounded-xl bg-black/30 border border-white/[0.06] flex items-center justify-between gap-4 font-mono text-[11px]"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-white">{r.bol}</span>
                          <MockLabel size="xs" />
                        </div>
                        <div className="text-slate-400 text-[10px] mt-0.5">
                          {r.consignee} ← {r.shipper}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-slate-300 font-semibold">{r.value}</div>
                        <ConfidenceBadge tier={r.confidence} showScore={false} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Section 6: Source Dataset & Rights Note */}
            <div className="p-4 rounded-xl bg-black/40 border border-[#1E2A45] space-y-2 text-[11px] font-mono">
              <div className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Source & Data Rights Provenance
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Dataset:</span>
                <span className="text-slate-200">{drawerPayload.sourceDataset}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Jurisdiction:</span>
                <span className="text-slate-200">{drawerPayload.sourceJurisdiction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">License:</span>
                <span className="text-slate-200">{drawerPayload.licenseNote}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Resolution Engine:</span>
                <span className="text-teal-300">{drawerPayload.modelEngine}</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default EvidenceDrawer;
