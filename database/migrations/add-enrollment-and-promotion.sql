-- Academic module: per-year enrollment history + promotion settings.
-- Safe to re-run.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS student_enrollments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id        VARCHAR(255) NOT NULL UNIQUE,
  school_id            VARCHAR(50)  NOT NULL,
  student_id           VARCHAR(255) NOT NULL,
  academic_year_id     VARCHAR(255) NOT NULL,
  academic_year_name   VARCHAR(50),
  class_id             VARCHAR(255),
  class_name           VARCHAR(255),
  grade_id             VARCHAR(255),
  grade                VARCHAR(255),
  status               VARCHAR(30)  NOT NULL DEFAULT 'ENROLLED',
  final_percentage     NUMERIC(5,2),
  final_grade          VARCHAR(5),
  remarks              TEXT,
  decided_by_user_id   UUID,
  is_active            BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT student_enrollments_student_year_unique
    UNIQUE (student_id, academic_year_id)
);

CREATE INDEX IF NOT EXISTS student_enrollments_school_year_grade_idx
  ON student_enrollments (school_id, academic_year_id, grade_id);
CREATE INDEX IF NOT EXISTS student_enrollments_school_student_idx
  ON student_enrollments (school_id, student_id);

CREATE TABLE IF NOT EXISTS promotion_rules (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id                   VARCHAR(255) NOT NULL UNIQUE,
  school_id                 VARCHAR(50)  NOT NULL UNIQUE,
  min_overall_percentage    NUMERIC(5,2) NOT NULL DEFAULT 40,
  must_pass_all_subjects    BOOLEAN      NOT NULL DEFAULT TRUE,
  max_failed_subjects       INTEGER      NOT NULL DEFAULT 0,
  min_attendance_percentage NUMERIC(5,2) NOT NULL DEFAULT 0,
  outcome_on_fail           VARCHAR(20)  NOT NULL DEFAULT 'RETAIN',
  is_active                 BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at                TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMIT;
