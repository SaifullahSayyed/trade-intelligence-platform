import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

OUTPUT_DIR = Path(r"C:\Users\Sayyed Saifullah\.gemini\antigravity\brain\0efbd825-e962-49fc-9353-a700feb47eb9\vision_screenshots")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Required screens for Round 2 proof: Home, Company, Network, Lanes, Alerts, AI at 1920x1080
ROUTES = [
    ("home", "http://localhost:3100/vision/home"),
    ("company", "http://localhost:3100/vision/company/nrg-001"),
    ("network", "http://localhost:3100/vision/network"),
    ("lanes", "http://localhost:3100/vision/lanes"),
    ("alerts", "http://localhost:3100/vision/alerts"),
    ("ai", "http://localhost:3100/vision/ai"),
]

VIEWPORT = {"width": 1920, "height": 1080}

async def capture_round2():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for name, url in ROUTES:
            results[name] = {"console_errors": [], "page_errors": [], "screenshot": ""}
            context = await browser.new_context(viewport=VIEWPORT)
            page = await context.new_page()
            
            # Listen for errors
            page.on("console", lambda msg: results[name]["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
            page.on("pageerror", lambda err: results[name]["page_errors"].append(str(err)))
            
            try:
                await page.goto(url, wait_until="networkidle", timeout=15000)
                await asyncio.sleep(1.0) # settle animations
                
                shot_path = OUTPUT_DIR / f"vision_{name}_1920_round2.png"
                # Viewport capture only (not full page)
                await page.screenshot(path=str(shot_path), full_page=False)
                results[name]["screenshot"] = str(shot_path)
            except Exception as e:
                results[name]["page_errors"].append(f"Navigation/Capture error: {str(e)}")
            finally:
                await context.close()
                
        await browser.close()
        
    print("ROUND2_RESULTS_JSON_START")
    print(json.dumps(results, indent=2))
    print("ROUND2_RESULTS_JSON_END")

if __name__ == "__main__":
    asyncio.run(capture_round2())
