-- Track whether a user must change their password (used for generated
-- temporary teacher passwords). Safe to re-run.

BEGIN;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN NOT NULL DEFAULT FALSE;

COMMIT;
