-- Migration: Add admission_number to student table
-- Description: Adds admission number field for official school registration number

-- Add admission_number column
ALTER TABLE public.student 
ADD COLUMN IF NOT EXISTS admission_number character varying(100);

-- Add unique index (unique per school)
CREATE UNIQUE INDEX IF NOT EXISTS idx_student_admission_number_school 
ON public.student(school_id, admission_number) 
WHERE admission_number IS NOT NULL;

-- Add regular index for searching
CREATE INDEX IF NOT EXISTS idx_student_admission_number 
ON public.student(admission_number);

-- Comments
COMMENT ON COLUMN public.student.admission_number IS 'Official school admission/registration number';

-- Rollback
-- DROP INDEX IF EXISTS idx_student_admission_number_school;
-- DROP INDEX IF EXISTS idx_student_admission_number;
-- ALTER TABLE public.student DROP COLUMN IF EXISTS admission_number;
