-- Attendance module: creates the `attendance` table used by the attendance
-- API. One row per student per date (and optional period). Safe to re-run.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS attendance (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id       VARCHAR(255) NOT NULL UNIQUE,
  school_id           VARCHAR(50)  NOT NULL,
  student_id          VARCHAR(255) NOT NULL,
  class_id            VARCHAR(255),
  grade_id            VARCHAR(255),
  date                DATE         NOT NULL,
  period              VARCHAR(20)  NOT NULL DEFAULT 'FULL_DAY',
  status              VARCHAR(20)  NOT NULL DEFAULT 'PRESENT',
  remarks             TEXT,
  marked_by_user_id   UUID,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT attendance_student_date_period_unique UNIQUE (student_id, date, period)
);

CREATE INDEX IF NOT EXISTS attendance_school_class_date_idx
  ON attendance (school_id, class_id, date);

CREATE INDEX IF NOT EXISTS attendance_school_student_date_idx
  ON attendance (school_id, student_id, date);

COMMIT;
