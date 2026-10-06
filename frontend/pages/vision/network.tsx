/**
 * Screen 10: Supply-Chain Nexus / Network Explorer — /vision/network
 *
 * Interactive multi-tier supplier network graph with topology metrics,
 * node inspection, tier-1 / tier-2 partner clustering, and EvidenceDrawer integration.
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
import type { ProvenanceDrawerPayload, MockFieldValue, MockCompany } from "../../vision/mock/types";
import {
  Share2,
  Building2,
  Ship,
  MapPin,
  Layers,
  ArrowRight,
  Info,
  ExternalLink,
  ChevronRight,
  ShieldAlert,
  Search,
  Filter,
  Network,
  Maximize2,
  Activity,
  CheckCircle2,
  Compass,
} from "lucide-react";

// ── Graph Node & Edge Types ────────────────────────────────────────────────
interface GraphNode {
  id: string;
  name: string;
  type: "CANONICAL_IMPORTER" | "TIER_1_SUPPLIER" | "TIER_2_SUPPLIER" | "CARRIER" | "PORT";
  tier: number;
  country: string;
  jurisdiction?: string;
  shipmentCount: number;
  teuVolume: number;
  confidenceScore: number;
  riskLevel: "LOW" | "ELEVATED" | "MONITOR";
  x: number;
  y: number;
  details: string;
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  volumeTeu: number;
  shipmentCount: number;
  corridor: string;
}

// ── Static Mock Graph Data ─────────────────────────────────────────────────
const GRAPH_NODES: GraphNode[] = [
  // Anchor Entity
  {
    id: "nrg-001",
    name: "Northwind Retail Group",
    type: "CANONICAL_IMPORTER",
    tier: 0,
    country: "United States",
    jurisdiction: "Delaware, US",
    shipmentCount: 124,
    teuVolume: 3420,
    confidenceScore: 0.942,
    riskLevel: "LOW",
    x: 480,
    y: 260,
    details: "Primary US Consignee. Consolidated cluster of 14 alias variants.",
  },
  // Tier 1 Direct Suppliers
  {
    id: "hlx-002",
    name: "Helix Components Ltd",
    type: "TIER_1_SUPPLIER",
    tier: 1,
    country: "Vietnam",
    jurisdiction: "Ho Chi Minh City, VN",
    shipmentCount: 68,
    teuVolume: 1840,
    confidenceScore: 0.915,
    riskLevel: "LOW",
    x: 220,
    y: 140,
    details: "Key supplier of HS 852852 display panels. Origin Saigon Port (VNSGN).",
  },
  {
    id: "prc-003",
    name: "Pacific Rim Trading Co.",
    type: "TIER_1_SUPPLIER",
    tier: 1,
    country: "Taiwan",
    jurisdiction: "Kaohsiung, TW",
    shipmentCount: 36,
    teuVolume: 920,
    confidenceScore: 0.812,
    riskLevel: "ELEVATED",
    x: 220,
    y: 260,
    details: "Electronics & mechanical assemblies. Confidence dropped due to unresolved alias.",
  },
  {
    id: "mer-004",
    name: "Meridian Global Logistics",
    type: "TIER_1_SUPPLIER",
    tier: 1,
    country: "Hong Kong",
    jurisdiction: "Hong Kong SAR",
    shipmentCount: 20,
    teuVolume: 660,
    confidenceScore: 0.884,
    riskLevel: "LOW",
    x: 220,
    y: 380,
    details: "Consolidator & forwarder for South China feeder manufacturing.",
  },
  // Tier 2 Sub-Suppliers
  {
    id: "sub-001",
    name: "Shenzhen Opto-Tech Fab",
    type: "TIER_2_SUPPLIER",
    tier: 2,
    country: "China",
    jurisdiction: "Guangdong, CN",
    shipmentCount: 42,
    teuVolume: 1120,
    confidenceScore: 0.865,
    riskLevel: "MONITOR",
    x: 60,
    y: 90,
    details: "Sub-assembly module supplier to Helix Components Ltd.",
  },
  {
    id: "sub-002",
    name: "Mekong Precision Metal",
    type: "TIER_2_SUPPLIER",
    tier: 2,
    country: "Vietnam",
    jurisdiction: "Binh Duong, VN",
    shipmentCount: 26,
    teuVolume: 720,
    confidenceScore: 0.892,
    riskLevel: "LOW",
    x: 60,
    y: 190,
    details: "Structural brackets & housing hardware for display units.",
  },
  {
    id: "sub-003",
    name: "Taipei IC Packaging",
    type: "TIER_2_SUPPLIER",
    tier: 2,
    country: "Taiwan",
    jurisdiction: "Hsinchu, TW",
    shipmentCount: 18,
    teuVolume: 410,
    confidenceScore: 0.908,
    riskLevel: "LOW",
    x: 60,
    y: 320,
    details: "Driver IC substrate supplier to Pacific Rim Trading.",
  },
  // Key Logistics Nodes
  {
    id: "port-vnsgn",
    name: "Saigon Port (VNSGN)",
    type: "PORT",
    tier: 1,
    country: "Vietnam",
    shipmentCount: 94,
    teuVolume: 2560,
    confidenceScore: 0.99,
    riskLevel: "LOW",
    x: 350,
    y: 80,
    details: "Primary loading terminal for Southeast Asian inbound volume.",
  },
  {
    id: "port-uslax",
    name: "Port of Los Angeles (USLAX)",
    type: "PORT",
    tier: 0,
    country: "United States",
    shipmentCount: 124,
    teuVolume: 3420,
    confidenceScore: 0.99,
    riskLevel: "LOW",
    x: 680,
    y: 260,
    details: "Discharge terminal for Trans-Pacific South corridor.",
  },
  {
    id: "carr-evergreen",
    name: "Evergreen Marine",
    type: "CARRIER",
    tier: 1,
    country: "Taiwan",
    shipmentCount: 78,
    teuVolume: 2150,
    confidenceScore: 0.95,
    riskLevel: "LOW",
    x: 580,
    y: 140,
    details: "Carries 63% of verified container volume on Trans-Pacific South.",
  },
];

const GRAPH_EDGES: GraphEdge[] = [
  // Tier 2 -> Tier 1
  { id: "e1", source: "sub-001", target: "hlx-002", label: "Glass & LED Modules", volumeTeu: 1120, shipmentCount: 42, corridor: "Intra-Asia Feeder" },
  { id: "e2", source: "sub-002", target: "hlx-002", label: "Metal Casings", volumeTeu: 720, shipmentCount: 26, corridor: "Domestic Feeder" },
  { id: "e3", source: "sub-003", target: "prc-003", label: "Driver ICs", volumeTeu: 410, shipmentCount: 18, corridor: "Taiwan Strait" },

  // Tier 1 -> Origin Port
  { id: "e4", source: "hlx-002", target: "port-vnsgn", label: "Barge / Drayage", volumeTeu: 1840, shipmentCount: 68, corridor: "VNSGN Drayage" },

  // Origin Port -> Importer (via ocean carrier)
  { id: "e5", source: "port-vnsgn", target: "carr-evergreen", label: "Ocean Booking", volumeTeu: 1840, shipmentCount: 68, corridor: "Trans-Pacific South" },
  { id: "e6", source: "carr-evergreen", target: "port-uslax", label: "Ocean Transit (18.4d)", volumeTeu: 2150, shipmentCount: 78, corridor: "Trans-Pacific South" },
  { id: "e7", source: "port-uslax", target: "nrg-001", label: "Customs Discharge", volumeTeu: 3420, shipmentCount: 124, corridor: "LA Basin Drayage" },

  // Direct Tier 1 to Importer Links
  { id: "e8", source: "hlx-002", target: "nrg-001", label: "Direct Commercial Bill", volumeTeu: 1840, shipmentCount: 68, corridor: "Trans-Pacific South" },
  { id: "e9", source: "prc-003", target: "nrg-001", label: "Direct Commercial Bill", volumeTeu: 920, shipmentCount: 36, corridor: "East Asia Mainline" },
  { id: "e10", source: "mer-004", target: "nrg-001", label: "Consolidated Forwarding", volumeTeu: 660, shipmentCount: 20, corridor: "Straits Express" },
];

export default function SupplyChainNexusPage() {
  const openDrawer = useVisionStore((s) => s.openDrawer);
  const [selectedNode, setSelectedNode] = useState<GraphNode>(GRAPH_NODES[0]);
  const [filterTier, setFilterTier] = useState<string>("ALL");
  const [filterRisk, setFilterRisk] = useState<string>("ALL");

  const filteredNodes = GRAPH_NODES.filter((n) => {
    if (filterTier === "TIER_1" && n.tier !== 1) return false;
    if (filterTier === "TIER_2" && n.tier !== 2) return false;
    if (filterRisk !== "ALL" && n.riskLevel !== filterRisk) return false;
    return true;
  });

  const nodeMap = new Map(GRAPH_NODES.map((n) => [n.id, n]));

  function openNodeDrawer(node: GraphNode) {
    const fields: MockFieldValue[] = [
      { fieldName: "entity_name", label: "Entity Name", rawValue: node.name, normalizedValue: node.name, derivedValue: null, missingness: null },
      { fieldName: "node_type", label: "Topology Role", rawValue: node.type, normalizedValue: node.type, derivedValue: null, missingness: null },
      { fieldName: "country", label: "Country / Jurisdiction", rawValue: node.country, normalizedValue: node.jurisdiction || node.country, derivedValue: null, missingness: null },
      { fieldName: "confidence_score", label: "Resolution Confidence", rawValue: node.confidenceScore.toFixed(3), normalizedValue: `${(node.confidenceScore * 100).toFixed(1)}%`, derivedValue: null, missingness: null },
      { fieldName: "total_teu", label: "Handled TEU Volume", rawValue: node.teuVolume.toString(), normalizedValue: `${node.teuVolume.toLocaleString("en-US")} TEU`, derivedValue: null, missingness: null },
    ];

    const payload: ProvenanceDrawerPayload = {
      claimLabel: `${node.name} (${node.type.replace(/_/g, " ")})`,
      claimValue: `${node.shipmentCount} of 124 matched shipments`,
      calculationFormula: "COUNT(shipments WHERE consignee = node.id OR shipper = node.id)",
      contributingRecordsCount: node.shipmentCount,
      contributingRecordsDenominator: 124,
      sourceDataset: "cbp_am_manifests",
      sourceJurisdiction: "US Customs and Border Protection",
      licenseNote: "CBP AMS public manifest data — 15-day delay per 19 CFR 103.31",
      transformationPipeline: "Bronze ingest → Fellegi-Sunter resolution → Multi-tier supply network topology graph",
      modelEngine: "Orchid Nexus Graph Engine v1.0",
      modelVersion: "orchid_nexus_v1.0",
      uncertaintyRationale:
        "Tier-2 links are inferred from bill of lading forwarding declarations and secondary manifest filings. Corporate ownership links require state registry corroboration.",
      underlyingRecords: [],
      fieldComparison: fields,
      isMock: true,
    };
    openDrawer(payload);
  }

  return (
    <VisionLayout pageTitle="Supply-Chain Network 3D — Orchid Vision">
      <div className="p-6 max-w-screen-2xl mx-auto space-y-8">

        {/* ── Page header ── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Share2 className="w-6 h-6 text-amber-400" />
              <h1 className="font-serif text-3xl font-bold text-slate-50">
                Supply-Chain Nexus & Network Topology
              </h1>
              <MockLabel />
            </div>
            <p className="text-sm text-slate-400 max-w-2xl">
              Multi-tier relationship graph mapping primary importers to Tier-1 direct shippers,
              Tier-2 module fabricators, ocean carriers, and discharge terminals.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-[10px] font-mono text-teal-400 border border-teal-500/30 rounded px-2.5 py-1 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5" /> 10 Nodes · 10 Verified Links
            </span>
            <span className="text-[10px] font-mono text-slate-500 border border-[#1E2A45] rounded px-2.5 py-1">
              Topology: Fellegi-Sunter Cluster Gold
            </span>
          </div>
        </div>

        {/* ── Statutory disclaimer ── */}
        <div className="border border-amber-500/25 bg-amber-500/5 rounded-lg px-4 py-3 text-xs text-amber-300/80 flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-400" />
          <span>
            <strong>Disclaimer:</strong> Network topologies and multi-tier supplier inferences are operational analytical models derived from{" "}
            <strong>[MOCK]</strong> customs manifest declarations. Orchid does NOT certify corporate ownership, legal relationships, or supply chain compliance.
          </span>
        </div>

        {/* ── KPI strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <DenominatorMetric
            label="Verified Tier-1 Shippers"
            numerator={3}
            denominator={3}
            unit="suppliers"
            onClickEvidence={() => openNodeDrawer(GRAPH_NODES[0])}
          />
          <DenominatorMetric
            label="Inferred Tier-2 Fabricators"
            numerator={3}
            denominator={4}
            unit="sub-tiers"
            onClickEvidence={() => openNodeDrawer(GRAPH_NODES[4])}
          />
          <DenominatorMetric
            label="Network TEU Concentration"
            numerator={3420}
            denominator={4210}
            unit="TEU (81.2%)"
            onClickEvidence={() => openNodeDrawer(GRAPH_NODES[0])}
          />
          <DenominatorMetric
            label="Resolved Entity Confidence"
            numerator={94.2}
            denominator={100}
            unit="mean score"
            onClickEvidence={() => openNodeDrawer(GRAPH_NODES[0])}
          />
        </div>

        {/* ── Two-Column Main Canvas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Interactive Graph Canvas (2/3) */}
          <GlassPanel className="lg:col-span-2 p-5 flex flex-col justify-between min-h-[540px]">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <Network className="w-4 h-4 text-amber-400" />
                <h2 className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Network Graph Canvas (2D Topology View)
                </h2>
                <MockLabel />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={filterTier}
                  onChange={(e) => setFilterTier(e.target.value)}
                  className="bg-[#0B1020] border border-[#1E2A45] rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="TIER_1">Tier 1 Shippers</option>
                  <option value="TIER_2">Tier 2 Fabricators</option>
                </select>
                <select
                  value={filterRisk}
                  onChange={(e) => setFilterRisk(e.target.value)}
                  className="bg-[#0B1020] border border-[#1E2A45] rounded px-2 py-1 text-xs text-slate-300 font-mono focus:outline-none"
                >
                  <option value="ALL">All Risk Ratings</option>
                  <option value="LOW">Low Risk</option>
                  <option value="ELEVATED">Elevated</option>
                  <option value="MONITOR">Monitor</option>
                </select>
              </div>
            </div>

            {/* SVG Visualizer */}
            <div className="relative w-full h-[440px] bg-[#070B14] rounded-xl border border-[#1E2A45] overflow-hidden flex items-center justify-center">
              <svg className="w-full h-full" viewBox="0 0 760 440">
                {/* Defs for gradients & markers */}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="14"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#2E3F66" />
                  </marker>
                  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.4" />
                  </linearGradient>
                </defs>

                {/* Edges */}
                {GRAPH_EDGES.map((edge) => {
                  const src = nodeMap.get(edge.source);
                  const tgt = nodeMap.get(edge.target);
                  if (!src || !tgt) return null;
                  const isHighlighted = selectedNode.id === src.id || selectedNode.id === tgt.id;

                  return (
                    <g key={edge.id}>
                      <line
                        x1={src.x}
                        y1={src.y}
                        x2={tgt.x}
                        y2={tgt.y}
                        stroke={isHighlighted ? "#F59E0B" : "#1E2A45"}
                        strokeWidth={isHighlighted ? 2.5 : 1.2}
                        strokeDasharray={edge.label.includes("Direct") ? undefined : "4 3"}
                        markerEnd="url(#arrowhead)"
                      />
                    </g>
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map((node) => {
                  const isSelected = selectedNode.id === node.id;
                  const isAnchor = node.type === "CANONICAL_IMPORTER";
                  const isPort = node.type === "PORT";
                  const isCarrier = node.type === "CARRIER";

                  let nodeColor = "#14B8A6";
                  if (isAnchor) nodeColor = "#F59E0B";
                  if (node.riskLevel === "ELEVATED") nodeColor = "#F97316";
                  if (node.riskLevel === "MONITOR") nodeColor = "#EF4444";
                  if (isPort) nodeColor = "#6366F1";
                  if (isCarrier) nodeColor = "#3B82F6";

                  return (
                    <g
                      key={node.id}
                      className="cursor-pointer transition-transform duration-200"
                      onClick={() => setSelectedNode(node)}
                    >
                      {/* Outer pulse if selected */}
                      {isSelected && (
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r={isAnchor ? 28 : 20}
                          fill={nodeColor}
                          opacity={0.2}
                          className="animate-ping"
                        />
                      )}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isAnchor ? 18 : 12}
                        fill="#0B1020"
                        stroke={nodeColor}
                        strokeWidth={isSelected ? 3 : 1.5}
                      />
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={isAnchor ? 8 : 4}
                        fill={nodeColor}
                      />
                      <text
                        x={node.x}
                        y={node.y + (isAnchor ? 30 : 22)}
                        textAnchor="middle"
                        fill={isSelected ? "#F59E0B" : "#94A3B8"}
                        fontSize={isAnchor ? 11 : 9}
                        fontFamily="monospace"
                        fontWeight={isSelected ? "bold" : "normal"}
                      >
                        {node.name.length > 18 ? node.name.slice(0, 16) + "…" : node.name}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Canvas Overlay Controls */}
              <div className="absolute bottom-3 left-3 flex items-center gap-3 text-[10px] font-mono text-slate-500 bg-[#0B1020]/90 px-3 py-1.5 rounded-lg border border-[#1E2A45]">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-400" /> Importer</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-teal-400" /> Tier 1/2</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Port Terminal</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /> Ocean Carrier</span>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
              <span>Click any node to inspect relationship vector & evidence provenance</span>
              <span>Coordinates calibrated for Q3 2024 manifest sample</span>
            </div>
          </GlassPanel>

          {/* Node Inspector Panel (1/3) */}
          <GlassPanel className="p-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#1E2A45] pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Node Inspector
                  </span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                  selectedNode.riskLevel === "LOW" ? "bg-teal-500/10 text-teal-400 border-teal-500/20" :
                  selectedNode.riskLevel === "ELEVATED" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-red-500/10 text-red-400 border-red-500/20"
                }`}>
                  {selectedNode.riskLevel} RISK
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-white font-serif mb-1">
                  {selectedNode.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {selectedNode.jurisdiction || selectedNode.country} · {selectedNode.type.replace(/_/g, " ")}
                </p>
              </div>

              <div className="bg-[#070B14] p-3 rounded-xl border border-[#1E2A45] space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Manifest Filings:</span>
                  <span className="text-white font-bold">{selectedNode.shipmentCount} of 124</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Handled TEU Volume:</span>
                  <span className="text-teal-400 font-bold">{selectedNode.teuVolume.toLocaleString("en-US")} TEU</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Match Confidence:</span>
                  <span className="text-amber-400 font-bold">{(selectedNode.confidenceScore * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Supply-Chain Tier:</span>
                  <span className="text-slate-300 font-bold">Tier {selectedNode.tier}</span>
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed bg-[#0F1629] p-3 rounded-xl border border-[#1E2A45]">
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                  Algorithmic Assessment Note
                </p>
                {selectedNode.details}
              </div>

              {/* Connected Links Feed */}
              <div>
                <h4 className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
                  Active Direct Links ({GRAPH_EDGES.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).length})
                </h4>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto pr-1">
                  {GRAPH_EDGES.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id).map((e) => {
                    const otherNodeId = e.source === selectedNode.id ? e.target : e.source;
                    const other = nodeMap.get(otherNodeId);
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between text-[11px] font-mono bg-[#070B14] px-2.5 py-1.5 rounded border border-[#1E2A45] text-slate-300"
                      >
                        <span className="truncate max-w-[140px]">{other?.name}</span>
                        <span className="text-amber-400">{e.volumeTeu} TEU</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => openNodeDrawer(selectedNode)}
              className="mt-4 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <span>Inspect Node Lineage & Evidence</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </GlassPanel>
        </div>

        {/* ── Multi-Tier Relationship Ledger Table ── */}
        <GlassPanel className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-400" />
              <h2 className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                Multi-Tier Provenance Ledger (10 Sample Entities)
              </h2>
              <MockLabel />
            </div>
            <span className="text-xs font-mono text-slate-500">
              Gold Layer Aggregation
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono border-collapse">
              <thead>
                <tr className="border-b border-[#1E2A45] text-slate-500 text-[10px] uppercase">
                  <th className="py-2.5 px-3">Node Name</th>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Tier</th>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3">TEU Volume</th>
                  <th className="py-2.5 px-3">Confidence</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2A45]/40 text-slate-300">
                {filteredNodes.map((n) => (
                  <tr
                    key={n.id}
                    className="hover:bg-[#1E2A45]/20 cursor-pointer transition-colors"
                    onClick={() => setSelectedNode(n)}
                  >
                    <td className="py-2.5 px-3 font-bold text-white flex items-center gap-2">
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        n.type === "CANONICAL_IMPORTER" ? "bg-amber-400" :
                        n.type === "PORT" ? "bg-indigo-400" :
                        n.type === "CARRIER" ? "bg-blue-400" : "bg-teal-400"
                      }`} />
                      {n.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{n.type.replace(/_/g, " ")}</td>
                    <td className="py-2.5 px-3">T{n.tier}</td>
                    <td className="py-2.5 px-3 text-slate-400">{n.country}</td>
                    <td className="py-2.5 px-3 text-teal-400 font-bold">{n.teuVolume.toLocaleString("en-US")} TEU</td>
                    <td className="py-2.5 px-3 text-amber-400">{(n.confidenceScore * 100).toFixed(1)}%</td>
                    <td className="py-2.5 px-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openNodeDrawer(n);
                        }}
                        className="text-slate-400 hover:text-amber-400 inline-flex items-center gap-1 text-[10px]"
                      >
                        Evidence <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>

        {/* Footer */}
        <p className="text-center text-[10px] text-slate-600 font-mono">
          [MOCK] All supply network nodes, multi-tier links, TEU quantities, and risk scores are synthetic illustrative data.
          Orchid does NOT issue compliance certifications, legal clearance, or fraud verdicts. · orchid_nexus_v1.0 · Q3 2024 Sample
        </p>
      </div>
    </VisionLayout>
  );
}
