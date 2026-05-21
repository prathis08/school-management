-- Migration: Add Grade-Level Support to Fee System
-- Date: 2026-02-18
-- Description: Updates class_fees and installment_schedules tables to support both grade-level and class-specific fees

-- =====================================================
-- STEP 1: Add gradeId column to class_fees
-- =====================================================

-- Add gradeId column (nullable initially)
ALTER TABLE public.class_fees 
ADD COLUMN IF NOT EXISTS grade_id character varying(255) NULL;

-- Add comment to explain the field
COMMENT ON COLUMN public.class_fees.grade_id IS 'NULL if class-specific, set if grade-level fees apply to all classes in the grade';

-- Make classId nullable (since we now support grade-level fees)
ALTER TABLE public.class_fees 
ALTER COLUMN class_id DROP NOT NULL;

-- Add comment to explain classId is now optional
COMMENT ON COLUMN public.class_fees.class_id IS 'NULL if grade-level, set if class-specific fees';

-- =====================================================
-- STEP 2: Update constraints on class_fees
-- =====================================================

-- Drop old unique constraint
ALTER TABLE public.class_fees 
DROP CONSTRAINT IF EXISTS unique_class_fee;

-- Add new constraint to ensure either gradeId or classId is set (but not both)
ALTER TABLE public.class_fees 
ADD CONSTRAINT chk_grade_or_class CHECK (
    (grade_id IS NULL AND class_id IS NOT NULL) OR 
    (grade_id IS NOT NULL AND class_id IS NULL)
);

-- Add new unique constraint that handles both scenarios
-- Note: PostgreSQL treats NULL values as distinct, so this constraint works correctly
ALTER TABLE public.class_fees 
ADD CONSTRAINT unique_class_fee_v2 UNIQUE (academic_year_id, COALESCE(class_id, ''), COALESCE(grade_id, ''), fee_type_id);

-- =====================================================
-- STEP 3: Add index for grade_id
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_class_fees_grade_id ON public.class_fees(grade_id);

-- =====================================================
-- STEP 4: Add gradeId column to installment_schedules
-- =====================================================

-- Add gradeId column
ALTER TABLE public.installment_schedules 
ADD COLUMN IF NOT EXISTS grade_id character varying(255) NULL;

-- Add comment
COMMENT ON COLUMN public.installment_schedules.grade_id IS 'NULL if not grade-level';

-- Update existing comment on class_id
COMMENT ON COLUMN public.installment_schedules.class_id IS 'NULL if not class-specific';

-- Update comment on student_id
COMMENT ON COLUMN public.installment_schedules.student_id IS 'NULL if not student-specific';

-- =====================================================
-- STEP 5: Update constraints on installment_schedules
-- =====================================================

-- Drop old check constraint
ALTER TABLE public.installment_schedules 
DROP CONSTRAINT IF EXISTS chk_schedule_assignment;

-- Add new constraint that allows gradeId, classId, OR studentId (exactly one)
ALTER TABLE public.installment_schedules 
ADD CONSTRAINT chk_schedule_assignment_v2 CHECK (
    (grade_id IS NOT NULL AND class_id IS NULL AND student_id IS NULL) OR
    (class_id IS NOT NULL AND grade_id IS NULL AND student_id IS NULL) OR 
    (student_id IS NOT NULL AND grade_id IS NULL AND class_id IS NULL)
);

-- =====================================================
-- STEP 6: Add index for grade_id in installment_schedules
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_installment_schedules_grade ON public.installment_schedules(grade_id);

-- =====================================================
-- VERIFICATION QUERIES (uncomment to run)
-- =====================================================

-- Check the structure of class_fees
-- \d+ public.class_fees

-- Check the structure of installment_schedules
-- \d+ public.installment_schedules

-- Test inserting grade-level fee
-- INSERT INTO public.class_fees (academic_year_id, grade_id, fee_type_id, annual_amount, school_id)
-- VALUES ('ACYEAR001', 'GRADE001', 'FT001', 50000.00, 'SCHOOL001');

-- Test inserting class-specific fee
-- INSERT INTO public.class_fees (academic_year_id, class_id, fee_type_id, annual_amount, school_id)
-- VALUES ('ACYEAR001', 'CLASS001', 'FT001', 55000.00, 'SCHOOL001');

-- =====================================================
-- ROLLBACK SCRIPT (if needed)
-- =====================================================

/*
-- Remove grade_id column from class_fees
ALTER TABLE public.class_fees DROP COLUMN IF EXISTS grade_id;

-- Make class_id NOT NULL again
ALTER TABLE public.class_fees ALTER COLUMN class_id SET NOT NULL;

-- Restore old constraint
ALTER TABLE public.class_fees DROP CONSTRAINT IF EXISTS chk_grade_or_class;
ALTER TABLE public.class_fees DROP CONSTRAINT IF EXISTS unique_class_fee_v2;
ALTER TABLE public.class_fees 
ADD CONSTRAINT unique_class_fee UNIQUE (academic_year_id, class_id, fee_type_id);

-- Remove index
DROP INDEX IF EXISTS idx_class_fees_grade_id;

-- Remove grade_id column from installment_schedules
ALTER TABLE public.installment_schedules DROP COLUMN IF EXISTS grade_id;

-- Restore old constraint
ALTER TABLE public.installment_schedules DROP CONSTRAINT IF EXISTS chk_schedule_assignment_v2;
ALTER TABLE public.installment_schedules 
ADD CONSTRAINT chk_schedule_assignment CHECK (
    (class_id IS NULL AND student_id IS NOT NULL) OR 
    (class_id IS NOT NULL AND student_id IS NULL)
);

-- Remove index
DROP INDEX IF EXISTS idx_installment_schedules_grade;
*/
