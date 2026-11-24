-- Replace the (incorrect) global uniqueness implied by the models with
-- per-school uniqueness. Safe to re-run.

BEGIN;

-- Class names are unique per school, not globally.
CREATE UNIQUE INDEX IF NOT EXISTS class_school_class_name_unique
  ON class (school_id, class_name);

-- Roll numbers are unique per school (NULLs are allowed and may repeat).
CREATE UNIQUE INDEX IF NOT EXISTS student_school_roll_number_unique
  ON student (school_id, roll_number);

COMMIT;
