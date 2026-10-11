import { MockTimeSeriesPoint } from "./types";
import { MOCK_COMPANIES } from "./companies";
import { MOCK_SHIPMENTS } from "./shipments";

// Strictly Q3 2024: Jul 1 - Sep 30, 2024
const Q3_MONTHS = [
  { label: "Jul 2024", iso: "2024-07" },
  { label: "Aug 2024", iso: "2024-08" },
  { label: "Sep 2024", iso: "2024-09" },
];

export function getCompanyTimeSeries(companyId: string): MockTimeSeriesPoint[] {
  const company = MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
  const companyShipments = MOCK_SHIPMENTS.filter((s) => s.companyId === company.id);
  const total = companyShipments.length;

  const monthlyCounts: Record<string, { count: number; value: number; confSum: number }> = {
    "Jul 2024": { count: 0, value: 0, confSum: 0 },
    "Aug 2024": { count: 0, value: 0, confSum: 0 },
    "Sep 2024": { count: 0, value: 0, confSum: 0 },
  };

  for (const s of companyShipments) {
    const key = s.filingDate.startsWith("2024-07")
      ? "Jul 2024"
      : s.filingDate.startsWith("2024-08")
      ? "Aug 2024"
      : "Sep 2024";

    monthlyCounts[key].count += 1;
    if (s.declaredValueUsd) monthlyCounts[key].value += s.declaredValueUsd;
    monthlyCounts[key].confSum += s.confidenceScore;
  }

  return Q3_MONTHS.map((m) => {
    const data = monthlyCounts[m.label];
    const meanConf = data.count > 0 ? Math.round((data.confSum / data.count) * 1000) / 1000 : company.confidenceScore;
    const ciWidth = 0.035;

    return {
      month: m.label,
      monthIso: m.iso,
      shipmentCount: data.count,
      shipmentCountDenominator: total,
      tradeValueUsd: data.value,
      confidenceMean: meanConf,
      confidenceLow: Math.round((meanConf - ciWidth) * 1000) / 1000,
      confidenceHigh: Math.min(1.0, Math.round((meanConf + ciWidth) * 1000) / 1000),
      isMock: true,
    };
  });
}

// Pre-computed series for featured company (Northwind Retail Group)
export const NORTHWIND_TIMESERIES = getCompanyTimeSeries("nrg-001");
