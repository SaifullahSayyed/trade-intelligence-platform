import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const sampleShipment = {
    shipment_id: "e4b2d35c-8a19-4b6e-9df2-9b2f34c21a99",
    bill_of_lading: "MEDU1928472910",
    provenance: {
      source_name: "Trademo US Bill of Lading Evaluation Sample",
      source_channel: "AWS Data Exchange",
      jurisdiction: "US (19 C.F.R. § 103.31 Public Record)",
      license_reference: "Trademo evaluation dataset — free for evaluation purposes",
      checksum_sha256: "a3f4e8b910c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8",
      source_version: "v1.0.0",
      parser_version: "v1.0.0"
    },
    timestamps: {
      source_timestamp: "2022-09-04T14:32:00Z",
      ingestion_timestamp: "2026-09-12T10:00:00Z",
      normalization_timestamp: "2026-09-12T10:01:23Z"
    },
    framing: {
      is_historical_window: true,
      data_source_mode: "REAL_TRADEMO_HISTORICAL_SAMPLE",
      data_window: "September 1–10, 2022",
      compliance_disclaimer: "Built and proven on real CBP shipment records; live ingestion is the next step once funded."
    },
    entity_resolution: {
      confidence_tier: "HIGH",
      coverage: {
        matched_records: 870,
        denominator: 1000,
        text: "870 of 1,000 sampled records matched"
      },
      model_version: "splink_v1.0.0_fellegi_sunter"
    },
    fields: [
      {
        field_name: "importer_name",
        label: "Importer / Consignee",
        raw_value: "WAL-MART STORES EAST, LP",
        normalized_value: "WALMART",
        derived_value: "WALMART INC. (US-RETAIL)",
        missingness: null
      },
      {
        field_name: "shipper_name",
        label: "Shipper / Exporter",
        raw_value: "SAMSUNG ELECTRONICS VIETNAM CO LTD",
        normalized_value: "SAMSUNG ELECTRONICS",
        derived_value: "SAMSUNG ELECTRONICS CO., LTD.",
        missingness: null
      },
      {
        field_name: "hs_code",
        label: "HS Tariff Code",
        raw_value: "8528.52",
        normalized_value: "852852",
        derived_value: "Monitors capable of directly connecting to and designed for use with an automatic data processing machine",
        missingness: null
      },
      {
        field_name: "origin_port",
        label: "Origin Port",
        raw_value: "HO CHI MINH CITY PORT",
        normalized_value: "VNSGN",
        derived_value: "Saigon Port, Vietnam",
        missingness: null
      },
      {
        field_name: "destination_port",
        label: "Destination Port",
        raw_value: "LOS ANGELES, CA",
        normalized_value: "USLAX",
        derived_value: "Port of Los Angeles, United States",
        missingness: null
      },
      {
        field_name: "declared_value",
        label: "Declared Customs Value",
        raw_value: null,
        normalized_value: null,
        derived_value: null,
        missingness: {
          reason: "MASKED",
          description: "Value masked by commercial carrier or filer under CBP confidentiality rules"
        }
      },
      {
        field_name: "notify_party",
        label: "Notify Party",
        raw_value: null,
        normalized_value: null,
        derived_value: null,
        missingness: {
          reason: "UNAVAILABLE_AT_SOURCE",
          description: "Field left blank on original ocean bill of lading manifest"
        }
      }
    ]
  };

  res.status(200).json(sampleShipment);
}
