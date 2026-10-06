import React, { useState, useEffect, useMemo, useRef } from "react";
import Head from "next/head";
import Link from "next/link";
import {
  Search,
  Command,
  Filter,
  X,
  SlidersHorizontal,
  Building2,
  Package,
  Layers,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  ArrowUpRight,
  RotateCcw,
  Sparkles,
  Anchor,
  Calendar,
  Tag,
} from "lucide-react";
import { VisionLayout } from "@/vision/layout/VisionLayout";
import {
  GlassPanel,
  StatusChip,
  MockLabel,
  ConfidenceBadge,
  DenominatorMetric,
  EmptyState,
} from "@/vision/ui";
import { useVisionStore } from "@/vision/store/visionStore";
import {
  MOCK_COMPANIES,
  MOCK_SHIPMENTS,
  MOCK_CORRIDORS,
  MOCK_PORTS,
  MockShipment,
  MockCompany,
  ConfidenceTier,
} from "@/vision/mock";

type ViewMode = "shipments" | "companies";

export default function VisionSearch() {
  const { openDrawer } = useVisionStore();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Search query & filters
  const [query, setQuery] = useState<string>("");
  const [selectedTier, setSelectedTier] = useState<string>("ALL");
  const [selectedCorridor, setSelectedCorridor] = useState<string>("ALL");
  const [selectedPort, setSelectedPort] = useState<string>("ALL");
  const [viewMode, setViewMode] = useState<ViewMode>("shipments");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 8;

  // ⌘K keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return MOCK_SHIPMENTS.filter((s) => {
      // Query search
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery =
          s.bolNumber.toLowerCase().includes(q) ||
          s.consigneeName.toLowerCase().includes(q) ||
          s.shipperName.toLowerCase().includes(q) ||
          s.hsCode.toLowerCase().includes(q) ||
          s.hsDescription.toLowerCase().includes(q) ||
          s.carrierName.toLowerCase().includes(q) ||
          s.originPortCode.toLowerCase().includes(q) ||
          s.destPortCode.toLowerCase().includes(q);
        if (!matchesQuery) return false;
      }

      // Tier filter
      if (selectedTier !== "ALL" && s.confidenceTier !== selectedTier) {
        return false;
      }

      // Port filter
      if (
        selectedPort !== "ALL" &&
        s.originPortCode !== selectedPort &&
        s.destPortCode !== selectedPort
      ) {
        return false;
      }

      return true;
    });
  }, [query, selectedTier, selectedPort]);

  // Filtered companies
  const filteredCompanies = useMemo(() => {
    return MOCK_COMPANIES.filter((c) => {
      if (query.trim()) {
        const q = query.toLowerCase();
        const matchesQuery =
          c.canonicalName.toLowerCase().includes(q) ||
          c.aliasCluster.some((a) => a.toLowerCase().includes(q)) ||
          c.primaryHsCode.toLowerCase().includes(q) ||
          c.country.toLowerCase().includes(q) ||
          c.topShippers.some((s) => s.toLowerCase().includes(q));
        if (!matchesQuery) return false;
      }

      if (selectedTier !== "ALL" && c.confidenceTier !== selectedTier) {
        return false;
      }

      return true;
    });
  }, [query, selectedTier]);

  // Pagination
  const totalItems =
    viewMode === "shipments" ? filteredShipments.length : filteredCompanies.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedShipments = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredShipments.slice(start, start + pageSize);
  }, [filteredShipments, currentPage]);

  const paginatedCompanies = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCompanies.slice(start, start + pageSize);
  }, [filteredCompanies, currentPage]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, selectedTier, selectedCorridor, selectedPort, viewMode]);

  // Reset all filters
  const handleResetFilters = () => {
    setQuery("");
    setSelectedTier("ALL");
    setSelectedCorridor("ALL");
    setSelectedPort("ALL");
  };

  const hasActiveFilters =
    query.trim() !== "" ||
    selectedTier !== "ALL" ||
    selectedCorridor !== "ALL" ||
    selectedPort !== "ALL";

  // Provenance drawer trigger for shipment
  const handleOpenShipmentEvidence = (shipment: MockShipment) => {
    openDrawer({
      claimLabel: `Search Result: Bill of Lading ${shipment.bolNumber}`,
      claimValue: `${shipment.consigneeName} <- ${shipment.shipperName}`,
      calculationFormula: `Manifest declaration filed on ${shipment.filingDate} via carrier ${shipment.carrierName}`,
      contributingRecordsCount: 1,
      contributingRecordsDenominator: 1,
      sourceDataset: shipment.provenance.sourceDataset,
      sourceJurisdiction: shipment.provenance.sourceJurisdiction,
      licenseNote: shipment.provenance.licenseReference,
      transformationPipeline:
        "Raw Manifest -> Data Contract Validation -> Silver Normalization -> OpenSearch Index",
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
    <VisionLayout pageTitle="Global Search & Omnibar">
      <Head>
        <title>Global Search (⌘K) — Orchid Trade Intelligence</title>
      </Head>

      <div className="space-y-6">
        {/* HEADER & CONTEXT BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="p-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Search className="w-4 h-4" />
              </span>
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest">
                Search & Discovery / Q3 2024 Index
              </span>
              <MockLabel size="xs" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
              Global Manifest & Entity Search
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 font-sans mt-0.5 max-w-2xl">
              Faceted discovery across canonical corporate entities, oceanic bills of lading, and
              customs tariff classifications.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <StatusChip
              type="built_simplified"
              tooltipText="Live app at localhost:3000/search performs in-memory keyword filtering across synthetic manifests. OpenSearch backend service is running on port 9200 but not wired to the frontend. Vision preview models the full multi-facet OpenSearch query experience with confidence-tiered filtering."
            />
            <span className="text-xs font-mono text-slate-400 px-3 py-1 rounded-full bg-black/40 border border-white/10 hidden sm:inline-block">
              Jul 1 – Sep 30, 2024
            </span>
          </div>
        </div>

        {/* ⌘K OMNIBAR SEARCH INPUT */}
        <div className="relative">
          <div className="relative flex items-center">
            <div className="absolute left-4 text-slate-400 pointer-events-none">
              <Search className="w-5 h-5 text-amber-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by company, alias, BOL (e.g. NWRE-), HS code (e.g. 852852), or port (e.g. VNSGN)..."
              className="w-full pl-12 pr-28 py-3.5 rounded-2xl bg-gradient-to-r from-[#0F1629] to-[#0B1020] border border-[#1E2A45] hover:border-amber-400/40 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-sm text-white placeholder-slate-500 font-sans transition-all shadow-lg outline-none"
            />
            <div className="absolute right-4 flex items-center gap-1.5 pointer-events-none">
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white/[0.08] border border-white/10 text-[10px] font-mono text-slate-300">
                <Command className="w-3 h-3" />
                <span>K</span>
              </kbd>
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-slate-400 hover:text-white pointer-events-auto"
                  aria-label="Clear Search Input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* QUICK SUGGESTIONS CHIPS */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs font-mono">
            <span className="text-[10px] uppercase text-slate-500 mr-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Suggested:</span>
            </span>
            {["Northwind Retail", "Helix Components", "852852", "VNSGN", "USLAX", "Samsung"].map(
              (term) => (
                <button
                  key={term}
                  type="button"
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-0.5 rounded-full bg-white/[0.03] border border-white/10 hover:border-amber-400/30 hover:bg-white/[0.06] text-slate-300 text-[11px] transition-all"
                >
                  {term}
                </button>
              )
            )}
          </div>
        </div>

        {/* FACETED FILTER BAR & VIEW TOGGLE */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 rounded-xl bg-black/40 border border-[#1E2A45]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
              <span>Filters:</span>
            </span>

            {/* Confidence Tier Selector */}
            <select
              value={selectedTier}
              onChange={(e) => setSelectedTier(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#0F1629] border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              aria-label="Filter by Confidence Tier"
            >
              <option value="ALL">All Confidence Tiers</option>
              <option value="HIGH">High Confidence (&gt;= 85%)</option>
              <option value="MEDIUM">Medium / Review Band [65-85%)</option>
              <option value="LOW">Low Confidence (&lt; 65%)</option>
            </select>

            {/* Port Selector */}
            <select
              value={selectedPort}
              onChange={(e) => setSelectedPort(e.target.value)}
              className="px-2.5 py-1 rounded-lg bg-[#0F1629] border border-white/10 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
              aria-label="Filter by Port"
            >
              <option value="ALL">All Global Terminals</option>
              <option value="VNSGN">Saigon Port (VNSGN)</option>
              <option value="VNHPH">Hai Phong (VNHPH)</option>
              <option value="HKHKG">Hong Kong (HKHKG)</option>
              <option value="KRPUS">Busan Port (KRPUS)</option>
              <option value="USLAX">Los Angeles (USLAX)</option>
              <option value="USLGB">Long Beach (USLGB)</option>
              <option value="USSEA">Seattle (USSEA)</option>
              <option value="USNYC">New York / NJ (USNYC)</option>
            </select>

            {/* Reset Filters Button */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-2.5 py-1 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-mono flex items-center gap-1 transition-all"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/[0.04] border border-white/10 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("shipments")}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                viewMode === "shipments"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Bills of Lading ({filteredShipments.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode("companies")}
              className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-all ${
                viewMode === "companies"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/30 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Canonical Entities ({filteredCompanies.length})
            </button>
          </div>
        </div>

        {/* RESULTS SUMMARY BAR */}
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
          <div>
            Showing{" "}
            <strong className="text-white">
              {viewMode === "shipments"
                ? `${filteredShipments.length} of ${MOCK_SHIPMENTS.length}`
                : `${filteredCompanies.length} of ${MOCK_COMPANIES.length}`}
            </strong>{" "}
            {viewMode === "shipments" ? "shipments" : "companies"} matching current filters
          </div>
          <div className="text-[11px] text-slate-500">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* RESULTS GRID / LIST */}
        {totalItems === 0 ? (
          <GlassPanel padding="lg" className="text-center py-12">
            <EmptyState
              title="No records matched your search query"
              description="Try broadening your search term or resetting the confidence tier and terminal filters."
              actionText="Clear All Search Filters"
              onAction={handleResetFilters}
            />
          </GlassPanel>
        ) : viewMode === "shipments" ? (
          /* SHIPMENTS CARDS */
          <div className="space-y-3">
            {paginatedShipments.map((shipment) => (
              <GlassPanel
                key={shipment.id}
                padding="sm"
                hoverEffect={true}
                className="cursor-pointer"
              >
                <div
                  onClick={() => handleOpenShipmentEvidence(shipment)}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-1"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleOpenShipmentEvidence(shipment);
                    }
                  }}
                >
                  {/* Left Column: BOL + Parties */}
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      <span className="font-bold text-amber-400 text-sm">
                        {shipment.bolNumber}
                      </span>
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-300">{shipment.filingDate}</span>
                      <ConfidenceBadge
                        tier={shipment.confidenceTier}
                        score={shipment.confidenceScore}
                        showScore={true}
                      />
                      <MockLabel size="xs" />
                    </div>

                    <div className="text-xs sm:text-sm text-slate-200 font-sans">
                      <span className="font-semibold text-white">
                        {shipment.consigneeName}
                      </span>
                      <span className="text-slate-500 mx-2">←</span>
                      <span className="text-slate-300">{shipment.shipperName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <Anchor className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {shipment.originPortCode} → {shipment.destPortCode}
                        </span>
                      </span>
                      <span>•</span>
                      <span>Carrier: {shipment.carrierName}</span>
                      <span>•</span>
                      <span>
                        HS {shipment.hsCode} ({shipment.hsDescription.slice(0, 28)}…)
                      </span>
                    </div>
                  </div>

                  {/* Right Column: Values & Evidence Button */}
                  <div className="flex sm:flex-row lg:flex-col items-end justify-between sm:justify-end gap-2 lg:gap-1 text-right shrink-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-white/5">
                    <div>
                      <span className="text-[10px] font-mono text-slate-500 block uppercase">
                        Declared Value
                      </span>
                      <span className="text-sm font-mono font-bold text-white">
                        {shipment.declaredValueUsd
                          ? `$${shipment.declaredValueUsd.toLocaleString("en-US")} USD`
                          : "MASKED (19 C.F.R. § 103.31)"}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenShipmentEvidence(shipment);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-mono text-teal-400 hover:text-teal-300 hover:underline pt-1"
                    >
                      <span>Inspect Provenance Proof</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </GlassPanel>
            ))}
          </div>
        ) : (
          /* CANONICAL COMPANIES CARDS */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedCompanies.map((comp) => (
              <GlassPanel
                key={comp.id}
                padding="md"
                hoverEffect={true}
                className="flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <ConfidenceBadge
                          tier={comp.confidenceTier}
                          score={comp.confidenceScore}
                          showScore={true}
                        />
                        <span className="text-[10px] font-mono text-slate-400">
                          {comp.jurisdiction}
                        </span>
                      </div>
                      <h3 className="text-base font-bold font-serif text-white">
                        {comp.canonicalName}
                      </h3>
                    </div>
                    <MockLabel size="xs" />
                  </div>

                  {/* Alias count pill */}
                  <div className="p-2 rounded-lg bg-black/40 border border-white/5 text-xs font-mono text-slate-300">
                    <span className="text-amber-400 font-semibold">{comp.aliasCount}</span>{" "}
                    jurisdictional variants clustered
                  </div>

                  {/* Coverage denominator */}
                  <div className="text-xs font-mono text-slate-400 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>Match Coverage:</span>
                      <strong className="text-white">
                        {comp.matchedShipments} of {comp.totalShipments} shipments
                      </strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Primary Corridor:</span>
                      <span className="text-slate-300 truncate max-w-[200px]">
                        {comp.corridor}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-500">
                    HS {comp.primaryHsCode}
                  </span>
                  <Link
                    href={`/vision/company/${comp.id}`}
                    className="inline-flex items-center gap-1 text-xs font-mono text-amber-400 hover:text-amber-300 font-semibold group"
                  >
                    <span>View Company 360</span>
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </GlassPanel>
            ))}
          </div>
        )}

        {/* PAGINATION CONTROLS */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-[#1E2A45] text-xs font-mono">
            <span className="text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] disabled:opacity-30 text-white hover:bg-white/[0.1] transition-all"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1.5 rounded-lg bg-white/[0.05] disabled:opacity-30 text-white hover:bg-white/[0.1] transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </VisionLayout>
  );
}
