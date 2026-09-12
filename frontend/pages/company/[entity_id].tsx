import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import {
  Building2,
  ShieldCheck,
  Clock,
  Layers,
  ArrowLeft,
  Box,
  Anchor,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ExternalLink,
  Lock,
  ChevronRight
} from "lucide-react";

export default function CompanyProfile() {
  const router = useRouter();
  const { entity_id } = router.query;

  const [activeTab, setActiveTab] = useState<"shipments" | "evidence" | "ai_explain">("shipments");

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      <Head>
        <title>Company Profile — Orchid Trade Intelligence</title>
      </Head>

      <Navbar />

      <section className="relative pt-36 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 opacity-35"
          style={{ backgroundImage: "url('/images/port-terminal-cinematic.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-black/75 to-black z-0" />
        <div className="absolute top-10 right-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 w-fit mx-auto mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
            <span className="text-xs font-mono font-semibold text-amber-300 tracking-wider uppercase">
              Sample / Illustrative Data — Not Yet Live
            </span>
          </div>

          <Link
            href="/search"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/60 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Manifest Search</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Canonical Entity #E-8921
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Confidence: HIGH
            </span>
            <span className="text-xs font-mono text-white/50">
              U.S. Ocean Import Corridor (19 C.F.R. § 103.31)
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-3"
          >
            Walmart <em className="italic font-normal">Stores East, LP</em>
          </motion.h1>

          <p className="max-w-3xl text-sm text-white/75 leading-relaxed mb-8">
            Canonical company profile clustered via Splink Fellegi-Sunter probabilistic matching across raw customs variations.
            All evidence grounded in verified September 1–10, 2022 CBP vessel manifests.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl">
            <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <div className="text-[10px] text-white/50 uppercase font-semibold">Total Verified Volume</div>
              <div className="text-xl font-bold font-mono text-white mt-1">2,410 Tons</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">87 Shipments</div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <div className="text-[10px] text-white/50 uppercase font-semibold">Primary HS Category</div>
              <div className="text-xl font-bold font-mono text-blue-400 mt-1">HS 8528</div>
              <div className="text-[10px] text-white/60 mt-0.5">Monitors & Displays</div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <div className="text-[10px] text-white/50 uppercase font-semibold">Key Port of Unlading</div>
              <div className="text-xl font-bold font-mono text-amber-400 mt-1">USLAX</div>
              <div className="text-[10px] text-white/60 mt-0.5">Port of Los Angeles</div>
            </div>

            <div className="bg-slate-900/80 border border-white/10 rounded-xl p-4 backdrop-blur-md">
              <div className="text-[10px] text-white/50 uppercase font-semibold">Entity Coverage</div>
              <div className="text-xl font-bold font-mono text-emerald-400 mt-1">870 / 1000</div>
              <div className="text-[10px] text-white/60 mt-0.5">Stated Denominator</div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-28">

        <div className="flex border-b border-slate-800 gap-8 mb-8">
          <button
            onClick={() => setActiveTab("shipments")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "shipments"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Verified Shipment History (87)
          </button>
          <button
            onClick={() => setActiveTab("evidence")}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "evidence"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            Trust Layer & Value Preservation
          </button>
          <button
            onClick={() => setActiveTab("ai_explain")}
            className={`flex items-center gap-1.5 pb-3 text-sm font-semibold transition-all border-b-2 ${
              activeTab === "ai_explain"
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Grounded Explanation
          </button>
        </div>

        {activeTab === "shipments" && (
          <div className="space-y-4">
            <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-md shadow-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-white/60 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-4 font-sans">Bill of Lading</th>
                    <th className="px-5 py-4 font-sans">Foreign Shipper</th>
                    <th className="px-5 py-4 font-sans">HS Code & Description</th>
                    <th className="px-5 py-4 font-sans">Origin / Port</th>
                    <th className="px-5 py-4 font-sans">Shipment Date</th>
                    <th className="px-5 py-4 font-sans">Weight</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 text-blue-400 font-bold">MEDU1928472910</td>
                    <td className="px-5 py-4 font-sans text-white">SAMSUNG ELECTRONICS VIETNAM CO LTD</td>
                    <td className="px-5 py-4 font-sans text-slate-300">
                      <span className="font-mono text-blue-300 font-bold">852852</span> • Flat panel display units
                    </td>
                    <td className="px-5 py-4 font-sans text-slate-400">VNSGN → USLAX</td>
                    <td className="px-5 py-4 text-slate-400">2022-09-04</td>
                    <td className="px-5 py-4 text-white">24,850 KG</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 text-blue-400 font-bold">MSCU4928103847</td>
                    <td className="px-5 py-4 font-sans text-white">LG DISPLAY (VIETNAM) HAIPHONG CO</td>
                    <td className="px-5 py-4 font-sans text-slate-300">
                      <span className="font-mono text-blue-300 font-bold">852859</span> • Video monitors, colour
                    </td>
                    <td className="px-5 py-4 font-sans text-slate-400">VNHPH → USLAX</td>
                    <td className="px-5 py-4 text-slate-400">2022-09-06</td>
                    <td className="px-5 py-4 text-white">31,200 KG</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 text-blue-400 font-bold">COSU9283748291</td>
                    <td className="px-5 py-4 font-sans text-white">FOXCONN INTERCONNECT TECHNOLOGY</td>
                    <td className="px-5 py-4 font-sans text-slate-300">
                      <span className="font-mono text-blue-300 font-bold">854442</span> • Electric conductors fitted with connectors
                    </td>
                    <td className="px-5 py-4 font-sans text-slate-400">CNSHA → USLGB</td>
                    <td className="px-5 py-4 text-slate-400">2022-09-07</td>
                    <td className="px-5 py-4 text-white">19,400 KG</td>
                  </tr>

                  <tr className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 text-blue-400 font-bold">ONEU8492019482</td>
                    <td className="px-5 py-4 font-sans text-white">BOE TECHNOLOGY GROUP CO LTD</td>
                    <td className="px-5 py-4 font-sans text-slate-300">
                      <span className="font-mono text-blue-300 font-bold">852990</span> • Parts for television & monitor receivers
                    </td>
                    <td className="px-5 py-4 font-sans text-slate-400">CNYTN → USLAX</td>
                    <td className="px-5 py-4 text-slate-400">2022-09-08</td>
                    <td className="px-5 py-4 text-white">28,900 KG</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "evidence" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <h3 className="text-base font-bold text-white mb-2">
                Preserved Field Values (Brief §2 Rule 4: Never Overwrite a Source Value)
              </h3>
              <p className="text-xs text-white/60 mb-6">
                Every field stores raw, normalized, and derived values separately to ensure verifiable legal provenance.
              </p>

              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-white/50 uppercase font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Field</th>
                      <th className="px-4 py-3">Raw Value</th>
                      <th className="px-4 py-3">Normalized Value</th>
                      <th className="px-4 py-3">Derived / Enriched</th>
                      <th className="px-4 py-3">Missingness Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 font-mono">
                    <tr>
                      <td className="px-4 py-3.5 font-sans text-white">Consignee Name</td>
                      <td className="px-4 py-3.5 text-slate-400">WAL-MART STORES EAST, LP</td>
                      <td className="px-4 py-3.5 text-blue-300 font-bold">WALMART</td>
                      <td className="px-4 py-3.5 text-slate-200">WALMART INC. (US-RETAIL)</td>
                      <td className="px-4 py-3.5 text-emerald-400 font-sans">Present</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3.5 font-sans text-white">Primary HS Code</td>
                      <td className="px-4 py-3.5 text-slate-400">8528.52.00</td>
                      <td className="px-4 py-3.5 text-blue-300 font-bold">852852</td>
                      <td className="px-4 py-3.5 text-slate-200">Flat panel data display monitors</td>
                      <td className="px-4 py-3.5 text-emerald-400 font-sans">Present</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3.5 font-sans text-white">Declared Value</td>
                      <td className="px-4 py-3.5 text-slate-600">—</td>
                      <td className="px-4 py-3.5 text-slate-600">—</td>
                      <td className="px-4 py-3.5 text-slate-600">—</td>
                      <td className="px-4 py-3.5 font-sans">
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/30 font-semibold text-[11px]">
                          MASKED (19 C.F.R. § 103.31)
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "ai_explain" && (
          <div className="space-y-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Narrow AI Explanation (Brief §2 Rule 6)</h3>
                    <p className="text-xs text-white/50">Strict citation-only explanation grounded in verified shipment manifests.</p>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                  Banned Patterns Filter: ACTIVE
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0 animate-pulse" />
                <span>
                  <strong>Safety Disclaimer:</strong> Synthetic test data used to validate entity-matching logic only — not derived from any real shipment records.
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white/70 mb-6 leading-relaxed">
                <strong className="text-purple-300">Policy Constraint:</strong> The AI model is strictly prohibited from issuing compliance conclusions, sanctions clearance, or fraud claims (e.g. &ldquo;Company is compliant&rdquo; or &ldquo;clean&rdquo;). Output is restricted to verified empirical shipment patterns citing underlying record IDs.
              </div>

              <div className="p-5 rounded-xl bg-slate-950/90 border border-purple-500/30 text-sm leading-relaxed text-white space-y-4">
                <p>
                  Based on <strong>87 verified U.S. customs manifests</strong> recorded between September 1, 2022 and September 10, 2022,
                  <strong> Walmart Stores East, LP</strong> imported an aggregate of <strong>2,410 metric tons</strong> of containerized cargo through
                  the <strong>Port of Los Angeles (USLAX)</strong> and <strong>Port of Long Beach (USLGB)</strong>.
                </p>

                <p>
                  The dominant product category was <strong>HS 8528.52</strong> (flat-panel electronic display monitors), supplied primarily by
                  <strong> Samsung Electronics Vietnam Co Ltd</strong> and <strong>LG Display (Vietnam) Co</strong>.
                  No anomalies in declared container weight distributions were detected across this corridor sample.
                </p>

                <div className="pt-4 border-t border-slate-800">
                  <div className="text-xs font-semibold text-white/60 uppercase tracking-wider mb-2">
                    Verified Evidence Citations:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-300">
                      MEDU1928472910 (Sept 4, 2022)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-300">
                      MSCU4928103847 (Sept 6, 2022)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-300">
                      COSU9283748291 (Sept 7, 2022)
                    </span>
                    <span className="font-mono text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-blue-300">
                      ONEU8492019482 (Sept 8, 2022)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
