import uuid
from typing import Dict, List, Any, Set

def cluster_matched_entities(
    records: List[Dict[str, Any]],
    match_results: List[Dict[str, Any]]
) -> Dict[str, Any]:
    record_map = {r["id"]: r for r in records}
    adj: Dict[str, Set[str]] = {r["id"]: set() for r in records}
    pair_scores: Dict[tuple, float] = {}

    for res in match_results:
        if res["match_decision"] == "MATCH":
            u = res["entity_a_id"]
            v = res["entity_b_id"]
            if u in adj and v in adj:
                adj[u].add(v)
                adj[v].add(u)
                pair_key = tuple(sorted([u, v]))
                pair_scores[pair_key] = res["confidence_score"]

    visited = set()
    clusters = []

    for rec_id in records:
        rid = rec_id["id"]
        if rid in visited:
            continue

        component = []
        queue = [rid]
        visited.add(rid)

        while queue:
            curr = queue.pop(0)
            component.append(curr)
            for neighbor in adj[curr]:
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)

        canonical_id = str(uuid.uuid4())
        names = [record_map[cid]["raw_name"] for cid in component]
        names.sort(key=lambda n: (len(n), n))
        canonical_name = names[0]

        comp_scores = []
        for i in range(len(component)):
            for j in range(i + 1, len(component)):
                pkey = tuple(sorted([component[i], component[j]]))
                if pkey in pair_scores:
                    comp_scores.append(pair_scores[pkey])

        min_score = min(comp_scores) if comp_scores else 1.0
        if min_score >= 0.90:
            tier = "HIGH"
        elif min_score >= 0.85:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        clusters.append({
            "canonical_entity_id": canonical_id,
            "canonical_name": canonical_name,
            "confidence_tier": tier,
            "member_ids": component,
            "member_count": len(component),
            "min_pairwise_score": round(min_score, 4),
        })

    matched_count = sum(c["member_count"] for c in clusters if c["member_count"] > 1)
    total_count = len(records)

    return {
        "clusters": clusters,
        "cluster_count": len(clusters),
        "total_records": total_count,
        "matched_records": matched_count,
        "coverage_ratio": round(matched_count / total_count, 4) if total_count > 0 else 0.0,
    }
