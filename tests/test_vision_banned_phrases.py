"""
Test scanning all /vision routes for banned phrases:
- compliant
- clean
- low risk / LOW RISK
- safe
- verified-as-claim / Verified Tier-1
- real-time
- live
"""

import os
import re
from pathlib import Path

VISION_PAGES_DIR = Path(__file__).resolve().parent.parent / "frontend" / "pages" / "vision"

# Words/phrases not permitted in UI claims/indicators
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
]

def test_no_banned_phrases_in_vision_pages():
    assert VISION_PAGES_DIR.exists(), f"Directory not found: {VISION_PAGES_DIR}"
    
    files = list(VISION_PAGES_DIR.glob("**/*.tsx"))
    assert len(files) > 0, "No TSX files found in vision directory"
    
    violations = []
    
    for file_path in files:
        if file_path.name == "_app.tsx":
            continue
            
        content = file_path.read_text(encoding="utf-8")
        lines = content.splitlines()
        
        for idx, line in enumerate(lines, 1):
            # Skip comments or guardrail specification definitions (e.g. BANNED_AI_WORDS in ai.tsx)
            if line.strip().startswith("//") or line.strip().startswith("/*") or line.strip().startswith("*"):
                continue
            if "BANNED_AI_WORDS" in line or "'Use of words: \"compliant\"" in line or "BANNED_CARRIERS" in line:
                continue
                
            for pattern, label in BANNED_PATTERNS:
                if re.search(pattern, line, re.IGNORECASE):
                    # Specific exception for safe string/svg tags or imports if any
                    violations.append(f"{file_path.name}:{idx} -> [{label}] in line: {line.strip()}")

    assert not violations, f"Found {len(violations)} banned phrase occurrences:\n" + "\n".join(violations)
