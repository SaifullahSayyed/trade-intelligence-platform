import { MockShipment, MockFieldValue } from "./types";
import { MOCK_COMPANIES } from "./companies";
import { mulberry32 } from "./seed";

const rng = mulberry32(847291);

// Strictly fictional ocean carriers
const CARRIERS = [
  "Pacific Crest Lines",
  "Borealis Shipping Co.",
  "Vertex Maritime Transport",
  "Zenith Ocean Freight",
  "Solis Cargo Logistics",
  "Meridian Sea Transport",
];

const VESSELS = [
  "PACIFIC CREST V.042W",
  "BOREALIS TRADER V.118E",
  "VERTEX LEADER V.094",
  "ZENITH HARVEST V.212",
  "SOLIS BREEZE V.014",
  "MERIDIAN VOYAGER V.308",
];

interface PortRoute {
  origCode: string;
  origName: string;
  destCode: string;
  destName: string;
  country: string;
  corridorId: string;
}

const PORT_ROUTES: PortRoute[] = [
  // COR-001 Trans-Pacific South (Vietnam -> US West Coast)
  { origCode: "VNSGN", origName: "Saigon Port", destCode: "USLAX", destName: "Port of Los Angeles", country: "Vietnam", corridorId: "COR-001" },
  { origCode: "VNHPH", origName: "Hai Phong Port", destCode: "USLGB", destName: "Port of Long Beach", country: "Vietnam", corridorId: "COR-001" },
  // COR-002 Trans-Pacific North (Korea/Japan -> US Pacific Northwest)
  { origCode: "KRPUS", origName: "Busan Port", destCode: "USSEA", destName: "Port of Seattle", country: "South Korea", corridorId: "COR-002" },
  { origCode: "JPYOK", origName: "Port of Yokohama", destCode: "USSEA", destName: "Port of Seattle", country: "Japan", corridorId: "COR-002" },
  // COR-003 East Asia Mainline (Hong Kong / Taiwan -> US West Coast)
  { origCode: "HKHKG", origName: "Port of Hong Kong", destCode: "USLAX", destName: "Port of Los Angeles", country: "Hong Kong", corridorId: "COR-003" },
  { origCode: "TWKHH", origName: "Port of Kaohsiung", destCode: "USOAK", destName: "Port of Oakland", country: "Taiwan", corridorId: "COR-003" },
  // COR-004 Straits Express (Singapore / Malaysia -> US East Coast)
  { origCode: "SGSIN", origName: "Port of Singapore", destCode: "USNYC", destName: "Port of New York & New Jersey", country: "Singapore", corridorId: "COR-004" },
  { origCode: "MYPKG", origName: "Port Klang", destCode: "USSAV", destName: "Port of Savannah", country: "Malaysia", corridorId: "COR-004" },
  // COR-005 Transatlantic North (North Europe -> US East Coast)
  { origCode: "NLRTM", origName: "Port of Rotterdam", destCode: "USNYC", destName: "Port of New York & New Jersey", country: "Netherlands", corridorId: "COR-005" },
  { origCode: "DEHAM", origName: "Port of Hamburg", destCode: "USNYC", destName: "Port of New York & New Jersey", country: "Germany", corridorId: "COR-005" },
  // COR-006 Intra-Asia Feeder (Vietnam / Thailand <-> Singapore)
  { origCode: "VNHPH", origName: "Hai Phong Port", destCode: "SGSIN", destName: "Port of Singapore", country: "Vietnam", corridorId: "COR-006" },
  { origCode: "THBKK", origName: "Bangkok Modern Terminal", destCode: "SGSIN", destName: "Port of Singapore", country: "Thailand", corridorId: "COR-006" },
];

function generateDate(index: number, total: number): string {
  // Strictly Q3 2024: July 1, 2024 to September 30, 2024 (91 days)
  const dayOffset = Math.floor((index / Math.max(1, total)) * 91);
  const baseUtcMs = Date.UTC(2024, 6, 1);
  const targetUtcMs = baseUtcMs + dayOffset * 86400000;
  return new Date(targetUtcMs).toISOString().split("T")[0];
}

function makeSha256(index: number): string {
  let s = (index * 2654435761).toString(16);
  while (s.length < 64) {
    s += ((index + s.length) * 1103515245).toString(16);
  }
  return s.substring(0, 64);
}

