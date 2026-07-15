-- 003_shift_times.sql
-- (RECONSTRUCTED - rosterSync.test.js expects shifts to have clockIn/clockOut,
-- so timesheet must be one row per shift, not one row per staff per period)

ALTER TABLE timesheet
  ADD COLUMN IF NOT EXISTS work_date DATE,
  ADD COLUMN IF NOT EXISTS clock_in  TIME,
  ADD COLUMN IF NOT EXISTS clock_out TIME;

CREATE INDEX IF NOT EXISTS idx_timesheet_period_staff_date
  ON timesheet(pay_period_id, staff_id, work_date);
