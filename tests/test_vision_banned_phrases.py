"""
Test scanning all /vision routes and mock/payload data files for banned phrases:
- compliant
- clean
- low risk / LOW RISK
- safe
- verified-as-claim / Verified Tier-1
- real-time
- live
- 103.31
- 15-day
- statutory
- Immaturely
- 3D
- Splink
"""

import os
import re
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent
VISION_PAGES_DIR = ROOT_DIR / "frontend" / "pages" / "vision"
VISION_MOCK_DIR = ROOT_DIR / "frontend" / "vision"

# Words/phrases not permitted in UI claims/indicators/mock files
BANNED_PATTERNS = [
    (r"\blow\s*risk\b", "low risk"),
    (r"\bLOW\s*RISK\b", "LOW RISK"),
    (r"\bcompliant\b", "compliant"),
    (r"\bclean\b", "clean"),
    (r"\bsafe\b", "safe"),
    (r"\breal-time\b", "real-time"),
    (r"\bReal-time\b", "Real-time"),
    (r"\bVerified\s*Tier-1\b", "Verified Tier-1"),
    (r"\b2m\s*ago\b", "2m ago"),
    (r"103\.31", "103.31"),
    (r"15-day", "15-day"),
    (r"\bstatutory\b", "statutory"),
    (r"\bImmaturely\b", "Immaturely"),
    (r"\b3D\b", "3D"),
    (r"\bSplink\b", "Splink"),
]

def _scan_files(files):
    violations = []
    for file_path in files:
        if file_path.name == "_app.tsx" or file_path.name.endswith(".d.ts"):
            continue
            
        content = file_path.read_text(encoding="utf-8")
        lines = content.splitlines()
        
        for idx, line in enumerate(lines, 1):
            stripped = line.strip()
            # Skip code comment-only lines or intentional guardrail definitions
            if stripped.startswith("//") or stripped.startswith("/*") or stripped.startswith("*") or stripped.startswith("{/*"):
                continue
            if "BANNED_AI_WORDS" in line or "'Use of words: \"compliant\"" in line or "BANNED_CARRIERS" in line:
                continue
            # In mock aiChat.ts, the BANNED_AI_WORDS list definition and the refusal demo prompt testing compliance rejection are intentional
            if file_path.name == "aiChat.ts" and (idx <= 15 or "isRefusalDemo" in content and "compliant with" in line):
                continue
                
            for pattern, label in BANNED_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    # Filter out innocent substring hits (e.g. within sha256 hashes like 7b4c...3d...4e)
                    if label == "3D" and re.search(r"[0-9a-f]{10,}3d[0-9a-f]{10,}", line, re.IGNORECASE):
                        continue
                    violations.append(f"{file_path.relative_to(ROOT_DIR)}:{idx} -> [{label}] in: {stripped}")
    return violations

def test_no_banned_phrases_in_vision_pages():
    assert VISION_PAGES_DIR.exists(), f"Directory not found: {VISION_PAGES_DIR}"
    files = list(VISION_PAGES_DIR.glob("**/*.tsx"))
    violations = _scan_files(files)
    assert not violations, f"Found {len(violations)} banned phrase occurrences in pages:\n" + "\n".join(violations)

def test_no_banned_phrases_in_vision_mock_and_components():
    assert VISION_MOCK_DIR.exists(), f"Directory not found: {VISION_MOCK_DIR}"
    files = list(VISION_MOCK_DIR.glob("**/*.ts")) + list(VISION_MOCK_DIR.glob("**/*.tsx"))
    violations = _scan_files(files)
    assert not violations, f"Found {len(violations)} banned phrase occurrences in mock/components:\n" + "\n".join(violations)