export function generateMockShipments(): MockShipment[] {
  const shipments: MockShipment[] = [];
  const TOTAL_TARGET = 600;

  // Exact corridor distribution quota summing strictly to 600
  // COR-001: 210, COR-002: 110, COR-003: 120, COR-004: 60, COR-005: 60, COR-006: 40 = 600
  const CORRIDOR_QUOTAS: Record<string, number> = {
    "COR-001": 210,
    "COR-002": 110,
    "COR-003": 120,
    "COR-004": 60,
    "COR-005": 60,
    "COR-006": 40,
  };

  const corridorAssignedCount: Record<string, number> = {
    "COR-001": 0,
    "COR-002": 0,
    "COR-003": 0,
    "COR-004": 0,
    "COR-005": 0,
    "COR-006": 0,
  };

  let globalShipmentIndex = 1;

  // 1. First generate NRG-001 (Northwind Retail Group) shipments: exactly 150 shipments
  const nrg = MOCK_COMPANIES.find((c) => c.id === "nrg-001") || MOCK_COMPANIES[0];
  const nrgRoutes = PORT_ROUTES.filter((r) => r.corridorId === "COR-001");

  for (let i = 0; i < 150; i++) {
    const idx = globalShipmentIndex++;
    const isMatched = i < 124; // 124 matched, 26 in review
    const tier = isMatched ? (i % 6 === 0 ? "MEDIUM" : "HIGH") : "LOW";
    const score = tier === "HIGH" ? 0.92 + rng() * 0.06 : tier === "MEDIUM" ? 0.72 + rng() * 0.1 : 0.48 + rng() * 0.14;

    const route = nrgRoutes[i % nrgRoutes.length];
    corridorAssignedCount["COR-001"]++;

    const dateStr = generateDate(i, 150);
    const bol = `NWRE-${dateStr.replace(/-/g, "").substring(2)}-${String(idx).padStart(5, "0")}`;
    const carrier = CARRIERS[idx % CARRIERS.length];
    const vessel = VESSELS[idx % VESSELS.length];
    const isMaskedValue = idx % 6 === 0;
    const weight = 12000 + Math.floor(rng() * 18000);
    const value = isMaskedValue ? null : Math.round(weight * (8.5 + rng() * 14));
    const teu = weight > 20000 ? 2 : 1;

    const rawConsignee = nrg.aliasCluster[i % nrg.aliasCluster.length];
    const shipper = nrg.topShippers[i % nrg.topShippers.length];

    const fields: MockFieldValue[] = [
      { fieldName: "consignee_name", label: "Consignee / Importer", rawValue: rawConsignee, normalizedValue: nrg.canonicalName, derivedValue: `${nrg.canonicalName} (${nrg.jurisdiction})`, missingness: null },
      { fieldName: "shipper_name", label: "Shipper / Exporter", rawValue: shipper, normalizedValue: shipper.replace(/ \(.*\)/, ""), derivedValue: shipper, missingness: null },
      { fieldName: "hs_code", label: "HS Tariff Classification", rawValue: "8528.52", normalizedValue: "852852", derivedValue: nrg.hsDescription, missingness: null },
      { fieldName: "origin_port", label: "Port of Loading (POL)", rawValue: route.origName.toUpperCase(), normalizedValue: route.origCode, derivedValue: `${route.origName}, ${route.country}`, missingness: null },
      { fieldName: "destination_port", label: "Port of Discharge (POD)", rawValue: route.destName.toUpperCase(), normalizedValue: route.destCode, derivedValue: `${route.destName}, United States`, missingness: null },
      { fieldName: "declared_value_usd", label: "Customs Declared Value", rawValue: isMaskedValue ? null : `$${value?.toLocaleString("en-US")}`, normalizedValue: isMaskedValue ? null : String(value), derivedValue: isMaskedValue ? null : `$${value?.toLocaleString("en-US")} USD`, missingness: isMaskedValue ? { reason: "MASKED", description: "Carrier or importer requested statutory confidentiality" } : null },
      { fieldName: "notify_party", label: "Notify Party", rawValue: idx % 4 === 0 ? null : `${nrg.canonicalName} LOGISTICS DEPT`, normalizedValue: idx % 4 === 0 ? null : nrg.canonicalName, derivedValue: null, missingness: idx % 4 === 0 ? { reason: "UNAVAILABLE_AT_SOURCE", description: "Optional manifest field omitted by filing carrier" } : null },
    ];

    shipments.push({
      id: `shp-${String(idx).padStart(5, "0")}`,
      bolNumber: bol,
      companyId: nrg.id,
      corridorId: "COR-001",
      consigneeName: nrg.canonicalName,
      shipperName: shipper,
      originCountry: route.country,
      originPortCode: route.origCode,
      originPortName: route.origName,
      destCountry: route.corridorId === "COR-006" ? "Singapore" : "United States",
      destPortCode: route.destCode,
      destPortName: route.destName,
      filingDate: dateStr,
      hsCode: nrg.primaryHsCode,
      hsDescription: nrg.hsDescription,
      declaredValueUsd: value,
      declaredWeightKg: weight,
      teu,
      carrierName: carrier,
      vesselName: vessel,
      confidenceTier: tier,
      confidenceScore: Math.round(score * 1000) / 1000,
      provenance: {
        sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
        sourceJurisdiction: "US Public Customs Record",
        sourceChannel: "Automated Commercial Environment (ACE) Electronic Manifest",
        licenseReference: "Illustrative rights note — pending counsel review",
        rawRecordChecksumSha256: makeSha256(idx),
        sourceTimestamp: `${dateStr}T14:32:00Z`,
        ingestionTimestamp: "2024-09-30T04:12:08Z",
        normalizationTimestamp: "2024-09-30T04:13:42Z",
        modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
        modelVersion: "probabilistic_matcher_v1.2_fs",
        uncertaintyRationale: tier === "HIGH" ? "High token alignment across normalized consignee name cluster." : tier === "MEDIUM" ? "Partial token match in review band [0.65, 0.85]." : "Ambiguous entity resolution with multiple candidate clusters.",
        fields,
      },
      isMock: true,
    });
  }

  // 2. Generate remaining 450 shipments to reach exactly 600 total
  // Cycle through remaining companies and honor corridor quotas strictly
  const otherCompanies = MOCK_COMPANIES.filter((c) => c.id !== "nrg-001");
  const corridorKeys = Object.keys(CORRIDOR_QUOTAS);

  while (shipments.length < TOTAL_TARGET) {
    const idx = globalShipmentIndex++;
    const company = otherCompanies[(idx - 151) % otherCompanies.length];

    // Find a corridor that still needs shipments
    let targetCorridorId = "COR-001";
    for (const cId of corridorKeys) {
      if (corridorAssignedCount[cId] < CORRIDOR_QUOTAS[cId]) {
        targetCorridorId = cId;
        break;
      }
    }
    corridorAssignedCount[targetCorridorId]++;

    const availableRoutes = PORT_ROUTES.filter((r) => r.corridorId === targetCorridorId);
    const route = availableRoutes[idx % availableRoutes.length];

    // Maintain global target of 542 matched and 58 in review
    // Current matched count in NRG: 124 matched, 26 review
    // Needed: 542 - 124 = 418 matched, 58 - 26 = 32 in review
    const remainingToGenerate = TOTAL_TARGET - shipments.length;
    const currentReviewCount = shipments.filter((s) => s.confidenceTier === "LOW").length;
    const remainingReviewNeeded = 58 - currentReviewCount;

    const isReview = remainingReviewNeeded > 0 && (remainingReviewNeeded >= remainingToGenerate || rng() < remainingReviewNeeded / remainingToGenerate);
    const tier = isReview ? "LOW" : idx % 7 === 0 ? "MEDIUM" : "HIGH";
    const score = tier === "HIGH" ? 0.91 + rng() * 0.07 : tier === "MEDIUM" ? 0.73 + rng() * 0.1 : 0.49 + rng() * 0.14;

    const dateStr = generateDate(idx, TOTAL_TARGET);
    const prefix = company.canonicalName.substring(0, 4).replace(/[^A-Z]/g, "X");
    const bol = `${prefix}-${dateStr.replace(/-/g, "").substring(2)}-${String(idx).padStart(5, "0")}`;
    const carrier = CARRIERS[idx % CARRIERS.length];
    const vessel = VESSELS[idx % VESSELS.length];
    const isMaskedValue = idx % 6 === 0;
    const weight = 11000 + Math.floor(rng() * 19000);
    const value = isMaskedValue ? null : Math.round(weight * (8.0 + rng() * 13));
    const teu = weight > 20000 ? 2 : 1;

    const rawConsignee = company.aliasCluster[idx % company.aliasCluster.length];
    const shipper = company.topShippers[idx % company.topShippers.length];

    const fields: MockFieldValue[] = [
      { fieldName: "consignee_name", label: "Consignee / Importer", rawValue: rawConsignee, normalizedValue: company.canonicalName, derivedValue: `${company.canonicalName} (${company.jurisdiction})`, missingness: null },
      { fieldName: "shipper_name", label: "Shipper / Exporter", rawValue: shipper, normalizedValue: shipper.replace(/ \(.*\)/, ""), derivedValue: shipper, missingness: null },
      { fieldName: "hs_code", label: "HS Tariff Classification", rawValue: `${company.primaryHsCode.substring(0, 4)}.${company.primaryHsCode.substring(4)}`, normalizedValue: company.primaryHsCode, derivedValue: company.hsDescription, missingness: null },
      { fieldName: "origin_port", label: "Port of Loading (POL)", rawValue: route.origName.toUpperCase(), normalizedValue: route.origCode, derivedValue: `${route.origName}, ${route.country}`, missingness: null },
      { fieldName: "destination_port", label: "Port of Discharge (POD)", rawValue: route.destName.toUpperCase(), normalizedValue: route.destCode, derivedValue: `${route.destName}, United States`, missingness: null },
      { fieldName: "declared_value_usd", label: "Customs Declared Value", rawValue: isMaskedValue ? null : `$${value?.toLocaleString("en-US")}`, normalizedValue: isMaskedValue ? null : String(value), derivedValue: isMaskedValue ? null : `$${value?.toLocaleString("en-US")} USD`, missingness: isMaskedValue ? { reason: "MASKED", description: "Carrier or importer requested statutory confidentiality" } : null },
      { fieldName: "notify_party", label: "Notify Party", rawValue: idx % 4 === 0 ? null : `${company.canonicalName} LOGISTICS DEPT`, normalizedValue: idx % 4 === 0 ? null : company.canonicalName, derivedValue: null, missingness: idx % 4 === 0 ? { reason: "UNAVAILABLE_AT_SOURCE", description: "Optional manifest field omitted by filing carrier" } : null },
    ];

    shipments.push({
      id: `shp-${String(idx).padStart(5, "0")}`,
      bolNumber: bol,
      companyId: company.id,
      corridorId: targetCorridorId,
      consigneeName: company.canonicalName,
      shipperName: shipper,
      originCountry: route.country,
      originPortCode: route.origCode,
      originPortName: route.origName,
      destCountry: route.corridorId === "COR-006" ? "Singapore" : "United States",
      destPortCode: route.destCode,
      destPortName: route.destName,
      filingDate: dateStr,
      hsCode: company.primaryHsCode,
      hsDescription: company.hsDescription,
      declaredValueUsd: value,
      declaredWeightKg: weight,
      teu,
      carrierName: carrier,
      vesselName: vessel,
      confidenceTier: tier,
      confidenceScore: Math.round(score * 1000) / 1000,
      provenance: {
        sourceDataset: "US Ocean Bill of Lading Manifest Illustrative Sample",
        sourceJurisdiction: "US Public Customs Record",
        sourceChannel: "Automated Commercial Environment (ACE) Electronic Manifest",
        licenseReference: "Illustrative rights note — pending counsel review",
        rawRecordChecksumSha256: makeSha256(idx),
        sourceTimestamp: `${dateStr}T14:32:00Z`,
        ingestionTimestamp: "2024-09-30T04:12:08Z",
        normalizationTimestamp: "2024-09-30T04:13:42Z",
        modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
        modelVersion: "probabilistic_matcher_v1.2_fs",
        uncertaintyRationale: tier === "HIGH" ? "High token alignment across normalized consignee name cluster." : tier === "MEDIUM" ? "Partial token match in review band [0.65, 0.85]." : "Ambiguous entity resolution with multiple candidate clusters.",
        fields,
      },
      isMock: true,
    });
  }

  return shipments;
}

export const MOCK_SHIPMENTS: MockShipment[] = generateMockShipments();
