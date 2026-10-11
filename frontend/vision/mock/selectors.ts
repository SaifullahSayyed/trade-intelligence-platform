/**
 * Single Derived Source of Truth Selectors for Orchid Vision Preview
 *
 * BRIEF §0 & AUDIT REQUIREMENTS:
 * 1. Every number on every screen derives from selectors over this unified dataset.
 * 2. Per-corridor shipments sum strictly to total shipments (600).
 * 3. Company totals equal their shipment table counts.
 * 4. Strictly one period: Q3 2024 (Jul 1 – Sep 30, 2024).
 * 5. Numerator <= Denominator everywhere.
 * 6. Fictional carrier names only (no real carrier names).
 * 7. Rights note: "Illustrative rights note — pending counsel review".
 */

import { MOCK_COMPANIES } from "./companies";
import { MOCK_PORTS, MOCK_CORRIDORS } from "./corridors";
import { MOCK_SHIPMENTS } from "./shipments";
import type { MockShipment, MockCompany, MockCorridor, MockPort, MockTimeSeriesPoint } from "./types";

export const CANONICAL_DATASET_WINDOW = "Q3 2024 (Jul 1 – Sep 30, 2024)";
export const RIGHTS_LEGAL_LINE = "Illustrative rights note — pending counsel review";

// ── Fictional Carriers Registry (Strictly fictional) ─────────────────────────
export const FICTIONAL_CARRIERS = [
  { name: "Pacific Crest Lines", shipments: 184, teu: 5240, sharePct: 32 },
  { name: "Borealis Shipping Co.", shipments: 136, teu: 3820, sharePct: 24 },
  { name: "Vertex Maritime Transport", shipments: 108, teu: 2980, sharePct: 19 },
  { name: "Zenith Ocean Freight", shipments: 86, teu: 2360, sharePct: 15 },
  { name: "Solis Cargo Logistics", shipments: 56, teu: 1540, sharePct: 10 },
] as const;

// ── Global Dataset Totals ───────────────────────────────────────────────────
export function getGlobalMetrics() {
  const totalShipments = MOCK_SHIPMENTS.length; // exactly 600
  const matchedShipments = MOCK_SHIPMENTS.filter((s) => s.confidenceTier !== "LOW").length; // exactly 542
  const reviewShipments = totalShipments - matchedShipments; // exactly 58

  let totalTeu = 0;
  let totalDeclaredValueUsd = 0;
  let maskedValueCount = 0;

  for (const s of MOCK_SHIPMENTS) {
    totalTeu += s.teu;
    if (s.declaredValueUsd !== null) {
      totalDeclaredValueUsd += s.declaredValueUsd;
    } else {
      maskedValueCount++;
    }
  }

  return {
    windowLabel: CANONICAL_DATASET_WINDOW,
    totalShipments,
    matchedShipments,
    reviewShipments,
    totalTeu,
    totalDeclaredValueUsd,
    maskedValueCount,
    unmaskedValueCount: totalShipments - maskedValueCount,
    rightsNote: RIGHTS_LEGAL_LINE,
  };
}

// ── Per-Corridor Selectors ──────────────────────────────────────────────────
export interface CorridorDerivedMetrics {
  corridor: MockCorridor;
  shipments: MockShipment[];
  shipmentCount: number;
  totalTeu: number;
  declaredValueUsd: number;
  matchedCount: number;
  reviewCount: number;
  topCarriers: { name: string; shipments: number; teu: number; sharePct: number }[];
  portPairs: { origin: string; dest: string; shipments: number; teu: number; avgDays: number }[];
  monthlyVolume: { month: string; monthIso: string; shipments: number; teu: number; confidenceMean: number }[];
}

export function getShipmentsForCorridor(corridorId: string): MockShipment[] {
  return MOCK_SHIPMENTS.filter((s) => s.corridorId === corridorId);
}

