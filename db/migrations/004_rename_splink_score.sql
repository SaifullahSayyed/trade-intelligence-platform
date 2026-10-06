-- Migration 004: rename splink_score → matcher_score in review_queue
-- -----------------------------------------------------------------------
-- Rationale:
--   The entity resolution engine was always a custom Fellegi-Sunter-style
--   probabilistic matcher written from scratch. It was never the external
--   Splink library. The column name splink_score was therefore a misnomer.
--   This migration renames it without dropping data.
--
-- Immutability note for entity_resolution_audit:
--   The entity_resolution_audit table has an append-only design (no UPDATE/
--   DELETE permitted by application logic). Rows written before this migration
--   carry model_version = 'splink_v1.0.0_fellegi_sunter'. Those rows are NOT
--   altered — altering them would violate the immutability guarantee.
--   Instead, a NOTE row is appended to record the rename event, and a table
--   comment is set. Future rows will carry model_version = 'orchid_fs_matcher_v1'.
-- -----------------------------------------------------------------------

-- 1. Rename the column (non-destructive; existing values preserved)
ALTER TABLE review_queue
    RENAME COLUMN splink_score TO matcher_score;

-- 2. Append a provenance correction record to the immutable audit log.
--    action = 'MODEL_VERSION_CORRECTION' marks this as a metadata amendment,
--    not a data change. The original matching decisions are unchanged.
INSERT INTO entity_resolution_audit (
    audit_id,
    entity_a_id,
    entity_b_id,
    match_decision,
    confidence_score,
    reason,
    model_version
) VALUES (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000'::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid,
    'MATCH',
    1.0000,
    '{"action": "MODEL_VERSION_CORRECTION",
      "note": "Rows written before this migration carry model_version=splink_v1.0.0_fellegi_sunter. That name was a misnomer: no Splink library was ever installed or used. The engine is a custom Fellegi-Sunter-style probabilistic matcher. Future rows will carry model_version=orchid_fs_matcher_v1. Pre-migration rows are intentionally preserved unaltered per the append-only audit policy.",
      "migration": "004_rename_splink_score",
      "applied_at": "2026-10-06"
    }'::jsonb,
    'orchid_fs_matcher_v1'
);

-- 3. Add a table comment so any DB inspector sees the context immediately
COMMENT ON TABLE review_queue IS
  'Entity pair human-review queue. matcher_score was renamed from splink_score (migration 004) — no Splink library is used; scorer is a custom Fellegi-Sunter implementation.';

COMMENT ON COLUMN review_queue.matcher_score IS
  'Probabilistic match score from the Orchid Fellegi-Sunter matcher (orchid_fs_matcher_v1). Renamed from splink_score in migration 004.';
