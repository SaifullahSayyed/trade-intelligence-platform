// TypeScript interfaces for Orchid Vision Preview Mock Module

export type ConfidenceTier = "HIGH" | "MEDIUM" | "LOW";

export type StatusChipType =
  | "built"
  | "built_simplified"
  | "backend_planned"
  | "planned";

export interface StatusChipMeta {
  type: StatusChipType;
  label: string;
  tooltip?: string;
}

export interface MockCompany {
  id: string;
  canonicalName: string;
  country: string;
  jurisdiction: string;
  confidenceTier: ConfidenceTier;
  confidenceScore: number; // e.g. 0.942
  aliasCluster: string[];
  aliasCount: number;
  totalShipments: number; // e.g. 150
  matchedShipments: number; // e.g. 124 of 150
  coverageDenominator: string; // "124 of 150 shipments matched"
  corridor: string;
  primaryHsCode: string;
  hsDescription: string;
  totalTeu: number;
  totalWeightKg: number;
  topShippers: string[];
  riskIndicators: {
    label: string;
    level: "LOW" | "ELEVATED" | "MONITOR";
    detail: string;
  }[];
  isMock: true;
}

export interface MockShipment {
  id: string;
  bolNumber: string;
  companyId: string;
  consigneeName: string;
  shipperName: string;
  originCountry: string;
  originPortCode: string;
  originPortName: string;
  destCountry: string;
  destPortCode: string;
  destPortName: string;
  filingDate: string; // YYYY-MM-DD in Q3 2024
  hsCode: string;
  hsDescription: string;
  declaredValueUsd: number | null; // may be masked
  declaredWeightKg: number;
  teu: number;
  carrierName: string;
  vesselName: string;
  confidenceTier: ConfidenceTier;
  confidenceScore: number;
  provenance: MockProvenance;
  isMock: true;
}

export interface MockProvenance {
  sourceDataset: string;
  sourceJurisdiction: string;
  sourceChannel: string;
  licenseReference: string;
  rawRecordChecksumSha256: string;
  sourceTimestamp: string;
  ingestionTimestamp: string;
  normalizationTimestamp: string;
  modelEngine: string; // "Probabilistic Matcher (Fellegi-Sunter)"
  modelVersion: string;
  uncertaintyRationale: string;
  fields: MockFieldValue[];
}

export interface MockFieldValue {
  fieldName: string;
  label: string;
  rawValue: string | null;
  normalizedValue: string | null;
  derivedValue: string | null;
  missingness: {
    reason: "MASKED" | "UNAVAILABLE_AT_SOURCE" | "NOT_REPORTED";
    description: string;
  } | null;
}

export interface MockTimeSeriesPoint {
  month: string; // e.g. "Oct 2023", "Nov 2023", ... "Sep 2024"
  monthIso: string;
  shipmentCount: number;
  shipmentCountDenominator: number;
  tradeValueUsd: number;
  confidenceMean: number;
  confidenceLow: number;
  confidenceHigh: number;
  isMock: true;
}

export interface MockPort {
  code: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  congestionLevel: "LOW" | "NORMAL" | "HIGH";
  q3VolumeTeu: number;
  isMock: true;
}

export interface MockCorridor {
  id: string;
  name: string;
  originRegion: string;
  destinationRegion: string;
  activeLanes: number;
  q3TotalShipments: number;
  avgTransitDays: number;
  primaryPorts: string[];
  isMock: true;
}

export interface MockReviewPair {
  reviewId: string;
  entityAId: string;
  entityBId: string;
  rawNameA: string;
  rawNameB: string;
  addressA: string;
  addressB: string;
  countryA: string;
  countryB: string;
  probabilisticScore: number; // e.g. 0.7620
  scoreBand: string; // "[0.65, 0.85] Human Verification Band"
  signals: {
    jaroWinkler: number;
    phoneticSoundexMatch: boolean;
    tokenOverlap: string[];
    addressMatch: boolean;
    hsTariffOverlap: boolean;
  };
  downstreamEntitiesAffected: number; // for false-merge guardrail
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "DEFERRED";
  notes: string;
  isMock: true;
}

export interface MockAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  immutableHash: string;
  isMock: true;
}

export interface MockAiCitation {
  id: string;
  type: "RECORD" | "BOL" | "ENTITY" | "FIELD";
  label: string;
  targetId: string;
}

export interface MockAiExchange {
  id: string;
  userPrompt: string;
  aiResponse: string;
  citations: MockAiCitation[];
  whatCouldNotVerify: string;
  isRefusalDemo?: boolean;
  refusalReason?: string;
  suggestedAllowedPrompt?: string;
  isMock: true;
}

// Payload passed when clicking any metric to open the Evidence Drawer
export interface ProvenanceDrawerPayload {
  claimLabel: string;
  claimValue: string | number;
  calculationFormula: string;
  contributingRecordsCount: number;
  contributingRecordsDenominator: number;
  sourceDataset: string;
  sourceJurisdiction: string;
  licenseNote: string;
  transformationPipeline: string;
  modelEngine: string;
  modelVersion: string;
  uncertaintyRationale: string;
  underlyingRecords: {
    id: string;
    bol: string;
    date: string;
    consignee: string;
    shipper: string;
    value: string;
    confidence: ConfidenceTier;
  }[];
  fieldComparison: MockFieldValue[];
  isMock: true;
}
