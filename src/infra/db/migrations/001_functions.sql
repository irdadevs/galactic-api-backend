-- Shared functions (used as defaults, triggers helpers, etc.)

-- === now() UTC ===
CREATE OR REPLACE FUNCTION now_utc() RETURNS timestamptz
LANGUAGE sql
STABLE
AS $$ SELECT (now() AT TIME ZONE 'UTC')::timestamptz $$;


-- === Game session close: set ended_at + duration_secs ===
CREATE OR REPLACE FUNCTION auth_close_session() RETURNS trigger AS $$
BEGIN
  -- If closing and no ended_at yet, set it
  IF NEW.status = 'close' AND NEW.ended_at IS NULL THEN
    NEW.ended_at := now_utc();
  END IF;

  IF NEW.ended_at IS NOT NULL THEN
    NEW.duration_secs := EXTRACT(EPOCH FROM (NEW.ended_at - NEW.started_at));
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- === updated_at trigger helper ===
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
  NEW.updated_at := now_utc();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- === Error log helper ===
CREATE OR REPLACE FUNCTION logs_log_error(
  p_source text,
  p_message text,
  p_level text DEFAULT 'error',
  p_context jsonb DEFAULT '{}'::jsonb,
  p_user_id uuid DEFAULT NULL,
  p_request_id text DEFAULT NULL
) RETURNS void AS $$
BEGIN
  INSERT INTO logs.error_log (
    source,
    level,
    message,
    context,
    user_id,
    request_id,
    occurred_at
  )
  VALUES (
    p_source,
    p_level,
    p_message,
    p_context,
    p_user_id,
    p_request_id,
    now_utc()
  );
END;
$$ LANGUAGE plpgsql;

-- === Metrics helper ===
CREATE OR REPLACE FUNCTION metrics_track_event(
  p_event_name text,
  p_user_id uuid DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
) RETURNS void AS $$
BEGIN
  INSERT INTO metrics.events (event_name, user_id, metadata, occurred_at)
  VALUES (p_event_name, p_user_id, p_metadata, now_utc());
END;
$$ LANGUAGE plpgsql;

-- === Metrics rollup trigger ===
CREATE OR REPLACE FUNCTION metrics_rollup_daily() RETURNS trigger AS $$
BEGIN
  INSERT INTO metrics.daily_usage (event_date, event_name, total_count)
  VALUES (NEW.occurred_at::date, NEW.event_name, 1)
  ON CONFLICT (event_date, event_name)
  DO UPDATE SET total_count = metrics.daily_usage.total_count + 1;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- === User lifecycle helpers ===
CREATE OR REPLACE FUNCTION auth_touch_user_activity(
  p_user_id uuid,
  p_at timestamptz DEFAULT now_utc()
) RETURNS void AS $$
BEGIN
  UPDATE auth.users
  SET last_activity_at = COALESCE(p_at, now_utc()),
      updated_at = now_utc()
  WHERE id = p_user_id
    AND is_archived = false;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION auth_archive_inactive_users(
  p_days integer DEFAULT 90
) RETURNS TABLE (id uuid, email text, username text) AS $$
BEGIN
  RETURN QUERY
  UPDATE auth.users u
  SET is_archived = true,
      archived_at = now_utc(),
      is_deleted = true,
      deleted_at = COALESCE(u.deleted_at, now_utc()),
      updated_at = now_utc()
  WHERE u.is_archived = false
    AND COALESCE(u.last_activity_at, u.updated_at, u.created_at) <
      (now_utc() - make_interval(days => p_days))
  RETURNING u.id, u.email::text, u.username::text;
END;
$$ LANGUAGE plpgsql;
