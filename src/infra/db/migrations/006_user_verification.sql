ALTER TABLE auth.users
ADD COLUMN IF NOT EXISTS verification_code text NULL,
ADD COLUMN IF NOT EXISTS verified_at timestamptz NULL;

UPDATE auth.users
SET verified_at = COALESCE(verified_at, created_at, now_utc())
WHERE is_verified = true
  AND verified_at IS NULL;
