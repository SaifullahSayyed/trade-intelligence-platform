import re
import unicodedata
from typing import Dict, Any

LEGAL_SUFFIXES = [
    r"\bINC(?:ORPORATED)?\b",
    r"\bLLC\b",
    r"\bLTD\b",
    r"\bLIMITED\b",
    r"\bCORP(?:ORATION)?\b",
    r"\bCO(?:MPANY)?\b",
    r"\bLP\b",
    r"\bLLP\b",
    r"\bPLC\b",
    r"\bSA\b",
    r"\bSARL\b",
    r"\bBV\b",
    r"\bNV\b",
    r"\bGMBH\b",
    r"\bAG\b",
    r"\bHOLDINGS?\b",
    r"\bGROUP\b",
    r"\bENTERPRISES?\b",
    r"\bINTERNATIONAL\b",
    r"\bINTL\b",
    r"\bSTORES?\b",
    r"\bEAST\b",
    r"\bWEST\b",
    r"\bNORTH\b",
    r"\bSOUTH\b",
    r"\bUSA\b",
    r"\bVIETNAM\b",
    r"\bCHINA\b",
    r"\bBRANCH\b",
]

SUFFIX_REGEX = re.compile(r"|".join(LEGAL_SUFFIXES), re.IGNORECASE)

def normalize_text(text: str) -> str:
    if not text:
        return ""
    text = unicodedata.normalize("NFKD", text)
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip().upper()

def strip_suffixes(cleaned_name: str) -> str:
    stripped = SUFFIX_REGEX.sub(" ", cleaned_name)
    stripped = re.sub(r"\s+", " ", stripped).strip()
    return stripped if stripped else cleaned_name

def compute_soundex(token: str) -> str:
    if not token:
        return "0000"
    token = re.sub(r"[^A-Z]", "", token.upper())
    if not token:
        return "0000"
    mapping = {
        "B": "1", "F": "1", "P": "1", "V": "1",
        "C": "2", "G": "2", "J": "2", "K": "2", "Q": "2", "S": "2", "X": "2", "Z": "2",
        "D": "3", "T": "3",
        "L": "4",
        "M": "5", "N": "5",
        "R": "6"
    }
    first_char = token[0]
    encoded = [first_char]
    prev_code = mapping.get(first_char, "0")
    for ch in token[1:]:
        code = mapping.get(ch, "0")
        if code != "0" and code != prev_code:
            encoded.append(code)
            prev_code = code
        elif code == "0":
            prev_code = "0"
        if len(encoded) == 4:
            break
    while len(encoded) < 4:
        encoded.append("0")
    return "".join(encoded)

def normalize_entity_record(raw_name: str) -> Dict[str, Any]:
    cleaned = normalize_text(raw_name)
    base_name = strip_suffixes(cleaned)
    tokens = sorted(base_name.split())
    token_sort = " ".join(tokens)
    first_token = tokens[0] if tokens else ""
    first_char = cleaned[0] if cleaned else "_"
    soundex_code = compute_soundex(first_token)
    return {
        "raw_name": raw_name,
        "cleaned_name": cleaned,
        "base_name": base_name,
        "token_sort": token_sort,
        "first_char": first_char,
        "soundex": soundex_code,
    }
