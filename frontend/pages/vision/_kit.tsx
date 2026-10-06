import React from "react";
import Head from "next/head";
import { VisionLayout } from "@/vision/layout/VisionLayout";
import {
  VisionBadge,
  StatusChip,
  GlassPanel,
  ConfidenceBadge,
  DenominatorMetric,
  MockLabel,
  Skeleton,
  CardSkeleton,
  TableSkeleton,
  EmptyState,
  ErrorState,
} from "@/vision/ui";
import { useVisionStore } from "@/vision/store/visionStore";

export default function VisionKit() {
  const { openDrawer } = useVisionStore();

  const sampleDrawerPayload = {
    claimLabel: "Sample Illustrative Verification",
    claimValue: "$1,842,000 USD",
    calculationFormula: "SUM(declared_value_usd) across 124 matched bills of lading",
    contributingRecordsCount: 124,
    contributingRecordsDenominator: 150,
    sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
    sourceJurisdiction: "US (19 C.F.R. § 103.31 Public Record)",
    licenseNote: "Public domain government record under 19 C.F.R. § 103.31",
    transformationPipeline: "Bronze raw manifest -> Silver canonical normalization",
    modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
    modelVersion: "probabilistic_matcher_v1.2_fs",
    uncertaintyRationale:
      "24 of 124 bills of lading have declared customs value masked under statutory confidentiality exemptions. Values reflect declared invoice totals, not cleared duty payments.",
    underlyingRecords: [
      {
        id: "shp-001",
        bol: "NWRE-240904-00012",
        date: "2024-09-04",
        consignee: "NORTHWIND RETAIL GROUP",
        shipper: "HELIX COMPONENTS LTD",
        value: "$342,000 USD",
        confidence: "HIGH" as const,
      },
      {
        id: "shp-002",
        bol: "NWRE-240906-00014",
        date: "2024-09-06",
        consignee: "NORTHWIND RETAIL GROUP",
        shipper: "SOLARIS OPTOELECTRONICS",
        value: "$218,000 USD",
        confidence: "HIGH" as const,
      },
    ],
    fieldComparison: [
      {
        fieldName: "consignee_name",
        label: "Consignee / Importer",
        rawValue: "NORTHWIND RETAIL GRP LLC",
        normalizedValue: "NORTHWIND RETAIL GROUP",
        derivedValue: "NORTHWIND RETAIL GROUP (US)",
        missingness: null,
      },
      {
        fieldName: "declared_value_usd",
        label: "Customs Declared Value",
        rawValue: null,
        normalizedValue: null,
        derivedValue: null,
        missingness: {
          reason: "MASKED" as const,
          description: "Carrier requested confidentiality under 19 C.F.R. § 103.31(d)",
        },
      },
    ],
    isMock: true as const,
  };

  return (
    <VisionLayout pageTitle="Design System Kit">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest font-semibold">
              Design System Showcase
            </span>
            <MockLabel size="xs" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
            Vision Component & Token Kit
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Interactive catalogue of quiet-luxury primitives, three-state status chips, and honest data widgets.
          </p>
        </div>

        {/* 1. Persistent Preview Badge */}
        <GlassPanel hairlineAccent="amber">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            1. Persistent Preview Badge (Non-Dismissible)
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <VisionBadge />
            <MockLabel size="sm" />
          </div>
        </GlassPanel>

        {/* 2. Three-State Status Chips */}
        <GlassPanel hairlineAccent="teal">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            2. Three-State Status Chips (Hover for Scope Tooltips)
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusChip type="built" />
            <StatusChip type="built_simplified" />
            <StatusChip type="backend_planned" />
            <StatusChip type="planned" />
          </div>
        </GlassPanel>

        {/* 3. Confidence Tiers */}
        <GlassPanel hairlineAccent="indigo">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            3. Probabilistic Matcher Confidence Badges
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ConfidenceBadge tier="HIGH" score={0.942} />
            <ConfidenceBadge tier="MEDIUM" score={0.764} />
            <ConfidenceBadge tier="LOW" score={0.512} />
          </div>
        </GlassPanel>

        {/* 4. Denominator-First Metrics */}
        <GlassPanel>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            4. Denominator-First Metrics (Click any to test Evidence Drawer)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DenominatorMetric
              label="Entity Matches"
              numerator={31}
              denominator={42}
              unit="pairs"
              timestampType="Window"
              timestampValue="Q3 2024 Illustrative Sample"
              onClickEvidence={() => openDrawer(sampleDrawerPayload)}
            />
            <DenominatorMetric
              label="Shipments Ingested"
              numerator={124}
              denominator={150}
              unit="manifests"
              timestampType="As of"
              timestampValue="2024-09-30 23:59Z"
              onClickEvidence={() => openDrawer(sampleDrawerPayload)}
            />
            <DenominatorMetric
              label="Sources Online"
              numerator={7}
              denominator={10}
              unit="feeds"
              timestampType="SLA window"
              timestampValue="< 24h freshness"
              onClickEvidence={() => openDrawer(sampleDrawerPayload)}
            />
          </div>
        </GlassPanel>

        {/* 5. Skeleton Loading States */}
        <GlassPanel>
          <div className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
            5. Skeleton Loading States
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CardSkeleton />
            <div className="p-5 rounded-2xl bg-black/40 border border-[#1E2A45]">
              <TableSkeleton rows={3} />
            </div>
          </div>
        </GlassPanel>

        {/* 6. Empty & Error States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No Matching Port Transits"
            description="Adjust your HS tariff code or origin port filter to expand results."
            actionText="Reset Filters"
            onAction={() => alert("Action triggered")}
          />
          <ErrorState
            title="Feed Timeout"
            message="The simulated port manifest buffer could not be reached."
            onRetry={() => alert("Retry triggered")}
          />
        </div>
      </div>
    </VisionLayout>
  );
}
