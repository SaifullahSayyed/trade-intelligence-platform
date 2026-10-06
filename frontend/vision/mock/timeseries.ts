import { MockTimeSeriesPoint } from "./types";
import { MOCK_COMPANIES } from "./companies";

const MONTHS = [
  { label: "Oct 2023", iso: "2023-10" },
  { label: "Nov 2023", iso: "2023-11" },
  { label: "Dec 2023", iso: "2023-12" },
  { label: "Jan 2024", iso: "2024-01" },
  { label: "Feb 2024", iso: "2024-02" },
  { label: "Mar 2024", iso: "2024-03" },
  { label: "Apr 2024", iso: "2024-04" },
  { label: "May 2024", iso: "2024-05" },
  { label: "Jun 2024", iso: "2024-06" },
  { label: "Jul 2024", iso: "2024-07" },
  { label: "Aug 2024", iso: "2024-08" },
  { label: "Sep 2024", iso: "2024-09" },
];

export function getCompanyTimeSeries(companyId: string): MockTimeSeriesPoint[] {
  const company = MOCK_COMPANIES.find((c) => c.id === companyId) || MOCK_COMPANIES[0];
  const monthlyBase = Math.round(company.totalShipments / 3); // Q3 volume basis

  return MONTHS.map((m, idx) => {
    // Seasonal wave: peak in Aug/Sep for holiday inventory import
    const seasonality = 1 + Math.sin((idx / 12) * Math.PI * 2 - Math.PI / 2) * 0.28;
    const count = Math.max(8, Math.round(monthlyBase * seasonality * (0.85 + (idx % 4) * 0.08)));
    const meanConf = Math.min(0.96, company.confidenceScore * (0.96 + (idx % 3) * 0.02));
    const ciWidth = 0.045 - (idx * 0.001); // Confidence narrows as data accumulates
    const value = count * 185000;

    return {
      month: m.label,
      monthIso: m.iso,
      shipmentCount: count,
      shipmentCountDenominator: count,
      tradeValueUsd: value,
      confidenceMean: Math.round(meanConf * 1000) / 1000,
      confidenceLow: Math.round((meanConf - ciWidth) * 1000) / 1000,
      confidenceHigh: Math.min(1.0, Math.round((meanConf + ciWidth) * 1000) / 1000),
      isMock: true,
    };
  });
}

// Pre-computed series for featured company (Northwind Retail Group)
export const NORTHWIND_TIMESERIES = getCompanyTimeSeries("nrg-001");
