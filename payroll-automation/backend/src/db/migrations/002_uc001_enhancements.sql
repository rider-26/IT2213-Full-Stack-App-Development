-- UC-001 enhancements:
-- 1. match_method records HOW a matched row was matched (by staff ID or by
--    name fallback), so the frontend can show it instead of a generic "Matched" badge.
-- 2. 'invalid_time' is a new match_status value for rows whose clock-in/out
--    couldn't be turned into hours (e.g. blank cell) — kept separate from
--    'unmatched' (unknown staff), since they're different problems for
--    accounting staff to resolve.
-- 3. audit_log is a shared table (per the design doc's architecture) for
--    recording sync events; other use cases can log to it too later.

ALTER TYPE match_status_enum ADD VALUE 'invalid_time';

ALTER TABLE timesheet ADD COLUMN match_method VARCHAR; -- 'id' | 'name'; null for unmatched/invalid_time rows

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR NOT NULL,
  actor VARCHAR NOT NULL,
  detail JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT now()
);
