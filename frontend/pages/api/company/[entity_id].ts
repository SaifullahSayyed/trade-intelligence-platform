import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { entity_id } = req.query;

  const response = {
    entity_id: entity_id || "e4b2d35c-8a19-4b6e-9df2-9b2f34c21a99",
    canonical_name: "WALMART INC.",
    entity_type: "COMPANY",
    jurisdiction: "US",
    confidence_tier: "HIGH",
    resolution_metrics: {
      matched_variants: [
        "Walmart Inc.",
        "WAL-MART STORES, INC.",
        "Walmart",
        "WALMART STORES EAST LP"
      ],
      splink_score: 0.9850,
      model_version: "splink_v1.0.0_fellegi_sunter"
    },
    framing: {
      is_historical_window: false,
      data_source_mode: "SYNTHETIC_MOCK_PENDING_REAL_DATA",
      compliance_disclaimer: "Synthetic test data used to validate entity-matching logic only -- not derived from any real shipment records."
    },
    ai_explanation: {
      explanation_text: "Bill of Lading MEDU1928472910 records an ocean shipment arrived on 2022-09-04. Consignee WALMART INC. received cargo described as 'Flat panel computer monitors and display processing units' under HS Tariff 852852 from shipper SAMSUNG ELECTRONICS VIETNAM CO LTD. The transit corridor was routed from Ho Chi Minh City Port (VNSGN) to Port of Los Angeles (USLAX). Entity resolution resolved the consignee with HIGH confidence based on normalized legal name matching.",
      safety_status: "VERIFIED_COMPLIANT",
      citations: [
        { field: "BOL", value: "MEDU1928472910" },
        { field: "Consignee", value: "WALMART INC." },
        { field: "Shipper", value: "SAMSUNG ELECTRONICS VIETNAM CO LTD" },
        { field: "HS Code", value: "852852" }
      ]
    },
    shipments: [
      {
        bol: "MEDU1928472910",
        date: "2022-09-04",
        origin: "Vietnam (VNSGN)",
        port: "Port of Los Angeles (USLAX)",
        shipper: "SAMSUNG ELECTRONICS VIETNAM CO LTD",
        product: "Flat panel computer monitors and display processing units",
        hs_code: "852852",
        weight: "24,850 KG"
      }
    ]
  };

  res.status(200).json(response);
}
