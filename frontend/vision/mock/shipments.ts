import { MockShipment, MockFieldValue } from "./types";
import { MOCK_COMPANIES } from "./companies";
import { mulberry32 } from "./seed";

const rng = mulberry32(847291);

const CARRIERS = [
  "PACIFIC STAR MARITIME", "MAJESTIC OCEAN LINES", "MERIDIAN SEA TRANSPORT",
  "ATLANTIC HORIZON SHIPPING", "NORDIC CONTAINER FEEDER", "GLOBEX MARITIME LOGISTICS",
];

const VESSELS = [
  "PACIFIC FORTUNE V.042W", "MERIDIAN TRADER V.118E", "NORTHWIND LEADER V.094",
  "SOLARIS HARVEST V.212", "ZEPHYR BREEZE V.014", "TITAN CARRIER V.308",
];

const PORTS = [
  { origCode: "VNSGN", origName: "Saigon Port", destCode: "USLAX", destName: "Port of Los Angeles", country: "Vietnam" },
  { origCode: "VNHPH", origName: "Hai Phong Port", destCode: "USLGB", destName: "Port of Long Beach", country: "Vietnam" },
  { origCode: "HKHKG", origName: "Port of Hong Kong", destCode: "USLAX", destName: "Port of Los Angeles", country: "Hong Kong" },
  { origCode: "KRPUS", origName: "Busan Port", destCode: "USSEA", destName: "Port of Seattle", country: "South Korea" },
  { origCode: "SGSIN", origName: "Port of Singapore", destCode: "USNYC", destName: "Port of New York & New Jersey", country: "Singapore" },
  { origCode: "NLRTM", origName: "Port of Rotterdam", destCode: "USNYC", destName: "Port of New York & New Jersey", country: "Netherlands" },
];

function generateDate(index: number, total: number): string {
  // Evenly distribute between 2024-07-01 and 2024-09-30 (92 days of Q3 2024)
  const dayOffset = Math.floor((index / total) * 91);
  const baseDate = new Date(2024, 6, 1); // July 1, 2024
  baseDate.setDate(baseDate.getDate() + dayOffset);
  return baseDate.toISOString().split("T")[0];
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
  let shipmentGlobalIndex = 1;

  for (const company of MOCK_COMPANIES) {
    const count = company.totalShipments;

    for (let i = 0; i < count; i++) {
      const idx = shipmentGlobalIndex++;
      const isMatched = i < company.matchedShipments;
      const tier = isMatched ? (i % 5 === 0 ? "MEDIUM" : "HIGH") : "LOW";
      const score = tier === "HIGH" ? 0.92 + (rng() * 0.07) : tier === "MEDIUM" ? 0.72 + (rng() * 0.12) : 0.48 + (rng() * 0.15);

      const portPair = PORTS[idx % PORTS.length];
      const dateStr = generateDate(i, count);
      const bol = `NWRE-${dateStr.replace(/-/g, "").substring(2)}-${String(idx).padStart(5, "0")}`;
      const carrier = CARRIERS[idx % CARRIERS.length];
      const vessel = VESSELS[idx % VESSELS.length];
      const isMaskedValue = idx % 6 === 0; // ~16% masked declared value
      const weight = 12000 + Math.floor(rng() * 18000);
      const value = isMaskedValue ? null : Math.round(weight * (8.5 + rng() * 14));
      const teu = weight > 20000 ? 2 : 1;

      const rawConsignee = company.aliasCluster[i % company.aliasCluster.length];
      const shipper = company.topShippers[i % company.topShippers.length];

      const fields: MockFieldValue[] = [
        {
          fieldName: "consignee_name",
          label: "Consignee / Importer",
          rawValue: rawConsignee,
          normalizedValue: company.canonicalName,
          derivedValue: `${company.canonicalName} (${company.jurisdiction})`,
          missingness: null,
        },
        {
          fieldName: "shipper_name",
          label: "Shipper / Exporter",
          rawValue: shipper,
          normalizedValue: shipper.replace(/ \(.*\)/, ""),
          derivedValue: shipper,
          missingness: null,
        },
        {
          fieldName: "hs_code",
          label: "HS Tariff Classification",
          rawValue: `${company.primaryHsCode.substring(0, 4)}.${company.primaryHsCode.substring(4)}`,
          normalizedValue: company.primaryHsCode,
          derivedValue: company.hsDescription,
          missingness: null,
        },
        {
          fieldName: "origin_port",
          label: "Port of Loading (POL)",
          rawValue: portPair.origName.toUpperCase(),
          normalizedValue: portPair.origCode,
          derivedValue: `${portPair.origName}, ${portPair.country}`,
          missingness: null,
        },
        {
          fieldName: "destination_port",
          label: "Port of Discharge (POD)",
          rawValue: portPair.destName.toUpperCase(),
          normalizedValue: portPair.destCode,
          derivedValue: `${portPair.destName}, United States`,
          missingness: null,
        },
        {
          fieldName: "declared_value_usd",
          label: "Customs Declared Value",
          rawValue: isMaskedValue ? null : `$${value?.toLocaleString("en-US")}`,
          normalizedValue: isMaskedValue ? null : String(value),
          derivedValue: isMaskedValue ? null : `$${value?.toLocaleString("en-US")} USD`,
          missingness: isMaskedValue
            ? {
                reason: "MASKED",
                description: "Carrier or importer requested confidentiality under 19 C.F.R. § 103.31(d)",
              }
            : null,
        },
        {
          fieldName: "notify_party",
          label: "Notify Party",
          rawValue: idx % 4 === 0 ? null : `${company.canonicalName} LOGISTICS DEPT`,
          normalizedValue: idx % 4 === 0 ? null : company.canonicalName,
          derivedValue: null,
          missingness: idx % 4 === 0
            ? {
                reason: "UNAVAILABLE_AT_SOURCE",
                description: "Optional manifest field omitted by filing carrier",
              }
            : null,
        },
      ];

      shipments.push({
        id: `shp-${String(idx).padStart(5, "0")}`,
        bolNumber: bol,
        companyId: company.id,
        consigneeName: company.canonicalName,
        shipperName: shipper,
        originCountry: portPair.country,
        originPortCode: portPair.origCode,
        originPortName: portPair.origName,
        destCountry: "United States",
        destPortCode: portPair.destCode,
        destPortName: portPair.destName,
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
          sourceJurisdiction: "US (19 C.F.R. § 103.31 Public Record)",
          sourceChannel: "Automated Commercial Environment (ACE) Electronic Manifest",
          licenseReference: "Public domain government record under 19 C.F.R. § 103.31",
          rawRecordChecksumSha256: makeSha256(idx),
          sourceTimestamp: `${dateStr}T14:32:00Z`,
          ingestionTimestamp: "2024-10-01T04:12:08Z",
          normalizationTimestamp: "2024-10-01T04:13:42Z",
          modelEngine: "Probabilistic Matcher (Fellegi-Sunter)",
          modelVersion: "probabilistic_matcher_v1.2_fs",
          uncertaintyRationale:
            tier === "HIGH"
              ? "High token alignment across normalized consignee name and historical filing address cluster."
              : tier === "MEDIUM"
              ? "Partial token match in human review band [0.65, 0.85]. Address matches; corporate entity suffix differs."
              : "Ambiguous entity resolution. Low phonetic score; multiple candidate clusters present.",
          fields,
        },
        isMock: true,
      });

      if (shipments.length >= 600) break;
    }
    if (shipments.length >= 600) break;
  }

  return shipments;
}

export const MOCK_SHIPMENTS: MockShipment[] = generateMockShipments();
