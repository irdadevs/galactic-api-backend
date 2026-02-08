-- === Logs ===
CREATE SCHEMA IF NOT EXISTS logs;

CREATE TABLE IF NOT EXISTS logs.error_log (
  id bigserial PRIMARY KEY,
  source non_empty_text NOT NULL,
  level non_empty_text NOT NULL,
  message non_empty_text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users (id),
  request_id text,
  occurred_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_error_log_time ON logs.error_log (occurred_at);
CREATE INDEX IF NOT EXISTS idx_error_log_user ON logs.error_log (user_id);
CREATE INDEX IF NOT EXISTS idx_error_log_level ON logs.error_log (level);