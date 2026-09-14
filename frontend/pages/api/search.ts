import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  const allItems = [
    {
      id: "e4b2d35c-8a19-4b6e-9df2-9b2f34c21a99",
      bol: "MEDU1928472910",
      consignee: "WALMART INC.",
      shipper: "SAMSUNG ELECTRONICS VIETNAM CO LTD",
      hs_code: "852852",
      product: "Flat panel computer monitors and display processing units",
      origin: "Vietnam (VNSGN)",
      port: "Port of Los Angeles (USLAX)",
      date: "2022-09-04",
      confidence: "HIGH",
      weight: "24,850 KG",
      coverage: "10 of 18 pairs matched"
    },
    {
      id: "f8a1c42b-5e33-4a11-8c90-1a7b82d49c01",
      bol: "MAEU9482710384",
      consignee: "TARGET BRANDS, INC.",
      shipper: "YUE YUEN INDUSTRIAL HOLDINGS",
      hs_code: "640299",
      product: "Footwear with outer soles of rubber or plastics",
      origin: "Vietnam (VNHPH)",
      port: "Port of Long Beach (USLGB)",
      date: "2022-09-06",
      confidence: "HIGH",
      weight: "18,400 KG",
      coverage: "920 of 1,000 matched"
    },
    {
      id: "c2d9e8f1-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
      bol: "COSU6291048291",
      consignee: "SAMSUNG ELECTRONICS AMERICA",
      shipper: "SAMSUNG C&T CORP",
      hs_code: "847130",
      product: "Data processing machines and portable laptops",
      origin: "South Korea (KRPUS)",
      port: "Port of Seattle (USSEA)",
      date: "2022-09-08",
      confidence: "MEDIUM",
      weight: "12,300 KG",
      coverage: "740 of 1,000 matched"
    }
  ];

  let filtered = allItems;
  if (q && typeof q === "string" && q.trim() !== "") {
    const term = q.toLowerCase();
    filtered = allItems.filter(item => 
      item.consignee.toLowerCase().includes(term) ||
      item.shipper.toLowerCase().includes(term) ||
      item.bol.toLowerCase().includes(term) ||
      item.product.toLowerCase().includes(term)
    );
  }

  res.status(200).json({
    query: q || "",
    total: filtered.length,
    results: filtered,
    framing: {
      is_historical_window: false,
      data_source_mode: "SYNTHETIC_MOCK_PENDING_REAL_DATA",
      compliance_disclaimer: "Synthetic test data used to validate entity-matching logic only -- not derived from any real shipment records."
    }
  });
}
