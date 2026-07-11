-- UC-001: store the raw clock-in/clock-out times alongside the computed
-- total_hours for matched shifts, so the frontend breakdown can show e.g.
-- "22:00-06:00" instead of just "8h" — makes overnight shifts and same-day
-- overlaps visible, not just their already-computed hour totals.

ALTER TABLE timesheet ADD COLUMN clock_in VARCHAR;
ALTER TABLE timesheet ADD COLUMN clock_out VARCHAR;
