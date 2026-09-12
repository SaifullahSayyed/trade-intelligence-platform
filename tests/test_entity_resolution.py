import os
import uuid
import pytest
from typing import List, Dict, Any

from backend.entity_resolution.run_matching import (
    run_matching_pipeline,
    get_db_connection,
)
from backend.entity_resolution.clustering import cluster_matched_entities

SYNTHETIC_DATASET: List[Dict[str, Any]] = [
    # True Cluster 1: Walmart
    {"id": "a0000000-0000-0000-0000-000000000001", "raw_name": "Walmart Inc.", "ground_truth_cluster": "walmart"},
    {"id": "a0000000-0000-0000-0000-000000000002", "raw_name": "WAL-MART STORES, INC.", "ground_truth_cluster": "walmart"},
    {"id": "a0000000-0000-0000-0000-000000000003", "raw_name": "Walmart", "ground_truth_cluster": "walmart"},
    {"id": "a0000000-0000-0000-0000-000000000004", "raw_name": "WALMART STORES EAST LP", "ground_truth_cluster": "walmart"},

    # True Cluster 2: Samsung Electronics
    {"id": "b0000000-0000-0000-0000-000000000001", "raw_name": "Samsung Electronics Co., Ltd.", "ground_truth_cluster": "samsung_electronics"},
    {"id": "b0000000-0000-0000-0000-000000000002", "raw_name": "SAMSUNG ELECTRONICS", "ground_truth_cluster": "samsung_electronics"},
    {"id": "b0000000-0000-0000-0000-000000000003", "raw_name": "Samsung Electronics Vietnam Co Ltd", "ground_truth_cluster": "samsung_electronics"},

    # Distinct Samsung division (Ambiguous - should trigger NEEDS_REVIEW)
    {"id": "b0000000-0000-0000-0000-000000000004", "raw_name": "SAMSUNG C&T CORP", "ground_truth_cluster": "samsung_ct"},

    # True Cluster 3: Target Brands
    {"id": "c0000000-0000-0000-0000-000000000001", "raw_name": "Target Corporation", "ground_truth_cluster": "target"},
    {"id": "c0000000-0000-0000-0000-000000000002", "raw_name": "TARGET BRANDS, INC.", "ground_truth_cluster": "target"},
    {"id": "c0000000-0000-0000-0000-000000000003", "raw_name": "Target Stores", "ground_truth_cluster": "target"},

    # Distinct Target supply chain entity (Ambiguous - should trigger NEEDS_REVIEW)
    {"id": "c0000000-0000-0000-0000-000000000004", "raw_name": "TARGET LOGISTICS SERVICES INC", "ground_truth_cluster": "target_logistics"},
]

def test_entity_resolution_end_to_end_synthetic():
    results = run_matching_pipeline(SYNTHETIC_DATASET, persist_db=True)
    assert len(results) > 0

    id_to_truth = {r["id"]: r["ground_truth_cluster"] for r in SYNTHETIC_DATASET}

    tp = 0
    fp = 0
    fn = 0
    tn = 0
    needs_review_count = 0

    for res in results:
        t_a = id_to_truth[res["entity_a_id"]]
        t_b = id_to_truth[res["entity_b_id"]]
        is_same_truth = (t_a == t_b)

        dec = res["match_decision"]
        if dec == "NEEDS_REVIEW":
            needs_review_count += 1
        elif dec == "MATCH":
            if is_same_truth:
                tp += 1
            else:
                fp += 1
        elif dec == "NO_MATCH":
            if is_same_truth:
                fn += 1
            else:
                tn += 1

    precision = tp / (tp + fp) if (tp + fp) > 0 else 1.0
    recall = tp / (tp + fn) if (tp + fn) > 0 else 1.0
    false_merge_rate = fp / (tp + fp) if (tp + fp) > 0 else 0.0
    false_split_rate = fn / (tp + fn) if (tp + fn) > 0 else 0.0

    disclaimer = (
        "measured against synthetic, hand-constructed name variants — "
        "not real shipment data — and only indicates the matching logic "
        "works mechanically, not real-world accuracy."
    )

    print("\n" + "=" * 80)
    print("ENTITY RESOLUTION BENCHMARK REPORT")
    print(f"DISCLAIMER: {disclaimer}")
    print("=" * 80)
    print(f"Total candidate pairs evaluated: {len(results)}")
    print(f"Matches (TP):                    {tp}")
    print(f"False Merges (FP):               {fp}")
    print(f"False Splits (FN):               {fn}")
    print(f"True Non-Matches (TN):           {tn}")
    print(f"Uncertain Pairs (NEEDS_REVIEW):  {needs_review_count}")
    print(f"Precision:                       {precision:.4f}")
    print(f"Recall:                          {recall:.4f}")
    print(f"False Merge Rate:                {false_merge_rate:.4f}")
    print(f"False Split Rate:                {false_split_rate:.4f}")
    print("=" * 80)

    assert precision >= 0.90
    assert recall >= 0.85
    assert false_merge_rate <= 0.05
    assert needs_review_count >= 1

    clustered = cluster_matched_entities(SYNTHETIC_DATASET, results)
    assert clustered["cluster_count"] >= 3
    assert clustered["coverage_ratio"] >= 0.70

    # Verify live database persistence
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            cur.execute("SELECT count(*) FROM entity_resolution_audit;")
            audit_count = cur.fetchone()[0]
            assert audit_count >= len(results)

            cur.execute("SELECT count(*) FROM review_queue WHERE status = 'PENDING';")
            queue_count = cur.fetchone()[0]
            assert queue_count >= 1
    finally:
        conn.close()
