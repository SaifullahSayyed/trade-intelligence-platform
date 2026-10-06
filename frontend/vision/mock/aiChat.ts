import { MockAiExchange } from "./types";

export const BANNED_AI_WORDS = [
  "compliant",
  "clean",
  "low risk",
  "safe",
  "verified",
  "official",
  "legitimate",
  "guaranteed",
  "good investment",
  "no risk",
];

export function validateAiText(text: string): string[] {
  const lower = text.toLowerCase();
  const violations: string[] = [];
  for (const word of BANNED_AI_WORDS) {
    // Check whole word or phrase boundary
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(lower)) {
      violations.push(word);
    }
  }
  return violations;
}

export const MOCK_AI_EXCHANGES: MockAiExchange[] = [
  {
    id: "ai-001",
    userPrompt: "Summarize Northwind Retail Group's primary import suppliers and routes in Q3 2024.",
    aiResponse:
      "According to manifest filings in the Q3 2024 sample, Northwind Retail Group (NRG-001) received 124 matched shipments across 3 primary overseas suppliers. The dominant trade corridor is Trans-Pacific South from Saigon Port (VNSGN) to Port of Los Angeles (USLAX), accounting for 68% of total inbound volume. Primary cargo is categorized under HS 852852 (flat panel display units) from supplier Helix Components Ltd.",
    citations: [
      { id: "cit-1", type: "ENTITY", label: "NRG-001 (Northwind Retail Group)", targetId: "nrg-001" },
      { id: "cit-2", type: "BOL", label: "BOL NWRE-240904-00012", targetId: "shp-00012" },
      { id: "cit-3", type: "ENTITY", label: "HLX-002 (Helix Components Ltd)", targetId: "hlx-002" },
      { id: "cit-4", type: "FIELD", label: "HS Tariff 852852", targetId: "hs-852852" },
    ],
    whatCouldNotVerify:
      "Declared customs valuation is masked on 24 of 124 bills of lading under 19 C.F.R. § 103.31 confidentiality exemptions. Additionally, 26 candidate pairs remain in human review and are excluded from these totals.",
    isMock: true,
  },
  {
    id: "ai-002",
    userPrompt: "Is Northwind Retail Group compliant with US import regulations and trade sanctions?",
    aiResponse:
      "I cannot provide a compliance assessment or regulatory status determination. Evaluating trade compliance requires legal counsel review of jurisdiction-specific regulations, licensing regimes, and corporate ownership registries. I can provide the factual filing history, declared HS codes, and documented port timestamps for this entity.",
    citations: [
      { id: "cit-5", type: "ENTITY", label: "NRG-001 (Factual Manifest Filing History)", targetId: "nrg-001" },
    ],
    whatCouldNotVerify:
      "Manifest data records declared commercial carrier filings only. It does not certify beneficial corporate ownership, customs payment clearance, or regulatory compliance.",
    isRefusalDemo: true,
    refusalReason: "REQUEST_REFUSED: Compliance determinations require legal counsel review.",
    suggestedAllowedPrompt: "Show me Northwind Retail Group's shipment volumes and HS tariff breakdown for the last 12 months.",
    isMock: true,
  },
  {
    id: "ai-003",
    userPrompt: "What driving signals led the probabilistic matcher to link Northwind Retail Group LLC to Northwind Direct US?",
    aiResponse:
      "The probabilistic matcher evaluated candidate pair REV-2024-001 against Fellegi-Sunter weight parameters. The primary driving signals were: (1) Jaro-Winkler token similarity of 0.892 on normalized base name tokens, (2) exact Soundex phonetic equality on the primary token 'NORTHWIND' (N635), and (3) identical commercial delivery address at 1400 Pacific Avenue, Long Beach, CA. The composite score of 0.784 places the pair in the human review band [0.65, 0.85] due to differing legal corporate suffixes.",
    citations: [
      { id: "cit-6", type: "RECORD", label: "Review Pair REV-2024-001", targetId: "REV-2024-001" },
      { id: "cit-7", type: "FIELD", label: "Address Line: 1400 Pacific Ave", targetId: "addr-longbeach" },
    ],
    whatCouldNotVerify:
      "Whether Northwind Direct US is an operating division or an independent legally incorporated subsidiary has not been corroborated against state corporation registry filings.",
    isMock: true,
  },
];
