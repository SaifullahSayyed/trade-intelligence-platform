import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Head from "next/head";
import {
  Compass,
  Building2,
  Search,
  GitMerge,
  Bot,
  ShieldAlert,
  Share2,
  Globe2,
  Bell,
  FileSpreadsheet,
  Lock,
  CreditCard,
  Milestone,
  Sliders,
  Maximize2,
  Minimize2,
  HelpCircle,
  Menu,
  X,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { VisionBadge } from "../ui/VisionBadge";
import { StatusChip } from "../ui/StatusChip";
import { useVisionStore } from "../store/visionStore";
import { EvidenceDrawer } from "../components/EvidenceDrawer";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  chipType: "built" | "built_simplified" | "backend_planned" | "planned";
  badgeText?: string;
  disabled?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/vision/home", label: "Command Center", icon: Compass, chipType: "built_simplified" },
  { href: "/vision/company/nrg-001", label: "Company 360 Profile", icon: Building2, chipType: "built_simplified" },
  { href: "/vision/search", label: "Global Search (⌘K)", icon: Search, chipType: "built_simplified" },
  { href: "/vision/workbench", label: "Resolution Workbench", icon: GitMerge, chipType: "built_simplified" },
  { href: "/vision/ai", label: "AI Analyst Workspace", icon: Bot, chipType: "built_simplified" },
  { href: "/vision/quality", label: "Data Quality Monitor", icon: ShieldAlert, chipType: "built_simplified" },
  { href: "/vision/network", label: "Supply-Chain Network 3D", icon: Share2, chipType: "built_simplified" },
  { href: "/vision/lanes", label: "Trade-Lane Explorer", icon: Globe2, chipType: "built_simplified" },
  { href: "/vision/alerts", label: "Alerts & Watchlists", icon: Bell, chipType: "built_simplified" },
  { href: "/vision/reports", label: "Reports & Exports", icon: FileSpreadsheet, chipType: "planned", disabled: true },
  { href: "/vision/governance", label: "Governance & Audit", icon: Lock, chipType: "planned", disabled: true },
  { href: "/vision/pricing", label: "Usage & Pricing", icon: CreditCard, chipType: "planned", disabled: true },
  { href: "/vision/roadmap", label: "10-Floor Roadmap", icon: Milestone, chipType: "planned", disabled: true },
  { href: "/vision/_kit", label: "Design System Kit", icon: Sliders, chipType: "built" },
];

