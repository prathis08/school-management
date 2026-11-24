-- Rebuilds the class_subject join table to match the rest of the codebase:
-- VARCHAR FKs referencing the custom IDs (class.class_id, subject.subject_id),
-- not the UUID primary keys. Mirrors the teacher_subject convention so
-- Sequelize associations can use sourceKey/targetKey of "classId"/"subjectId".
-- Safe to run: the existing table is empty.

BEGIN;

DO $$
DECLARE
  row_count BIGINT := 0;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'class_subject') THEN
    EXECUTE 'SELECT COUNT(*) FROM class_subject' INTO row_count;
  END IF;
  IF row_count > 0 THEN
    RAISE EXCEPTION
      'Refusing to drop class_subject: % rows present', row_count;
  END IF;
END $$;

DROP TABLE IF EXISTS class_subject;

-- No DB-level FK constraints: class.class_id and subject.subject_id aren't
-- unique-indexed in this schema (matching the teacher_subject convention).
-- Referential integrity is enforced at the Sequelize/service layer.
CREATE TABLE class_subject (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id    VARCHAR(255) NOT NULL,
  subject_id  VARCHAR(255) NOT NULL,
  school_id   VARCHAR(50)  NOT NULL,
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  CONSTRAINT class_subject_unique UNIQUE (class_id, subject_id)
);

CREATE INDEX class_subject_school_class_idx   ON class_subject (school_id, class_id);
CREATE INDEX class_subject_school_subject_idx ON class_subject (school_id, subject_id);

COMMIT;
