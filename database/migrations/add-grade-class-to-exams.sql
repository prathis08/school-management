-- Adds human-readable grade + optional class info to exams. Existing rows
-- get `grade` backfilled by looking up the first matching row in the class
-- table by grade_id; if a school has lost that mapping, `grade` falls back
-- to grade_id so it stays non-null.

BEGIN;

ALTER TABLE exams ADD COLUMN IF NOT EXISTS grade      VARCHAR(255);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS class_id   VARCHAR(255);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS class_name VARCHAR(255);

UPDATE exams e
   SET grade = COALESCE(
                 (SELECT c.grade
                    FROM class c
                   WHERE c.grade_id  = e.grade_id
                     AND c.school_id = e.school_id
                   LIMIT 1),
                 e.grade_id
               )
 WHERE e.grade IS NULL;

ALTER TABLE exams ALTER COLUMN grade SET NOT NULL;

COMMIT;
