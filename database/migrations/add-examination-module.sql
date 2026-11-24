-- Examination module: rebuilds `exams` and `results` to the new schema and
-- adds the `exam_subjects` join table that holds per-subject schedule + marking
-- scheme. Safe to run on fresh installs (CREATE IF NOT EXISTS where possible)
-- and on systems with zero data in the old tables — the DROP TABLE is gated
-- on the row counts being zero, otherwise the migration aborts.

BEGIN;

DO $$
DECLARE
  exam_rows BIGINT := 0;
  result_rows BIGINT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exams') THEN
    EXECUTE 'SELECT COUNT(*) FROM exams' INTO exam_rows;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'results') THEN
    EXECUTE 'SELECT COUNT(*) FROM results' INTO result_rows;
  END IF;
  IF exam_rows > 0 OR result_rows > 0 THEN
    RAISE EXCEPTION
      'Refusing to drop legacy exams/results tables: % rows in exams, % rows in results',
      exam_rows, result_rows;
  END IF;
END $$;

DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS exam_subjects CASCADE;
DROP TABLE IF EXISTS exams CASCADE;

CREATE TABLE exams (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id             VARCHAR(255) NOT NULL UNIQUE,
  school_id           VARCHAR(50)  NOT NULL,
  exam_name           VARCHAR(255) NOT NULL,
  exam_type           VARCHAR(50)  NOT NULL,
  grade_id            VARCHAR(255) NOT NULL,
  academic_year       VARCHAR(255) NOT NULL,
  status              VARCHAR(50)  NOT NULL DEFAULT 'DRAFT',
  instructions        TEXT,
  created_by_user_id  UUID,
  is_active           BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX exams_school_grade_year_idx
  ON exams (school_id, grade_id, academic_year);
CREATE INDEX exams_school_type_idx
  ON exams (school_id, exam_type);

CREATE TABLE exam_subjects (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_subject_id   VARCHAR(255) NOT NULL UNIQUE,
  school_id         VARCHAR(50)  NOT NULL,
  exam_id           VARCHAR(255) NOT NULL REFERENCES exams (exam_id) ON DELETE CASCADE,
  subject_id        VARCHAR(255) NOT NULL,
  exam_date         DATE         NOT NULL,
  start_time        TIME,
  end_time          TIME,
  max_marks         NUMERIC(6,2) NOT NULL,
  passing_marks     NUMERIC(6,2) NOT NULL,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT exam_subjects_exam_subject_unique UNIQUE (exam_id, subject_id)
);

CREATE INDEX exam_subjects_school_exam_idx ON exam_subjects (school_id, exam_id);

CREATE TABLE results (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  result_id         VARCHAR(255) NOT NULL UNIQUE,
  school_id         VARCHAR(50)  NOT NULL,
  exam_id           VARCHAR(255) NOT NULL REFERENCES exams (exam_id) ON DELETE CASCADE,
  exam_subject_id   VARCHAR(255) NOT NULL REFERENCES exam_subjects (exam_subject_id) ON DELETE CASCADE,
  student_id        VARCHAR(255) NOT NULL,
  marks_obtained    NUMERIC(6,2),
  percentage        NUMERIC(5,2),
  grade             VARCHAR(5),
  status            VARCHAR(20)  NOT NULL DEFAULT 'PASS',
  remarks           TEXT,
  is_published      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT results_exam_subject_student_unique UNIQUE (exam_subject_id, student_id)
);

CREATE INDEX results_school_exam_idx    ON results (school_id, exam_id);
CREATE INDEX results_school_student_idx ON results (school_id, student_id);

COMMIT;
