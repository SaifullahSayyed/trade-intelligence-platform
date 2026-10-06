/**
 * Screen 7: AI Analyst Workspace  /vision/ai
 *
 * Natural-language query interface with grounded citations, refusal guardrails,
 * "What I Could Not Verify" disclosures, and EvidenceDrawer integration.
 *
 * Design: dark ink palette | amber accent | MOCK badges | N-of-M denominators
 * Disclaimer: Orchid AI does NOT determine compliance, sanctions status, or fraud.
 */

import React, { useState, useRef, useEffect } from "react";
import { VisionLayout } from "../../vision/layout/VisionLayout";
import { GlassPanel } from "../../vision/ui/GlassPanel";
import { MockLabel } from "../../vision/ui/MockLabel";
import { useVisionStore } from "../../vision/store/visionStore";
import {
  MOCK_AI_EXCHANGES,
  BANNED_AI_WORDS,
} from "../../vision/mock/aiChat";
import { MOCK_COMPANIES } from "../../vision/mock/companies";
import { MOCK_SHIPMENTS } from "../../vision/mock/shipments";
import type {
  MockAiExchange,
  MockAiCitation,
  ProvenanceDrawerPayload,
  MockFieldValue,
} from "../../vision/mock/types";
import {
  Bot,
  Send,
  AlertTriangle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Building2,
  Layers,
  Search,
  HelpCircle,
  X,
  Sparkles,
  ShieldOff,
  Zap,
  BookOpen,
} from "lucide-react";

// ── Suggested prompts ──────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "Summarize Northwind Retail Group's import suppliers and routes in Q3 2024.",
  "What signals drove the entity match between Northwind Retail Group LLC and Northwind Direct US?",
  "Show Helix Components' TEU volume breakdown by corridor for the last 6 months.",
  "Which top 5 consignees had the highest declared value shipments via Trans-Pacific South?",
  "List all HS 852852 shipments filed through Los Angeles in Q3 2024.",
];

// ── Citation icon helper ─────────────────────────────────────────────────
function CitationIcon({ type }: { type: MockAiCitation["type"] }) {
  const map: Record<MockAiCitation["type"], React.ReactNode> = {
    RECORD: <FileText className="w-3 h-3" />,
    BOL: <Layers className="w-3 h-3" />,
    ENTITY: <Building2 className="w-3 h-3" />,
    FIELD: <Search className="w-3 h-3" />,
  };
  return <>{map[type]}</>;
}

// ── Compliance refusal banner ─────────────────────────────────────────────
function RefusalBanner({ exchange }: { exchange: MockAiExchange }) {
  return (
    <div className="mt-3 border border-red-500/30 bg-red-500/5 rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2 text-red-400 text-xs font-mono font-bold">
        <ShieldOff className="w-4 h-4" />
        {exchange.refusalReason}
      </div>
      {exchange.suggestedAllowedPrompt && (
        <div className="flex items-start gap-2 text-xs text-slate-300">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
          <span>
            <span className="text-amber-400 font-mono">Allowed alternative: </span>
            <em>"{exchange.suggestedAllowedPrompt}"</em>
          </span>
        </div>
      )}
    </div>
  );
}

