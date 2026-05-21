-- Adds optional staff-ward tracking to student.
-- Run with: psql -h localhost -p 5432 -U root -d school_management -f database/migrations/add-staff-relation-to-student.sql

ALTER TABLE public.student
  ADD COLUMN IF NOT EXISTS staff_relation JSONB DEFAULT '{}'::jsonb;

-- Helps queries that filter for "all staff wards".
CREATE INDEX IF NOT EXISTS idx_student_staff_ward
  ON public.student ((staff_relation ->> 'isStaffWard'));
