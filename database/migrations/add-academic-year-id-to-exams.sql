-- Link exams to the shared academic_years table (keeps the existing
-- academic_year text column for display/compat). Safe to re-run.

BEGIN;

ALTER TABLE exams
  ADD COLUMN IF NOT EXISTS academic_year_id VARCHAR(255);

CREATE INDEX IF NOT EXISTS exams_school_academic_year_id_idx
  ON exams (school_id, academic_year_id);

COMMIT;