export function getCorridorMetrics(corridorId: string): CorridorDerivedMetrics {
  const corridor = MOCK_CORRIDORS.find((c) => c.id === corridorId) || MOCK_CORRIDORS[0];
  const shipments = getShipmentsForCorridor(corridor.id);

  let totalTeu = 0;
  let declaredValueUsd = 0;
  let matchedCount = 0;

  const carrierCounts: Record<string, { shipments: number; teu: number }> = {};
  const pairCounts: Record<string, { shipments: number; teu: number; origin: string; dest: string }> = {};

  const monthlyCounts: Record<string, { shipments: number; teu: number; confSum: number }> = {
    "Jul 2024": { shipments: 0, teu: 0, confSum: 0 },
    "Aug 2024": { shipments: 0, teu: 0, confSum: 0 },
    "Sep 2024": { shipments: 0, teu: 0, confSum: 0 },
  };

  for (const s of shipments) {
    totalTeu += s.teu;
    if (s.declaredValueUsd !== null) declaredValueUsd += s.declaredValueUsd;
    if (s.confidenceTier !== "LOW") matchedCount++;

    // Carrier
    if (!carrierCounts[s.carrierName]) {
      carrierCounts[s.carrierName] = { shipments: 0, teu: 0 };
    }
    carrierCounts[s.carrierName].shipments += 1;
    carrierCounts[s.carrierName].teu += s.teu;

    // Port pair
    const pairKey = `${s.originPortCode}->${s.destPortCode}`;
    if (!pairCounts[pairKey]) {
      pairCounts[pairKey] = { shipments: 0, teu: 0, origin: s.originPortCode, dest: s.destPortCode };
    }
    pairCounts[pairKey].shipments += 1;
    pairCounts[pairKey].teu += s.teu;

    // Monthly bucket in Q3 2024
    const monthKey = s.filingDate.startsWith("2024-07")
      ? "Jul 2024"
      : s.filingDate.startsWith("2024-08")
      ? "Aug 2024"
      : "Sep 2024";

    monthlyCounts[monthKey].shipments += 1;
    monthlyCounts[monthKey].teu += s.teu;
    monthlyCounts[monthKey].confSum += s.confidenceScore;
  }

  const topCarriers = Object.entries(carrierCounts)
    .map(([name, data]) => ({
      name,
      shipments: data.shipments,
      teu: data.teu,
      sharePct: totalTeu > 0 ? Math.round((data.teu / totalTeu) * 100) : 0,
    }))
    .sort((a, b) => b.teu - a.teu);

  const portPairs = Object.values(pairCounts)
    .map((p) => ({
      origin: p.origin,
      dest: p.dest,
      shipments: p.shipments,
      teu: p.teu,
      avgDays: p.dest === "USLAX" ? 18.2 : p.dest === "USLGB" ? 19.1 : 16.5,
    }))
    .sort((a, b) => b.shipments - a.shipments);

  const monthlyVolume = [
    {
      month: "Jul 2024",
      monthIso: "2024-07",
      shipments: monthlyCounts["Jul 2024"].shipments,
      teu: monthlyCounts["Jul 2024"].teu,
      confidenceMean:
        monthlyCounts["Jul 2024"].shipments > 0
          ? Math.round((monthlyCounts["Jul 2024"].confSum / monthlyCounts["Jul 2024"].shipments) * 1000) / 1000
          : 0.91,
    },
    {
      month: "Aug 2024",
      monthIso: "2024-08",
      shipments: monthlyCounts["Aug 2024"].shipments,
      teu: monthlyCounts["Aug 2024"].teu,
      confidenceMean:
        monthlyCounts["Aug 2024"].shipments > 0
          ? Math.round((monthlyCounts["Aug 2024"].confSum / monthlyCounts["Aug 2024"].shipments) * 1000) / 1000
          : 0.92,
    },
    {
      month: "Sep 2024",
      monthIso: "2024-09",
      shipments: monthlyCounts["Sep 2024"].shipments,
      teu: monthlyCounts["Sep 2024"].teu,
      confidenceMean:
        monthlyCounts["Sep 2024"].shipments > 0
          ? Math.round((monthlyCounts["Sep 2024"].confSum / monthlyCounts["Sep 2024"].shipments) * 1000) / 1000
          : 0.93,
    },
  ];

  return {
    corridor,
    shipments,
    shipmentCount: shipments.length,
    totalTeu,
    declaredValueUsd,
    matchedCount,
    reviewCount: shipments.length - matchedCount,
    topCarriers,
    portPairs,
    monthlyVolume,
  };
}

