import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  GitMerge,
  Check,
  X,
  Clock,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Scale,
  CheckCircle2,
  AlertTriangle,
  History
} from "lucide-react";

interface ReviewPair {
  id: string;
  nameA: string;
  nameB: string;
  addressA: string;
  addressB: string;
  countryA: string;
  countryB: string;
  score: number;
  signals: {
    jaro_winkler: number;
    country_exact: boolean;
    port_overlap: boolean;
  };
}

const CANDIDATE_PAIRS: ReviewPair[] = [
  {
    id: "REV-001",
    nameA: "SAMSUNG ELECTRONICS VIETNAM CO LTD",
    nameB: "SAMSUNG ELECTRONICS (VTN) CO., LTD",
    addressA: "YEN PHONG I IND ZONE, BAC NINH",
    addressB: "YEN PHONG INDUSTRIAL PARK, BAC NINH",
    countryA: "VN",
    countryB: "VN",
    score: 0.82,
    signals: {
      jaro_winkler: 0.91,
      country_exact: true,
      port_overlap: true
    }
  },
  {
    id: "REV-002",
    nameA: "WAL-MART STORES EAST, LP",
    nameB: "WALMART LOGISTICS SERVICES LLC",
    addressA: "702 SW 8TH ST, BENTONVILLE, AR",
    addressB: "508 SW 8TH ST, BENTONVILLE, AR",
    countryA: "US",
    countryB: "US",
    score: 0.76,
    signals: {
      jaro_winkler: 0.84,
      country_exact: true,
      port_overlap: true
    }
  },
  {
    id: "REV-003",
    nameA: "TECHTRONIC INDUSTRIES (DONGGUAN)",
    nameB: "TECHTRONIC POWER EQUIPMENT HK",
    addressA: "HOUJIE TOWN, DONGGUAN, GUANGDONG",
    addressB: "KWAI CHUNG, NEW TERRITORIES, HK",
    countryA: "CN",
    countryB: "HK",
    score: 0.71,
    signals: {
      jaro_winkler: 0.79,
      country_exact: false,
      port_overlap: true
    }
  }
];

export default function ReviewQueue() {
  const [pairs, setPairs] = useState<ReviewPair[]>(CANDIDATE_PAIRS);
  const [decisions, setDecisions] = useState<{ id: string; action: string; timestamp: string }[]>([]);

  const handleDecision = (id: string, action: "MATCH" | "NO_MATCH" | "DEFER") => {
    setDecisions((prev) => [
      { id, action, timestamp: new Date().toLocaleTimeString() },
      ...prev
    ]);
    setPairs((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      <Head>
        <title>Entity Resolution Review Queue — Orchid Trade Intelligence</title>
      </Head>

      <Navbar />

      <section className="relative pt-36 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
          style={{ backgroundImage: "url('/images/cargo-ship-cinematic.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 w-fit mx-auto mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-xs font-mono font-semibold text-amber-300 tracking-wider uppercase">
              Sample / Illustrative Data — Not Yet Live
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-4">
            <UserCheck className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-semibold text-white/90">
              Splink Probabilistic Matcher • Human-in-the-Loop Review Queue (Brief §6)
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-3"
          >
            Entity Resolution <em className="italic font-normal">Audit Queue</em>
          </motion.h1>

          <p className="max-w-3xl text-sm text-white/75 leading-relaxed mb-8">
            Review ambiguous company matches in the uncertainty band (0.70 – 0.85). False-merge rate is the more dangerous failure mode.
            Every decision writes an immutable audit record to PostgreSQL <code className="text-purple-300 font-mono">entity_resolution_audit</code>.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono">
            <div className="bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
              <span className="text-white/50 block text-[10px] uppercase font-sans">Pending In Queue</span>
              <span className="text-lg font-bold text-amber-400 font-mono">{pairs.length} Pairs</span>
            </div>
            <div className="bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
              <span className="text-white/50 block text-[10px] uppercase font-sans">False-Merge Rate Guardrail</span>
              <span className="text-lg font-bold text-emerald-400 font-mono">&lt; 5.0% Required</span>
            </div>
            <div className="bg-slate-900/80 border border-white/10 px-4 py-2.5 rounded-xl backdrop-blur-md">
              <span className="text-white/50 block text-[10px] uppercase font-sans">Audit Logging</span>
              <span className="text-lg font-bold text-blue-400 font-mono">IMMUTABLE</span>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <span>Pending Comparison Candidates ({pairs.length})</span>
            </h2>

            {pairs.length === 0 ? (
              <div className="p-12 text-center border border-slate-800 rounded-2xl bg-slate-900/50 backdrop-blur-md">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Queue Clear</h3>
                <p className="text-xs text-white/50">All pending candidate entity pairs have been resolved.</p>
              </div>
            ) : (
              pairs.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/80 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 backdrop-blur-md shadow-xl transition-all"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <span className="text-xs font-mono font-bold text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 rounded">
                      {p.id}
                    </span>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="text-white/50">Splink Match Score:</span>
                      <span className="font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                        {p.score}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">Record Variation A</div>
                      <div className="text-sm font-bold text-white mb-2">{p.nameA}</div>
                      <div className="text-xs text-white/60 space-y-1 font-mono">
                        <div>Address: {p.addressA}</div>
                        <div>Country: {p.countryA}</div>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider mb-1">Record Variation B</div>
                      <div className="text-sm font-bold text-white mb-2">{p.nameB}</div>
                      <div className="text-xs text-white/60 space-y-1 font-mono">
                        <div>Address: {p.addressB}</div>
                        <div>Country: {p.countryB}</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs font-mono text-white/70 mb-6 flex flex-wrap gap-4">
                    <div>
                      <span className="text-white/40">Jaro-Winkler: </span>
                      <span className="font-bold text-white">{p.signals.jaro_winkler}</span>
                    </div>
                    <div>
                      <span className="text-white/40">Country Exact: </span>
                      <span className={p.signals.country_exact ? "text-emerald-400" : "text-red-400"}>
                        {p.signals.country_exact ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <div>
                      <span className="text-white/40">Port Overlap: </span>
                      <span className={p.signals.port_overlap ? "text-emerald-400" : "text-red-400"}>
                        {p.signals.port_overlap ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                    <button
                      onClick={() => handleDecision(p.id, "DEFER")}
                      className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-semibold transition-colors"
                    >
                      Defer
                    </button>
                    <button
                      onClick={() => handleDecision(p.id, "NO_MATCH")}
                      className="px-4 py-2 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject (False Merge)</span>
                    </button>
                    <button
                      onClick={() => handleDecision(p.id, "MATCH")}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Accept Match</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-purple-400" />
              <span>Immutable Audit Stream</span>
            </h2>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl text-xs space-y-3">
              <div className="text-[11px] text-white/50 pb-2 border-b border-slate-800">
                Logged decisions written to PostgreSQL <code className="text-purple-300">entity_resolution_audit</code> table.
              </div>

              {decisions.length === 0 ? (
                <div className="text-white/40 italic py-6 text-center font-mono">
                  No decisions submitted in current session.
                </div>
              ) : (
                decisions.map((d, i) => (
                  <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">{d.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        d.action === "MATCH"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : d.action === "NO_MATCH"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-amber-500/20 text-amber-400"
                      }`}>
                        {d.action}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/40">Reviewer: Analyst #01 • {d.timestamp}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
