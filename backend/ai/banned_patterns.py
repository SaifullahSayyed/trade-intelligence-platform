import re
from typing import List, Tuple, Optional

BANNED_PATTERNS = [
    r"\bcompliant\b",
    r"\bnot\s+sanctioned\b",
    r"\bnon-?sanctioned\b",
    r"\bfraudulent\b",
    r"\bfraud\b",
    r"\bclean\b(?:\s+(?:record|shipper|history|importer))?",
    r"\bsafe\b(?:\s+(?:counterparty|to\s+trade|trader|company))?",
    r"\bno\s+risk\b",
    r"\bzero\s+risk\b",
    r"\blow\s+risk\b",
    r"\brisk-?free\b",
    r"\bsmuggling\b",
    r"\bsmuggler\b",
    r"\bcontraband\b",
    r"\bmoney\s+laundering\b",
    r"\blaundered\b",
    r"\btax\s+evasion\b",
    r"\bduty\s+evasion\b",
    r"\bevading\s+customs\b",
    r"\bcartel\b",
    r"\btrafficking\b",
    r"\bblack\s+market\b",
    r"\bsanctions\s+evader\b",
    r"\bsanctions\s+buster\b",
    r"\bbypassing\s+embargo\b",
    r"\bguilty\s+of\b",
    r"\bsuspected\s+criminal\b",
    r"\bsecret\s+cargo\b",
    r"\bhidden\s+goods\b",
    r"\bunreported\s+goods\b",
    r"\billicit\s+shipment\b",
    r"\billegal\s+cargo\b",
    r"\bwe\s+know\s+this\s+company\s+secretly\b",
    r"\boff-?the-?books\b"
]

COMPILED_PATTERNS = [re.compile(p, re.IGNORECASE) for p in BANNED_PATTERNS]

class CompliancePolicyViolation(Exception):
    def __init__(self, matched_pattern: str, matched_text: str, message: str = None):
        self.matched_pattern = matched_pattern
        self.matched_text = matched_text
        self.message = message or (
            f"Compliance Policy Violation: generated explanation contained prohibited speculative/compliance phrase '{matched_text}' "
            f"matching rule regex '{matched_pattern}'. Explanation halted and logged."
        )
        super().__init__(self.message)

def scan_text_for_violations(text: str) -> Optional[Tuple[str, str]]:
    if not text:
        return None
    for pattern in COMPILED_PATTERNS:
        match = pattern.search(text)
        if match:
            return pattern.pattern, match.group(0)
    return None
