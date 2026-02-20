-- Auth, staff, players, ratings, configs, permission model
CREATE SCHEMA IF NOT EXISTS auth;

-- === Roles ===
CREATE TABLE
    IF NOT EXISTS auth.roles (
        id integer PRIMARY KEY,
        key auth.role_types NOT NULL UNIQUE
    );

-- === Users ===
CREATE TABLE
    IF NOT EXISTS auth.users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid (),
        -- user info
        email email_addr NOT NULL UNIQUE,
        hashed_password non_empty_text NOT NULL,
        is_verified boolean NOT NULL DEFAULT false,
        verification_code text NULL,
        verification_code_expires_at timestamptz NULL,
        verified_at timestamptz NULL,
        is_archived boolean NOT NULL DEFAULT false,
        archived_at timestamptz NULL,
        last_activity_at timestamptz NOT NULL DEFAULT now_utc (),
        created_at timestamptz NOT NULL DEFAULT now_utc (),
        updated_at timestamptz NOT NULL DEFAULT now_utc ()
    );

-- Helpful indexes for players
CREATE INDEX IF NOT EXISTS idx_players_is_verified ON auth.users (is_verified);
CREATE INDEX IF NOT EXISTS idx_users_last_activity ON auth.users (last_activity_at);
CREATE INDEX IF NOT EXISTS idx_users_archived ON auth.users (is_archived);

-- === User <-> Roles ===
CREATE TABLE
    IF NOT EXISTS auth.user_roles (
        user_id uuid NOT NULL REFERENCES auth.users (id),
        role_id integer NOT NULL REFERENCES auth.roles (id),
        PRIMARY KEY (user_id, role_id)
    );

CREATE TABLE
    IF NOT EXISTS auth.user_sessions (
        id UUID PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
        refresh_token_hash TEXT NOT NULL,
        user_agent TEXT,
        ip INET,
        is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
        created_at timestamptz NOT NULL DEFAULT now_utc (),
        expires_at timestamptz NOT NULL
    );

-- Helpful indexes for sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON auth.user_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON auth.user_sessions (expires_at);

CREATE INDEX IF NOT EXISTS idx_sessions_active ON auth.user_sessions (user_id, is_revoked);

-- === Triggers ===
DROP TRIGGER IF EXISTS trg_users_updated_at ON auth.users;

CREATE TRIGGER trg_users_updated_at BEFORE
UPDATE ON auth.users FOR EACH ROW EXECUTE FUNCTION set_updated_at ();

DROP TRIGGER IF EXISTS trg_user_sessions_close ON auth.user_sessions;
