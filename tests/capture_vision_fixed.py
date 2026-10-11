import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

OUTPUT_DIR = Path(r"C:\Users\Sayyed Saifullah\.gemini\antigravity\brain\0efbd825-e962-49fc-9353-a700feb47eb9\vision_screenshots")
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

ROUTES = [
    ("home", "http://localhost:3100/vision/home"),
    ("company", "http://localhost:3100/vision/company/comp-001"),
    ("search", "http://localhost:3100/vision/search"),
    ("workbench", "http://localhost:3100/vision/workbench"),
    ("quality", "http://localhost:3100/vision/quality"),
    ("lanes", "http://localhost:3100/vision/lanes"),
    ("network", "http://localhost:3100/vision/network"),
    ("alerts", "http://localhost:3100/vision/alerts"),
    ("ai", "http://localhost:3100/vision/ai"),
]

VIEWPORTS = [
    ("1920", 1920, 1080),
    ("1440", 1440, 900),
]

async def capture_all():
    results = {}
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        
        for name, url in ROUTES:
            results[name] = {"console_errors": [], "page_errors": [], "screenshots": []}
            for vp_name, width, height in VIEWPORTS:
                context = await browser.new_context(viewport={"width": width, "height": height})
                page = await context.new_page()
                
                # Listen for errors
                page.on("console", lambda msg: results[name]["console_errors"].append(f"[{msg.type}] {msg.text}") if msg.type in ["error", "warning"] else None)
                page.on("pageerror", lambda err: results[name]["page_errors"].append(str(err)))
                
                try:
                    await page.goto(url, wait_until="networkidle", timeout=15000)
                    await asyncio.sleep(1.0) # settle animations
                    
                    shot_path = OUTPUT_DIR / f"vision_{name}_{vp_name}_fixed.png"
                    # Capture VIEWPORT only (not full_page)
                    await page.screenshot(path=str(shot_path), full_page=False)
                    results[name]["screenshots"].append(str(shot_path))
                except Exception as e:
                    results[name]["page_errors"].append(f"Navigation/Capture error: {str(e)}")
                finally:
                    await context.close()
                    
        await browser.close()
        
    print("RESULTS_JSON_START")
    print(json.dumps(results, indent=2))
    print("RESULTS_JSON_END")

if __name__ == "__main__":
    asyncio.run(capture_all())
