from typing import Dict, Any, List

MODEL_VERSION = "splink_v1.0.0_fellegi_sunter"

THRESHOLD_MATCH = 0.85
THRESHOLD_REVIEW = 0.65

SPLINK_SETTINGS: Dict[str, Any] = {
    "link_type": "dedupe_only",
    "model_version": MODEL_VERSION,
    "blocking_rules_to_generate_predictions": [
        "l.first_char = r.first_char AND l.soundex = r.soundex",
        "l.base_name = r.base_name",
        "l.first_char = r.first_char",
    ],
    "comparisons": [
        {
            "output_column_name": "base_name",
            "comparison_levels": [
                {"sql_condition": "base_name_l IS NULL OR base_name_r IS NULL", "label_for_charts": "Null"},
                {"sql_condition": "base_name_l = base_name_r", "label_for_charts": "Exact match", "is_null_level": False},
                {"sql_condition": "jaro_winkler_similarity(base_name_l, base_name_r) >= 0.92", "label_for_charts": "Jaro-Winkler >= 0.92"},
                {"sql_condition": "jaro_winkler_similarity(base_name_l, base_name_r) >= 0.80", "label_for_charts": "Jaro-Winkler >= 0.80"},
                {"sql_condition": "ELSE", "label_for_charts": "All other comparisons"},
            ],
        },
        {
            "output_column_name": "soundex",
            "comparison_levels": [
                {"sql_condition": "soundex_l = soundex_r", "label_for_charts": "Phonetic Soundex match"},
                {"sql_condition": "ELSE", "label_for_charts": "Phonetic mismatch"},
            ],
        },
    ],
}

def jaro_winkler_similarity(s1: str, s2: str) -> float:
    if not s1 or not s2:
        return 0.0
    if s1 == s2:
        return 1.0

    len1, len2 = len(s1), len(s2)
    max_dist = max(len1, len2) // 2 - 1
    if max_dist < 0:
        max_dist = 0

    match1 = [False] * len1
    match2 = [False] * len2
    matches = 0
    transpositions = 0

    for i in range(len1):
        start = max(0, i - max_dist)
        end = min(i + max_dist + 1, len2)
        for j in range(start, end):
            if match2[j] or s1[i] != s2[j]:
                continue
            match1[i] = True
            match2[j] = True
            matches += 1
            break

    if matches == 0:
        return 0.0

    k = 0
    for i in range(len1):
        if not match1[i]:
            continue
        while not match2[k]:
            k += 1
        if s1[i] != s2[k]:
            transpositions += 1
        k += 1

    transpositions //= 2
    jaro = (matches / len1 + matches / len2 + (matches - transpositions) / matches) / 3.0

    prefix = 0
    max_p = min(4, min(len1, len2))
    for i in range(max_p):
        if s1[i] == s2[i]:
            prefix += 1
        else:
            break

    return jaro + 0.1 * prefix * (1.0 - jaro)
