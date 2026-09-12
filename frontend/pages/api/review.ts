import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  res.status(200).json({
    total: 2,
    queue: [
      {
        review_id: "66a95d43-f8d2-4ef7-9873-0fa375ca624a",
        entity_a_id: "b0000000-0000-0000-0000-000000000002",
        entity_b_id: "b0000000-0000-0000-0000-000000000004",
        raw_name_a: "SAMSUNG ELECTRONICS",
        raw_name_b: "SAMSUNG C&T CORP",
        splink_score: 0.7450,
        status: "PENDING",
        notes: "Ambiguous corporate entity pair: 'SAMSUNG ELECTRONICS' vs 'SAMSUNG C&T CORP'. Score 0.7450 in review band [0.65, 0.85]. Driving signals: partial_token_overlap_['SAMSUNG'], jaro_winkler_similarity_0.89."
      },
      {
        review_id: "4ea8702d-7975-4f12-88cf-955c08cab982",
        entity_a_id: "b0000000-0000-0000-0000-000000000001",
        entity_b_id: "b0000000-0000-0000-0000-000000000004",
        raw_name_a: "Samsung Electronics Co., Ltd.",
        raw_name_b: "SAMSUNG C&T CORP",
        splink_score: 0.7450,
        status: "PENDING",
        notes: "Ambiguous corporate entity pair: 'Samsung Electronics Co., Ltd.' vs 'SAMSUNG C&T CORP'. Score 0.7450 in review band [0.65, 0.85]. Driving signals: partial_token_overlap_['SAMSUNG'], jaro_winkler_similarity_0.89."
      }
    ],
    framing: {
      is_historical_window: false,
      data_source_mode: "SYNTHETIC_MOCK_PENDING_REAL_DATA",
      compliance_disclaimer: "Synthetic test data used to validate entity-matching logic only -- not derived from any real shipment records."
    }
  });
}