export const VisionLayout: React.FC<{
  children: React.ReactNode;
  pageTitle?: string;
  activeScreen?: string;
}> = ({ children, pageTitle = "Orchid Vision Preview", activeScreen }) => {
  const router = useRouter();
  const {
    density,
    toggleDensity,
    startTour,
    presenterMenuOpen,
    setPresenterMenuOpen,
  } = useVisionStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0B1020] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-white flex flex-col">
      <Head>
        <title>{pageTitle} — Orchid Trade Intelligence</title>
      </Head>

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 h-16 bg-[#070b14]/90 border-b border-[#1E2A45] backdrop-blur-xl flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 lg:hidden focus:outline-none"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/vision/home" className="flex items-center gap-2 group">
            <span className="text-lg font-serif font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
              ORCHID
            </span>
            <span className="hidden sm:inline text-[10px] font-mono text-slate-400 uppercase tracking-widest pl-2 border-l border-white/10">
              TRADE INTELLIGENCE
            </span>
          </Link>

          {/* Mandatory persistent badge */}
          <VisionBadge />
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Built vs Planned presenter menu trigger */}
          <button
            type="button"
            onClick={() => setPresenterMenuOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-white/[0.04] border border-white/10 text-slate-300 hover:bg-white/[0.08] hover:border-amber-400/40 hover:text-amber-300 transition-all focus:outline-none focus:ring-1 focus:ring-amber-400"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
            <span>Built vs Planned</span>
          </button>

          {/* Guided Tour button */}
          <button
            type="button"
            onClick={() => {
              if (router.pathname !== "/vision/home") {
                router.push("/vision/home").then(() => startTour());
              } else {
                startTour();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 transition-all focus:outline-none focus:ring-1 focus:ring-amber-400 shadow-sm"
          >
            <span>Tour Mode</span>
          </button>

          {/* Density toggle */}
          <button
            type="button"
            onClick={toggleDensity}
            title={`Switch to ${density === "comfortable" ? "compact" : "comfortable"} density`}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
            aria-label="Toggle Density"
          >
            {density === "comfortable" ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex overflow-hidden">
        {/* SIDEBAR NAVIGATION */}
        <aside
          className={`fixed lg:static inset-y-16 left-0 z-30 w-64 bg-[#070b14] border-r border-[#1E2A45] flex flex-col justify-between transition-transform duration-300 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="px-3 py-2 text-[10px] font-mono text-slate-500 uppercase tracking-wider font-semibold">
              Preview Modules (Q3 2024 Sample)
            </div>

            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = router.pathname === item.href;
              const dotColor =
                item.chipType === "built"
                  ? "bg-teal-400 shadow-[0_0_6px_rgba(20,184,166,0.6)]"
                  : item.chipType === "built_simplified"
                  ? "bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.6)]"
                  : item.chipType === "backend_planned"
                  ? "bg-indigo-400 shadow-[0_0_6px_rgba(99,102,241,0.6)]"
                  : "bg-slate-600";

              const tooltip =
                item.disabled
                  ? "Planned — not yet implemented"
                  : item.chipType === "built"
                  ? "Built Today"
                  : item.chipType === "built_simplified"
                  ? "Interactive Preview (Q3 2024 Dataset)"
                  : "Planned";

              if (item.disabled) {
                return (
                  <div
                    key={item.href}
                    title={tooltip}
                    className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-600 cursor-not-allowed opacity-50 select-none border border-transparent"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon className="w-4 h-4 shrink-0 text-slate-600" />
                      <span className="truncate">{item.label}</span>
                    </div>
                    <span className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="w-2 h-2 rounded-full bg-slate-700" />
                    </span>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={tooltip}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-amber-500/10 text-amber-200 border border-amber-500/30 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-white/[0.03] border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-amber-400" : "text-slate-500 group-hover:text-slate-300"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  <span className="flex items-center gap-1.5 shrink-0 ml-2">
                    <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                  </span>
                </Link>
              );
            })}
          </div>

          {/* Clean status legend in sidebar footer (no dev info) */}
          <div className="p-3 border-t border-[#1E2A45]/60 text-[10px] font-mono text-slate-400 space-y-1.5">
            <div className="uppercase tracking-wider text-slate-500 font-semibold text-[9px]">
              Status Legend
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5" title="Production ready">
                <span className="w-2 h-2 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(20,184,166,0.5)]" />
                <span>Built</span>
              </span>
              <span className="flex items-center gap-1.5" title="Interactive Q3 2024 preview">
                <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(245,158,11,0.5)]" />
                <span>Preview</span>
              </span>
              <span className="flex items-center gap-1.5" title="Planned roadmap capability">
                <span className="w-2 h-2 rounded-full bg-slate-600" />
                <span>Planned</span>
              </span>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT VIEWPORT */}
        <main
          className={`flex-1 overflow-y-auto ${
            density === "compact" ? "p-3 sm:p-5" : "p-4 sm:p-8"
          } space-y-6 max-w-7xl mx-auto w-full`}
        >
          {children}
        </main>
      </div>

      {/* PRESENTER "WHAT'S REAL TODAY" SLIDE-OVER */}
      {presenterMenuOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setPresenterMenuOpen(false)}
          />
          <div className="relative z-10 w-full max-w-md bg-[#0B1020] border-l border-[#1E2A45] p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white font-sans">
                    What's Real Today vs Planned
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Orchid Trade Intelligence Repo Audit
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPresenterMenuOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category 1: Built Today */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-teal-300">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  <span>BUILT TODAY (Verified on Port 3000)</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-6 list-disc marker:text-teal-400">
                  <li>Infrastructure (PostgreSQL, ClickHouse, MinIO healthy)</li>
                  <li>Live Health HUD (/api/health)</li>
                  <li>Evidence & Lineage View (/api/evidence-demo)</li>
                  <li>Contract Rules & Canonical Schema viewers</li>
                  <li>Basic keyword shipment search (/search)</li>
                  <li>Basic company profile view (/company/...)</li>
                  <li>Basic review queue interface (/review)</li>
                </ul>
              </div>

              {/* Category 2: Backend Built / UI Planned */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-indigo-300">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                  <span>BACKEND BUILT / UI PLANNED</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1.5 pl-6 list-disc marker:text-indigo-400">
                  <li>Probabilistic Matcher (backend/entity_resolution/ fellegi-sunter scorer)</li>
                  <li>OpenSearch manifest text indexer</li>
                  <li>AI Safety Validator (backend regex banned-word filter)</li>
                  <li>ClickHouse Materialized Views (schema defined)</li>
                  <li>Dagster weekly orchestration assets</li>
                </ul>
              </div>

              {/* Category 3: Planned */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-semibold text-slate-400">
                  <span className="w-2 h-2 rounded-full bg-slate-500 ml-1 mr-1" />
                  <span>PLANNED (Vision Preview Concepts)</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 pl-6 list-disc marker:text-slate-500">
                  <li>3D Force-Directed Supply Chain Network</li>
                  <li>3D Trade-Lane Globe with live arc traffic</li>
                  <li>Recharts Trade-Lane Sankey flow</li>
                  <li>Interactive Alert Rule Builder</li>
                  <li>Async Signed-URL Export System</li>
                  <li>Multi-Tenant Data Rights Matrix</li>
                  <li>Transparent Metered Pricing Engine</li>
                </ul>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10 text-center">
              <a
                href="http://localhost:3000"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-mono text-amber-300 hover:underline"
              >
                <span>Open Live Working App (Port 3000)</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Globally accessible Evidence & Provenance Drawer */}
      <EvidenceDrawer />
    </div>
  );
};

export default VisionLayout;
