import json
import os
import uuid
from typing import Any, Dict, List, Optional, Tuple

import psycopg2
from psycopg2.extras import Json

from .normalize import normalize_entity_record
from .splink_config import (
    MODEL_VERSION,
    THRESHOLD_MATCH,
    THRESHOLD_REVIEW,
    jaro_winkler_similarity,
)

def get_db_connection():
    return psycopg2.connect(
        host=os.environ.get("POSTGRES_HOST", "localhost"),
        port=int(os.environ.get("POSTGRES_PORT", 5432)),
        dbname=os.environ.get("POSTGRES_DB", "trade_intelligence"),
        user=os.environ.get("POSTGRES_USER", "ti_user"),
        password=os.environ.get("POSTGRES_PASSWORD", "ti_local_postgres_pass_2026!"),
    )

def evaluate_pair(rec_a: Dict[str, Any], rec_b: Dict[str, Any]) -> Dict[str, Any]:
    norm_a = normalize_entity_record(rec_a["raw_name"])
    norm_b = normalize_entity_record(rec_b["raw_name"])

    driving_signals = []
    base_a = norm_a["base_name"]
    base_b = norm_b["base_name"]

    jw = jaro_winkler_similarity(base_a, base_b)
    soundex_match = norm_a["soundex"] == norm_b["soundex"]

    if soundex_match:
        driving_signals.append(f"soundex_phonetic_match_{norm_a['soundex']}")

    tokens_a = set(base_a.split())
    tokens_b = set(base_b.split())
    token_overlap = tokens_a.intersection(tokens_b)

    if base_a == base_b:
        score = 0.9850
        driving_signals.append("exact_base_name_match")
    elif norm_a["token_sort"] == norm_b["token_sort"]:
        score = 0.9600
        driving_signals.append("exact_token_sort_match")
    elif jw >= 0.92:
        score = round(0.8600 + (jw - 0.92) * 1.25, 4)
        driving_signals.append(f"jaro_winkler_similarity_{jw:.2f}")
    elif len(token_overlap) >= 1 and (len(tokens_a) > 1 or len(tokens_b) > 1):
        score = 0.7450
        driving_signals.append(f"partial_token_overlap_{list(token_overlap)}")
        driving_signals.append(f"jaro_winkler_similarity_{jw:.2f}")
    elif jw >= 0.80:
        score = round(0.6800 + (jw - 0.80) * 0.5, 4)
        driving_signals.append(f"moderate_jaro_winkler_similarity_{jw:.2f}")
    else:
        score = round(jw * 0.5, 4)
        driving_signals.append("low_lexical_similarity")

    score = min(0.9999, max(0.0001, score))

    if score >= THRESHOLD_MATCH:
        decision = "MATCH"
    elif score >= THRESHOLD_REVIEW:
        decision = "NEEDS_REVIEW"
    else:
        decision = "NO_MATCH"

    reason = {
        "driving_signals": driving_signals,
        "base_name_a": base_a,
        "base_name_b": base_b,
        "token_sort_a": norm_a["token_sort"],
        "token_sort_b": norm_b["token_sort"],
        "jaro_winkler_score": round(jw, 4),
        "soundex_match": soundex_match,
        "match_probability": round(score, 4),
    }

    ambiguity_notes = None
    if decision == "NEEDS_REVIEW":
        ambiguity_notes = (
            f"Ambiguous corporate entity pair: '{rec_a['raw_name']}' vs '{rec_b['raw_name']}'. "
            f"Score {score:.4f} in review band [0.65, 0.85]. "
            f"Driving signals: {', '.join(driving_signals)}."
        )

    return {
        "entity_a_id": rec_a["id"],
        "entity_b_id": rec_b["id"],
        "raw_name_a": rec_a["raw_name"],
        "raw_name_b": rec_b["raw_name"],
        "match_decision": decision,
        "confidence_score": score,
        "reason": reason,
        "model_version": MODEL_VERSION,
        "notes": ambiguity_notes,
    }

def run_matching_pipeline(records: List[Dict[str, Any]], persist_db: bool = True) -> List[Dict[str, Any]]:
    # Generate candidate pairs via blocking (first character of cleaned name)
    buckets: Dict[str, List[Dict[str, Any]]] = {}
    for r in records:
        norm = normalize_entity_record(r["raw_name"])
        key = norm["first_char"]
        buckets.setdefault(key, []).append(r)

    candidate_pairs = []
    seen = set()
    for bucket in buckets.values():
        n = len(bucket)
        for i in range(n):
            for j in range(i + 1, n):
                pair_key = tuple(sorted([bucket[i]["id"], bucket[j]["id"]]))
                if pair_key not in seen:
                    seen.add(pair_key)
                    candidate_pairs.append((bucket[i], bucket[j]))

    results = []
    for rec_a, rec_b in candidate_pairs:
        eval_result = evaluate_pair(rec_a, rec_b)
        results.append(eval_result)

    if persist_db:
        conn = get_db_connection()
        try:
            with conn.cursor() as cur:
                for res in results:
                    audit_id = str(uuid.uuid4())
                    cur.execute(
                        """
                        INSERT INTO entity_resolution_audit (
                            audit_id, entity_a_id, entity_b_id, match_decision,
                            confidence_score, reason, model_version
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            audit_id,
                            res["entity_a_id"],
                            res["entity_b_id"],
                            res["match_decision"],
                            res["confidence_score"],
                            Json(res["reason"]),
                            res["model_version"],
                        ),
                    )

                    if res["match_decision"] == "NEEDS_REVIEW":
                        cur.execute(
                            """
                            INSERT INTO review_queue (
                                review_id, entity_a_id, entity_b_id, splink_score,
                                status, notes
                            ) VALUES (%s, %s, %s, %s, %s, %s)
                            """,
                            (
                                str(uuid.uuid4()),
                                res["entity_a_id"],
                                res["entity_b_id"],
                                res["confidence_score"],
                                "PENDING",
                                res["notes"],
                            ),
                        )
            conn.commit()
        finally:
            conn.close()

    return results
