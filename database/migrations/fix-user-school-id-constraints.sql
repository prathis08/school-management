-- Migration: Fix users uniqueness model
-- A school can have many users (drop UNIQUE on school_id).
-- Email is unique only within a school (composite UNIQUE on (school_id, email)),
-- so the same email may appear across different schools.
-- school_id is required (NOT NULL).

-- 1. Drop the existing single-column UNIQUE constraint on school_id (if any).
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.users'::regclass
          AND contype = 'u'
          AND pg_get_constraintdef(oid) ILIKE '%(school_id)%'
          AND pg_get_constraintdef(oid) NOT ILIKE '%email%'
    LOOP
        EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', constraint_rec.conname);
    END LOOP;
END $$;

-- Also drop any standalone unique index on school_id alone.
DO $$
DECLARE
    index_rec RECORD;
BEGIN
    FOR index_rec IN
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'users'
          AND indexdef ILIKE '%UNIQUE%(school_id)%'
          AND indexdef NOT ILIKE '%email%'
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS public.%I', index_rec.indexname);
    END LOOP;
END $$;

-- 2. Drop the existing single-column UNIQUE constraint on email (if any).
--    Email uniqueness is replaced by the composite (school_id, email) in step 5.
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public.users'::regclass
          AND contype = 'u'
          AND pg_get_constraintdef(oid) ILIKE '%(email)%'
          AND pg_get_constraintdef(oid) NOT ILIKE '%school_id%'
    LOOP
        EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', constraint_rec.conname);
    END LOOP;
END $$;

DO $$
DECLARE
    index_rec RECORD;
BEGIN
    FOR index_rec IN
        SELECT indexname
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'users'
          AND indexdef ILIKE '%UNIQUE%(email)%'
          AND indexdef NOT ILIKE '%school_id%'
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS public.%I', index_rec.indexname);
    END LOOP;
END $$;

-- 3. Backfill: rows with NULL school_id must be resolved before NOT NULL.
--    The next step will FAIL if any users.school_id IS NULL — intentional guardrail.
--    Decide on a backfill (e.g. assign them to a default school) and run an UPDATE
--    here before re-running this migration. Example (uncomment and edit):
-- UPDATE public.users SET school_id = 'DEFAULT_SCHOOL' WHERE school_id IS NULL;

-- 4. Enforce NOT NULL on school_id.
ALTER TABLE public.users
    ALTER COLUMN school_id SET NOT NULL;

-- 5. Add composite UNIQUE on (school_id, email).
--    This will FAIL if existing rows have duplicate (school_id, email) pairs —
--    intentional guardrail. Resolve duplicates before re-running. To find them:
--      SELECT school_id, email, COUNT(*) FROM public.users
--      GROUP BY school_id, email HAVING COUNT(*) > 1;
ALTER TABLE public.users
    ADD CONSTRAINT users_school_id_email_unique UNIQUE (school_id, email);

-- 6. Helpful non-unique index for per-school user lookups.
CREATE INDEX IF NOT EXISTS idx_users_school_id ON public.users(school_id);

-- Rollback
-- DROP INDEX IF EXISTS public.idx_users_school_id;
-- ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_school_id_email_unique;
-- ALTER TABLE public.users ALTER COLUMN school_id DROP NOT NULL;
-- ALTER TABLE public.users ADD CONSTRAINT users_email_key UNIQUE (email);
-- ALTER TABLE public.users ADD CONSTRAINT users_school_id_key UNIQUE (school_id);
