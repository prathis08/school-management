-- Emails are globally unique so login-by-email is unambiguous.
-- Aborts if duplicate emails already exist (resolve them manually first).

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT email FROM users GROUP BY email HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'Cannot add global unique email: duplicate emails exist in users';
  END IF;
END $$;

DROP INDEX IF EXISTS users_school_id_email_unique;

CREATE UNIQUE INDEX IF NOT EXISTS users_email_global_unique
  ON users (email);

COMMIT;
