-- 004_uc002_validation.sql
-- migration for UC-002 stuff. just adding new columns + a new table,
-- doesnt touch any existing data so should be safe to run

-- draft = not checked yet, validated = accounting staff signed off on it
ALTER TABLE timesheet
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'DRAFT'
    CHECK (status IN ('DRAFT', 'VALIDATED'));

-- tracks where each pay period is at in the validation process
ALTER TABLE pay_period
  ADD COLUMN IF NOT EXISTS validation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (validation_status IN ('PENDING', 'IN_REVIEW', 'VALIDATED'));

ALTER TABLE pay_period
  ADD COLUMN IF NOT EXISTS validated_at TIMESTAMP;

-- this is the main new table - one row per problem found during validation
CREATE TABLE IF NOT EXISTS validation_flag (
  id                SERIAL PRIMARY KEY,
  pay_period_id     INTEGER NOT NULL REFERENCES pay_period(id) ON DELETE CASCADE,
  timesheet_id      INTEGER REFERENCES timesheet(id) ON DELETE CASCADE, -- can be null (eg weekly overtime isnt tied to one row)
  staff_id          INTEGER NOT NULL REFERENCES staff(id),
  flag_type         VARCHAR(30) NOT NULL
                    CHECK (flag_type IN ('OVERTIME_DAILY', 'OVERTIME_WEEKLY', 'DUPLICATE_ENTRY', 'MISSING_ENTRY')),
  expected_value    NUMERIC(6,2),
  actual_value      NUMERIC(6,2),
  status            VARCHAR(20) NOT NULL DEFAULT 'OPEN'
                    CHECK (status IN ('OPEN', 'RESOLVED', 'ESCALATED', 'HELD')),
  resolution_notes  TEXT,
  resolved_at       TIMESTAMP,
  created_at        TIMESTAMP NOT NULL DEFAULT now()
);

-- index so looking up "open flags for this period" isnt slow
CREATE INDEX IF NOT EXISTS idx_validation_flag_period_status
  ON validation_flag(pay_period_id, status);
