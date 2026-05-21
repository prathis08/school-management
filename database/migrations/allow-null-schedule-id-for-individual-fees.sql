-- Migration: Allow NULL schedule_id for individual fees
-- Description: Makes schedule_id and amount fields nullable to support individual fees without a fee schedule

-- Make schedule_id nullable (for individual fees only records)
ALTER TABLE public.student_fee_assignments 
ALTER COLUMN schedule_id DROP NOT NULL;

-- Make amount fields nullable
ALTER TABLE public.student_fee_assignments 
ALTER COLUMN total_annual_amount DROP NOT NULL;

ALTER TABLE public.student_fee_assignments 
ALTER COLUMN final_annual_amount DROP NOT NULL;

-- Comments
COMMENT ON COLUMN public.student_fee_assignments.schedule_id IS 'References installment schedule - NULL for individual fees only assignments';

-- Rollback (if needed)
-- ALTER TABLE public.student_fee_assignments ALTER COLUMN schedule_id SET NOT NULL;
-- ALTER TABLE public.student_fee_assignments ALTER COLUMN total_annual_amount SET NOT NULL;
-- ALTER TABLE public.student_fee_assignments ALTER COLUMN final_annual_amount SET NOT NULL;