// ── Single exchange card ──────────────────────────────────────────────────
function ExchangeCard({
  exchange,
  onCitationClick,
}: {
  exchange: MockAiExchange;
  onCitationClick: (citation: MockAiCitation) => void;
}) {
  const [showCannotVerify, setShowCannotVerify] = useState(false);

  return (
    <div className="space-y-3">
      {/* User prompt bubble */}
      <div className="flex justify-end">
        <div className="max-w-[75%] bg-amber-500/10 border border-amber-500/20 rounded-2xl rounded-tr-sm px-4 py-3">
          <p className="text-sm text-amber-100">{exchange.userPrompt}</p>
        </div>
      </div>

      {/* AI response bubble */}
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-[#1E2A45] border border-[#2E3A55] flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-teal-400" />
        </div>
        <div className="flex-1 min-w-0">
          <GlassPanel className={`p-4 ${exchange.isRefusalDemo ? "border-red-500/30" : ""}`}>
            {/* Response text */}
            <p className={`text-sm leading-relaxed ${exchange.isRefusalDemo ? "text-slate-400 italic" : "text-slate-200"}`}>
              {exchange.aiResponse}
            </p>

            {/* Refusal banner */}
            {exchange.isRefusalDemo && <RefusalBanner exchange={exchange} />}

            {/* Citations */}
            {exchange.citations.length > 0 && !exchange.isRefusalDemo && (
              <div className="mt-3 pt-3 border-t border-[#1E2A45]">
                <p className="text-[10px] font-mono text-slate-500 mb-2">Evidence Citations</p>
                <div className="flex flex-wrap gap-2">
                  {exchange.citations.map((cit) => (
                    <button
                      key={cit.id}
                      onClick={() => onCitationClick(cit)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#1E2A45] hover:bg-[#2A3A5A] border border-[#2E3A55] hover:border-amber-500/30 text-[10px] font-mono text-slate-300 hover:text-amber-300 transition-all"
                    >
                      <CitationIcon type={cit.type} />
                      {cit.label}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* What I could not verify */}
            <div className="mt-3 pt-2 border-t border-[#1E2A45]">
              <button
                className="flex items-center gap-2 text-[10px] font-mono text-slate-500 hover:text-amber-400 transition-colors"
                onClick={() => setShowCannotVerify(!showCannotVerify)}
              >
                <HelpCircle className="w-3 h-3" />
                What I could not verify
                {showCannotVerify ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              {showCannotVerify && (
                <p className="mt-2 text-[11px] text-slate-400 bg-[#0F1629] rounded p-2.5 leading-relaxed border border-[#1E2A45]">
                  {exchange.whatCouldNotVerify}
                </p>
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}

// ── Guardrail check ───────────────────────────────────────────────────────
function checkGuardrail(text: string): string[] {
  const lower = text.toLowerCase();
  return BANNED_AI_WORDS.filter((word) =>
    new RegExp(`\\b${word}\\b`, "i").test(lower)
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function AiAnalystPage() {
  const openDrawer = useVisionStore((s) => s.openDrawer);
  const [draftPrompt, setDraftPrompt] = useState("");
  const [displayedExchanges, setDisplayedExchanges] = useState<MockAiExchange[]>(
    [MOCK_AI_EXCHANGES[0]]
  );
  const [guardrailWarning, setGuardrailWarning] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [displayedExchanges]);

  function handleSend() {
    if (!draftPrompt.trim()) return;
    const violations = checkGuardrail(draftPrompt);
    if (violations.length) {
      setGuardrailWarning(violations);
      return;
    }
    setGuardrailWarning([]);
    setIsLoading(true);

    // Find matching mock exchange or use refusal demo
    const match = MOCK_AI_EXCHANGES.find(
      (ex) =>
        !displayedExchanges.find((d) => d.id === ex.id) &&
        ex.userPrompt.toLowerCase().includes(draftPrompt.toLowerCase().slice(0, 15))
    );
    const nextExchange =
      match ||
      MOCK_AI_EXCHANGES[displayedExchanges.length % MOCK_AI_EXCHANGES.length];

    setTimeout(() => {
      setDisplayedExchanges((prev) => [
        ...prev,
        { ...nextExchange, id: `ai-${Date.now()}`, userPrompt: draftPrompt },
      ]);
      setDraftPrompt("");
      setIsLoading(false);
    }, 900);
  }

  function handleSuggestedPrompt(prompt: string) {
    setDraftPrompt(prompt);
    setGuardrailWarning([]);
  }

  function handleCitationClick(citation: MockAiCitation) {
    const company = MOCK_COMPANIES.find(
      (c) => c.id === citation.targetId || c.canonicalName.includes(citation.label.split("(")[1]?.replace(")", "") || "")
    );
    const shipment = MOCK_SHIPMENTS.find((s) => s.id === citation.targetId);

    const fields: MockFieldValue[] = shipment
      ? shipment.provenance.fields
      : [
          { fieldName: "citation_type", label: "Citation Type", rawValue: citation.type, normalizedValue: citation.type, derivedValue: null, missingness: null },
          { fieldName: "citation_label", label: "Citation Label", rawValue: citation.label, normalizedValue: citation.label, derivedValue: null, missingness: null },
          { fieldName: "target_id", label: "Target ID", rawValue: citation.targetId, normalizedValue: citation.targetId, derivedValue: null, missingness: null },
        ];

    const payload: ProvenanceDrawerPayload = {
      claimLabel: citation.label,
      claimValue: citation.type,
      calculationFormula: "AI citation grounded in manifest filing records from CBP AMS dataset",
      contributingRecordsCount: shipment ? 1 : company ? company.matchedShipments : 1,
      contributingRecordsDenominator: shipment ? 1 : company ? company.totalShipments : 1,
      sourceDataset: "cbp_am_manifests",
      sourceJurisdiction: "US Customs and Border Protection",
      licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
      transformationPipeline: "Bronze ingest → Silver normalise → Gold entity resolution → AI citation grounding",
      modelEngine: "Orchid Trade Analyst (Illustrative) — Probabilistic Grounding Layer",
      modelVersion: "orchid_ai_v0.1_preview",
      uncertaintyRationale:
        "AI responses are grounded in available manifest filings only. Declared values may be masked. Entity resolution confidence bands apply. This is a product vision illustrative preview — not a live AI system.",
      underlyingRecords: shipment
        ? [
            {
              id: shipment.id,
              bol: shipment.bolNumber,
              date: shipment.filingDate,
              consignee: shipment.consigneeName,
              shipper: shipment.shipperName,
              value: shipment.declaredValueUsd
                ? `$${shipment.declaredValueUsd.toLocaleString("en-US")}`
                : "[MASKED]",
              confidence: shipment.confidenceTier,
            },
          ]
        : [],
      fieldComparison: fields,
      isMock: true,
    };
    openDrawer(payload);
  }

  const totalShipments = MOCK_SHIPMENTS.length;
  const totalEntities = MOCK_COMPANIES.length;

  return (
    <VisionLayout pageTitle="AI Analyst Workspace — Orchid Vision">
      <div className="p-6 max-w-screen-xl mx-auto flex flex-col gap-6 h-full">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-6 h-6 text-teal-400" />
              <h1 className="font-serif text-3xl font-bold text-slate-50">
                AI Analyst Workspace
              </h1>
              <MockLabel />
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Natural-language interface grounded in manifest filing records.
              Every claim is citation-linked. Compliance, sanctions, and fraud determinations are explicitly refused.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-mono text-teal-400 border border-teal-500/30 rounded px-2 py-1 flex items-center gap-1">
              <Zap className="w-3 h-3" /> {totalShipments.toLocaleString("en-US")} of {totalShipments.toLocaleString("en-US")} records indexed
            </span>
            <span className="text-[10px] font-mono text-slate-500 border border-[#1E2A45] rounded px-2 py-1 flex items-center gap-1">
              <Building2 className="w-3 h-3" /> {totalEntities} canonical entities
            </span>
          </div>
        </div>

        {/* ── Statutory disclaimer ── */}
        <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg px-4 py-3 text-xs text-amber-300/80 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>AI Guardrails Active:</strong> This illustrative AI system will refuse compliance,
            sanctions status, or fraud determinations. Orchid does NOT issue compliance certifications,
            legal clearance, or fraud verdicts. All responses are grounded in{" "}
            <strong>[MOCK]</strong> manifest data only. Not a live production AI.
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">

          {/* ── Left sidebar: model info + suggested prompts ── */}
          <div className="lg:col-span-1 space-y-4">
            <GlassPanel className="p-4">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <BookOpen className="w-3.5 h-3.5" /> Model Info
              </h2>
              <div className="space-y-2">
                {[
                  ["Engine", "Orchid Trade Analyst"],
                  ["Version", "v0.1-preview"],
                  ["Grounding", "CBP AMS Manifests"],
                  ["Records", `${totalShipments.toLocaleString("en-US")} of ${totalShipments.toLocaleString("en-US")}`],
                  ["Data Window", "Q3 2024 [MOCK]"],
                  ["Refusal Policy", "ACTIVE"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-500">{k}</span>
                    <span className={`text-[10px] font-mono text-right ${k === "Refusal Policy" ? "text-red-400 font-bold" : "text-slate-300"}`}>
                      {v}
                    </span>
                  </div>
                ))}
              </div>
            </GlassPanel>

            <GlassPanel className="p-4">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Suggested Queries
              </h2>
              <div className="space-y-2">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestedPrompt(prompt)}
                    className="w-full text-left text-[11px] text-slate-400 hover:text-amber-300 border border-[#1E2A45] hover:border-amber-500/30 rounded-lg px-3 py-2 transition-all leading-relaxed hover:bg-amber-500/5"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </GlassPanel>

            {/* Refusal legend */}
            <GlassPanel className="p-4 border-red-500/20">
              <h2 className="text-xs font-mono text-red-400 uppercase tracking-widest flex items-center gap-2 mb-3">
                <ShieldOff className="w-3.5 h-3.5" /> Refused Query Types
              </h2>
              <ul className="space-y-1.5 text-[10px] text-slate-500">
                {[
                  "Compliance / sanctions verdicts",
                  "Fraud determination",
                  "Legal clearance assertions",
                  'Use of words: "compliant", "clean", "safe", "verified"',
                  "Investment suitability claims",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-1.5">
                    <X className="w-2.5 h-2.5 text-red-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </div>

          {/* ── Chat area ── */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Scrollable exchange list */}
            <div className="flex-1 space-y-6 overflow-y-auto max-h-[60vh] pr-1">
              {displayedExchanges.map((exchange) => (
                <ExchangeCard
                  key={exchange.id}
                  exchange={exchange}
                  onCitationClick={handleCitationClick}
                />
              ))}

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1E2A45] border border-[#2E3A55] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-teal-400 animate-pulse" />
                  </div>
                  <GlassPanel className="px-4 py-3 flex items-center gap-2">
                    <span className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-bounce"
                          style={{ animationDelay: `${i * 150}ms` }}
                        />
                      ))}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Grounding response in manifest records…</span>
                  </GlassPanel>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Guardrail warning */}
            {guardrailWarning.length > 0 && (
              <div className="border border-red-500/30 bg-red-500/5 rounded-lg px-4 py-3 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1 text-xs text-red-300">
                  <strong>Guardrail blocked:</strong> Your query contains restricted terms:{" "}
                  <span className="font-mono text-red-400">
                    {guardrailWarning.map((w) => `"${w}"`).join(", ")}
                  </span>
                  . Orchid will not make compliance, sanctions, or fraud determinations.
                </div>
                <button onClick={() => setGuardrailWarning([])} className="text-red-500 hover:text-red-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input bar */}
            <GlassPanel className="p-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                  <textarea
                    value={draftPrompt}
                    onChange={(e) => {
                      setDraftPrompt(e.target.value);
                      if (guardrailWarning.length) setGuardrailWarning([]);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Ask a grounded question about trade data, entity relationships, or shipment patterns… (⏎ to send)"
                    rows={2}
                    className="w-full bg-[#0F1629] border border-[#1E2A45] focus:border-amber-500/50 rounded-lg px-4 py-3 text-sm text-slate-200 placeholder-slate-600 resize-none outline-none font-sans leading-relaxed"
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!draftPrompt.trim() || isLoading}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-[#1E2A45] disabled:cursor-not-allowed transition-all text-black disabled:text-slate-600 flex-shrink-0"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between px-1">
                <p className="text-[9px] font-mono text-slate-600">
                  Grounded in Q3 2024 [MOCK] manifest records · {totalShipments.toLocaleString("en-US")} of {totalShipments.toLocaleString("en-US")} BOLs indexed
                </p>
                <p className="text-[9px] font-mono text-red-500/70">Refusal policy: ACTIVE</p>
              </div>
            </GlassPanel>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          [MOCK] Orchid AI Analyst is an illustrative product vision preview. All AI responses are synthetic and grounded in mock manifest data only.
          Orchid does NOT issue compliance certifications, legal clearance, or fraud verdicts. · orchid_ai_v0.1_preview
        </p>
      </div>
    </VisionLayout>
  );
}
