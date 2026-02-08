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
        created_at timestamptz NOT NULL DEFAULT now_utc (),
        updated_at timestamptz NOT NULL DEFAULT now_utc ()
    );

-- Helpful indexes for players
CREATE INDEX IF NOT EXISTS idx_players_is_verified ON auth.users (is_verified);

-- === User <-> Roles ===
CREATE TABLE
    IF NOT EXISTS auth.user_roles (
        user_id uuid NOT NULL REFERENCES auth.users (id),
        role_id integer NOT NULL REFERENCES auth.roles (id),
        PRIMARY KEY (user_id, role_id)
    );

CREATE TABLE
    IF NOT EXISTS auth.user_sessions (
        user_id uuid NOT NULL REFERENCES auth.users (id),
        started_at timestamptz NOT NULL default now_utc (),
        ended_at timestamptz,
        duration_secs integer,
        status auth.session_status NOT NULL DEFAULT 'open'
    );

-- Helpful indexes for sessions
CREATE INDEX IF NOT EXISTS idx_session_status ON auth.user_sessions (status);

-- === Triggers ===
DROP TRIGGER IF EXISTS trg_users_updated_at ON auth.users;
CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS trg_user_sessions_close ON auth.user_sessions;
CREATE TRIGGER trg_user_sessions_close
BEFORE INSERT OR UPDATE ON auth.user_sessions
FOR EACH ROW
EXECUTE FUNCTION auth_close_session();