// ── Per-Company Selectors ───────────────────────────────────────────────────
export interface CompanyDerivedMetrics {
  company: MockCompany;
  shipments: MockShipment[];
  totalShipments: number;
  matchedShipments: number;
  reviewShipments: number;
  totalTeu: number;
  totalWeightKg: number;
  totalDeclaredValueUsd: number;
  monthlyTimeSeries: MockTimeSeriesPoint[];
}

export function getShipmentsForCompany(companyId: string): MockShipment[] {
  return MOCK_SHIPMENTS.filter((s) => s.companyId === companyId);
}

export function getCompanyMetrics(companyId: string): CompanyDerivedMetrics {
  const company = MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
  const shipments = getShipmentsForCompany(company.id);

  let totalTeu = 0;
  let totalWeightKg = 0;
  let totalDeclaredValueUsd = 0;
  let matchedCount = 0;

  const monthlyCounts: Record<string, { shipments: number; teu: number; confSum: number; valueSum: number }> = {
    "Jul 2024": { shipments: 0, teu: 0, confSum: 0, valueSum: 0 },
    "Aug 2024": { shipments: 0, teu: 0, confSum: 0, valueSum: 0 },
    "Sep 2024": { shipments: 0, teu: 0, confSum: 0, valueSum: 0 },
  };

  for (const s of shipments) {
    totalTeu += s.teu;
    totalWeightKg += s.declaredWeightKg;
    if (s.declaredValueUsd !== null) {
      totalDeclaredValueUsd += s.declaredValueUsd;
    }
    if (s.confidenceTier !== "LOW") matchedCount++;

    const monthKey = s.filingDate.startsWith("2024-07")
      ? "Jul 2024"
      : s.filingDate.startsWith("2024-08")
      ? "Aug 2024"
      : "Sep 2024";

    monthlyCounts[monthKey].shipments += 1;
    monthlyCounts[monthKey].teu += s.teu;
    monthlyCounts[monthKey].confSum += s.confidenceScore;
    if (s.declaredValueUsd) monthlyCounts[monthKey].valueSum += s.declaredValueUsd;
  }

  // Monthly points strictly for Q3 2024
  const monthlyTimeSeries: MockTimeSeriesPoint[] = [
    {
      month: "Jul 2024",
      monthIso: "2024-07",
      shipmentCount: monthlyCounts["Jul 2024"].shipments,
      shipmentCountDenominator: shipments.length,
      tradeValueUsd: monthlyCounts["Jul 2024"].valueSum,
      confidenceMean:
        monthlyCounts["Jul 2024"].shipments > 0
          ? Math.round((monthlyCounts["Jul 2024"].confSum / monthlyCounts["Jul 2024"].shipments) * 1000) / 1000
          : 0.93,
      confidenceLow: 0.89,
      confidenceHigh: 0.97,
      isMock: true,
    },
    {
      month: "Aug 2024",
      monthIso: "2024-08",
      shipmentCount: monthlyCounts["Aug 2024"].shipments,
      shipmentCountDenominator: shipments.length,
      tradeValueUsd: monthlyCounts["Aug 2024"].valueSum,
      confidenceMean:
        monthlyCounts["Aug 2024"].shipments > 0
          ? Math.round((monthlyCounts["Aug 2024"].confSum / monthlyCounts["Aug 2024"].shipments) * 1000) / 1000
          : 0.94,
      confidenceLow: 0.9,
      confidenceHigh: 0.98,
      isMock: true,
    },
    {
      month: "Sep 2024",
      monthIso: "2024-09",
      shipmentCount: monthlyCounts["Sep 2024"].shipments,
      shipmentCountDenominator: shipments.length,
      tradeValueUsd: monthlyCounts["Sep 2024"].valueSum,
      confidenceMean:
        monthlyCounts["Sep 2024"].shipments > 0
          ? Math.round((monthlyCounts["Sep 2024"].confSum / monthlyCounts["Sep 2024"].shipments) * 1000) / 1000
          : 0.945,
      confidenceLow: 0.91,
      confidenceHigh: 0.98,
      isMock: true,
    },
  ];

  return {
    company,
    shipments,
    totalShipments: shipments.length,
    matchedShipments: matchedCount,
    reviewShipments: shipments.length - matchedCount,
    totalTeu,
    totalWeightKg,
    totalDeclaredValueUsd,
    monthlyTimeSeries,
  };
}

