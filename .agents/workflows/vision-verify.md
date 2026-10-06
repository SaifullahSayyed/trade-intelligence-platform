# /vision-verify workflow

Steps (run in order, stop on first failure):
1. cd frontend
2. NEXT_DIST_DIR=.next-vision npx next build  (never touches .next)
3. NEXT_DIST_DIR=.next-vision npx next start -p 3100
4. Run Playwright msedge captures for ALL /vision/* routes at 1920x1080 and 1440x900
5. DOM assertion: badge text "PRODUCT VISION PREVIEW — ILLUSTRATIVE MOCK DATA" present on every page
6. Console assertion: zero console.error() calls
7. Image assertion: zero broken images (all img src returns 200)
8. pytest tests/ -v  (must remain 63/63 or current passing count)
9. Verify live app still serves http://localhost:3000 correctly (GET / returns 200)
10. Write checkpoint report to brain/<id>/vision_checkpoint_<date>.md
