-- Seed data for UC-001: real staff records, so roster rows read from the
-- Google Sheet have something to match against. The roster rows themselves
-- live in the actual Google Sheet (see ROSTER_SHEET_CSV_URL in .env), not
-- in this database.

INSERT INTO staff (external_ref, full_name) VALUES
  ('S001', 'Andrea Chua'),
  ('S002', 'Kieron Tan'),
  ('S003', 'Robert Leon'),
  ('S004', 'Suhaila Ali'),
  ('S005', 'Kok En Qi'),
  ('S006', 'Wei Ming Lim'),
  ('S007', 'Farah Yusof');