// ── Deterministic Replay Ticker Items (No Date.now / Math.random) ─────────────
export const DETERMINISTIC_REPLAY_TICKER = [
  {
    id: "rep-001",
    bolNumber: "NWRE-240930-00124",
    replayTimestampLabel: "Sep 30, 2024 14:32 UTC (Replay)",
    consignee: "NORTHWIND RETAIL GROUP",
    shipper: "HELIX COMPONENTS LTD (VN)",
    originPort: "VNSGN",
    destPort: "USLAX",
    hsCode: "852852",
    hsDescription: "Flat panel computer monitors",
    declaredValueUsd: 142500,
    confidenceTier: "HIGH" as const,
    confidenceScore: 0.942,
  },
  {
    id: "rep-002",
    bolNumber: "NWRE-240929-00118",
    replayTimestampLabel: "Sep 29, 2024 09:15 UTC (Replay)",
    consignee: "NORTHWIND RETAIL GROUP",
    shipper: "SOLARIS OPTOELECTRONICS (TW)",
    originPort: "TWKHH",
    destPort: "USLAX",
    hsCode: "852852",
    hsDescription: "Flat panel display modules",
    declaredValueUsd: 89000,
    confidenceTier: "HIGH" as const,
    confidenceScore: 0.931,
  },
  {
    id: "rep-003",
    bolNumber: "NWRE-240928-00094",
    replayTimestampLabel: "Sep 28, 2024 18:40 UTC (Replay)",
    consignee: "NORTHWIND RETAIL GRP",
    shipper: "PACIFIC MATRIX INDUSTRIES (VN)",
    originPort: "VNSGN",
    destPort: "USLGB",
    hsCode: "852852",
    hsDescription: "Video monitor sub-assemblies",
    declaredValueUsd: 112000,
    confidenceTier: "HIGH" as const,
    confidenceScore: 0.925,
  },
  {
    id: "rep-004",
    bolNumber: "NWRE-240927-00082",
    replayTimestampLabel: "Sep 27, 2024 11:05 UTC (Replay)",
    consignee: "NORTHWIND LOGISTICS LP",
    shipper: "HELIX COMPONENTS LTD (VN)",
    originPort: "VNHPH",
    destPort: "USLAX",
    hsCode: "852852",
    hsDescription: "Display panel controller cards",
    declaredValueUsd: null, // masked
    confidenceTier: "MEDIUM" as const,
    confidenceScore: 0.742,
  },
  {
    id: "rep-005",
    bolNumber: "NWRE-240926-00071",
    replayTimestampLabel: "Sep 26, 2024 07:22 UTC (Replay)",
    consignee: "NORTHWIND TRADING CO",
    shipper: "SOLARIS OPTOELECTRONICS (TW)",
    originPort: "HKHKG",
    destPort: "USLAX",
    hsCode: "852852",
    hsDescription: "Display panels and peripherals",
    declaredValueUsd: 76400,
    confidenceTier: "HIGH" as const,
    confidenceScore: 0.915,
  },
] as const;
