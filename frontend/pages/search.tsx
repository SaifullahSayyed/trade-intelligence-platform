import React, { useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import { 
  Search as SearchIcon, 
  Filter, 
  ArrowRight, 
  ShieldCheck, 
  Clock, 
  Anchor, 
  Box, 
  MapPin, 
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  ExternalLink
} from "lucide-react";

const INK = "#ffffff";

interface ShipmentItem {
  id: string;
  bol: string;
  consignee: string;
  shipper: string;
  hs_code: string;
  product: string;
  origin: string;
  port: string;
  date: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  weight: string;
  coverage: string;
}

const SAMPLE_DATA: ShipmentItem[] = [
  {
    id: "e4b2d35c-8a19-4b6e-9df2-9b2f34c21a99",
    bol: "MEDU1928472910",
    consignee: "WALMART INC.",
    shipper: "SAMSUNG ELECTRONICS VIETNAM CO LTD",
    hs_code: "852852",
    product: "Flat panel computer monitors and display processing units",
    origin: "Vietnam (VNSGN)",
    port: "Port of Los Angeles (USLAX)",
    date: "2022-09-04",
    confidence: "HIGH",
    weight: "24,850 KG",
    coverage: "870 of 1,000 matched"
  },
  {
    id: "f8a1c42b-5e33-4a11-8c90-1a7b82d49c01",
    bol: "MAEU9482710384",
    consignee: "TARGET BRANDS, INC.",
    shipper: "YUE YUEN INDUSTRIAL HOLDINGS",
    hs_code: "640299",
    product: "Footwear with outer soles of rubber or plastics",
    origin: "Vietnam (VNHPH)",
    port: "Port of Long Beach (USLGB)",
    date: "2022-09-06",
    confidence: "HIGH",
    weight: "18,400 KG",
    coverage: "640 of 750 matched"
  },
  {
    id: "c29e7104-3b8a-4d22-91ef-4938d2a1b942",
    bol: "COSU8294719283",
    consignee: "HOME DEPOT U.S.A., INC.",
    shipper: "TECHTRONIC INDUSTRIES CO LTD",
    hs_code: "846729",
    product: "Cordless lithium-ion electric power tools and drills",
    origin: "China (CNSHA)",
    port: "Port of Savannah (USSAV)",
    date: "2022-09-08",
    confidence: "HIGH",
    weight: "32,100 KG",
    coverage: "920 of 1,000 matched"
  },
  {
    id: "b1049281-7c99-4e55-8201-9283a47d021c",
    bol: "CMDU4829104829",
    consignee: "BEST BUY PURCHASING LLC",
    shipper: "LG ELECTRONICS TAIZHOU CO LTD",
    hs_code: "841810",
    product: "Combined refrigerator-freezers with exterior doors",
    origin: "China (CNYTN)",
    port: "Port of Tacoma (USTAC)",
    date: "2022-09-03",
    confidence: "MEDIUM",
    weight: "14,200 KG",
    coverage: "410 of 500 matched"
  },
  {
    id: "a9284710-2e44-4f11-9a00-3847c291e048",
    bol: "ONEU3829104829",
    consignee: "NIKE RETAIL SERVICES, INC.",
    shipper: "POU CHEN GROUP VIETNAM",
    hs_code: "640411",
    product: "Athletic footwear with textile uppers and rubber soles",
    origin: "Vietnam (VNSGN)",
    port: "Port of Oakland (USOAK)",
    date: "2022-09-05",
    confidence: "HIGH",
    weight: "21,600 KG",
    coverage: "780 of 850 matched"
  }
];

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [confidenceFilter, setConfidenceFilter] = useState<string>("ALL");
  const [portFilter, setPortFilter] = useState<string>("ALL");

  const filteredShipments = SAMPLE_DATA.filter((s) => {
    const matchesSearch = 
      s.consignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.shipper.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.hs_code.includes(searchTerm) ||
      s.bol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.product.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesConfidence = confidenceFilter === "ALL" || s.confidence === confidenceFilter;
    const matchesPort = portFilter === "ALL" || s.port.includes(portFilter);

    return matchesSearch && matchesConfidence && matchesPort;
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-blue-500 selection:text-white">
      <Head>
        <title>Manifest Search — Orchid Trade Intelligence</title>
      </Head>

      <Navbar />

      {/* Hero Header with Background Image & Gradient */}
      <section className="relative pt-36 pb-20 overflow-hidden">
        {/* Background Image with Dark Vignette */}
        <div 
          className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
          style={{ backgroundImage: `url('/images/harbor-dusk.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/70 to-black z-0" />
        <div className="absolute top-0 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none z-0" />

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-xs font-semibold text-white/90">
              U.S. CBP Ocean Manifest Intelligence • Evaluation Sample (Sept 1–10, 2022)
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            className="text-4xl md:text-6xl font-medium tracking-tight text-white mb-4"
          >
            Search <em className="italic font-normal">Global Manifests</em><br />
            With Verifiable Evidence
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl text-sm md:text-base text-white/75 leading-relaxed mb-8"
          >
            Query verified U.S. import shipments by importer company, foreign shipper, HS tariff classification, or port of arrival with preserved raw-to-normalized provenance.
          </motion.p>

          {/* Search Bar Bar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-4xl flex flex-col md:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 px-4 py-2 w-full">
              <SearchIcon className="w-5 h-5 text-blue-400 flex-shrink-0" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by company name, HS code (e.g. 852852), Bill of Lading, or goods description..."
                className="w-full bg-transparent text-white placeholder-white/50 text-sm focus:outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="text-xs text-white/50 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Port Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto px-2 border-t md:border-t-0 md:border-l border-white/10 pt-2 md:pt-0">
              <select
                value={portFilter}
                onChange={(e) => setPortFilter(e.target.value)}
                className="bg-slate-900/80 text-white text-xs border border-white/20 rounded-xl px-3 py-2.5 focus:outline-none w-full md:w-44"
              >
                <option value="ALL">All US Ports</option>
                <option value="USLAX">Port of Los Angeles (USLAX)</option>
                <option value="USLGB">Port of Long Beach (USLGB)</option>
                <option value="USSAV">Port of Savannah (USSAV)</option>
                <option value="USTAC">Port of Tacoma (USTAC)</option>
                <option value="USOAK">Port of Oakland (USOAK)</option>
              </select>

              <select
                value={confidenceFilter}
                onChange={(e) => setConfidenceFilter(e.target.value)}
                className="bg-slate-900/80 text-white text-xs border border-white/20 rounded-xl px-3 py-2.5 focus:outline-none w-full md:w-36"
              >
                <option value="ALL">All Confidence</option>
                <option value="HIGH">High Confidence</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Results Section */}
      <section className="max-w-7xl mx-auto px-6 pb-32">
        <div className="flex items-center justify-between mb-6">
          <div className="text-xs text-white/60">
            Showing <span className="font-semibold text-white">{filteredShipments.length}</span> verified shipment records
          </div>
          <div className="text-[11px] font-mono text-amber-300/80 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-md">
            Fixed historical evaluation window: Sept 1–10, 2022
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-4">
          {filteredShipments.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="group bg-slate-900/70 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-lg hover:shadow-blue-500/10"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="space-y-2 flex-1">
                  {/* Top line with BOL & Badges */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-400 bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 rounded-md">
                      BOL: {s.bol}
                    </span>
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      s.confidence === "HIGH"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    }`}>
                      Confidence: {s.confidence}
                    </span>
                    <span className="text-xs text-white/50 font-mono">
                      Date: {s.date}
                    </span>
                    <span className="text-xs text-white/50">•</span>
                    <span className="text-xs text-white/50 font-mono">
                      Weight: {s.weight}
                    </span>
                  </div>

                  {/* Consignee & Shipper */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 pt-1">
                    <div>
                      <span className="text-[10px] text-white/50 uppercase block">Consignee (Importer)</span>
                      <Link 
                        href={`/company/${s.consignee.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                        className="text-base font-bold text-white group-hover:text-blue-300 transition-colors flex items-center gap-1.5"
                      >
                        {s.consignee}
                        <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                      </Link>
                    </div>
                    <div className="hidden sm:block text-white/30 text-sm">→</div>
                    <div>
                      <span className="text-[10px] text-white/50 uppercase block">Shipper (Exporter)</span>
                      <span className="text-sm font-medium text-slate-300">
                        {s.shipper}
                      </span>
                    </div>
                  </div>

                  {/* Product & HS code */}
                  <div className="text-xs text-white/70 flex items-start gap-2 pt-1">
                    <Box className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-white font-mono">HS {s.hs_code}:</strong> {s.product}
                    </span>
                  </div>

                  {/* Ports */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/60 pt-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-amber-400" />
                      <span>Origin: {s.origin}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Unlading: {s.port}</span>
                    </div>
                  </div>
                </div>

                {/* Right Action & Trust Badge */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                  <div className="text-right">
                    <div className="text-[10px] text-white/50 uppercase">Entity Coverage</div>
                    <div className="text-xs font-mono font-semibold text-emerald-400">{s.coverage}</div>
                  </div>

                  <Link
                    href={`/company/${s.consignee.toLowerCase().replace(/[^a-z0-9]/g, "-")}`}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-semibold text-white transition-all group-hover:bg-blue-600 group-hover:border-blue-500"
                  >
                    <span>View Evidence</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
