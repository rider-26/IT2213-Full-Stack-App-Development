-- 002_uc001_enhancements.sql
-- (RECONSTRUCTED - based on rosterSync.test.js, which inserts staff with
-- external_ref + status, and checks matchedBy on shifts)

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS external_ref VARCHAR(30) UNIQUE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive'));

ALTER TABLE timesheet
  ADD COLUMN IF NOT EXISTS matched_by VARCHAR(20)
    CHECK (matched_by IN ('id', 'name')),
  ADD COLUMN IF NOT EXISTS source VARCHAR(20) NOT NULL DEFAULT 'manual'
    CHECK (source IN ('manual', 'scheduled'));
