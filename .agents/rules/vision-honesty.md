# Vision Honesty Rules (always-on)

1. ROUTE ISOLATION: all /vision/* code is separate. Never modify /, /search, /company/*, /review, or existing tests.
2. PERSISTENT BADGE: every /vision page must render the non-dismissible amber pill: "PRODUCT VISION PREVIEW — ILLUSTRATIVE MOCK DATA".
3. THREE-STATE CHIPS:
   - "Built" = live and clickable in the running app today
   - "Built (simplified today)" = live capability with known limitations (tooltip required)
   - "Backend built / UI planned" = engine exists in backend, frontend integration is mock
   - "Planned" = future roadmap work
4. FICTIONAL ENTITIES ONLY: invented names (Northwind Retail Group, Helix Components Ltd, Meridian Freight Co., etc.). No real companies, no real logos, no invented funding/revenue/customer counts.
5. NO FABRICATED SCALE CLAIMS: all figures inside the mock UI must be labeled "Illustrative". Never state Orchid coverage/record counts as fact.
6. DENOMINATOR RULE: every metric must show its denominator and timestamp classification. Never a bare percentage.
7. AI CITATION-ONLY: mock AI responses cite mock record IDs only. Banned words in any AI text: compliant, clean, low risk, safe (as claim), official, legitimate, guaranteed, verified (as claim), good investment.
8. SCREENSHOT EVIDENCE: only real Playwright/msedge captures. generate_image output is never evidence.
9. ILLUSTRATIVE PERIOD: uniform date range "Q3 2024 Illustrative Sample (July 1 – September 30, 2024)" across all /vision screens.
10. PROBABILISTIC MATCHER: the backend uses a custom Fellegi-Sunter-style probabilistic matcher (not the Splink library). Use the term "probabilistic matcher" in all /vision UI copy. Never call it "Splink" in UI.
