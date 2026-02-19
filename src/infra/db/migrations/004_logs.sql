-- === Logs ===
CREATE SCHEMA IF NOT EXISTS logs;

CREATE TABLE IF NOT EXISTS logs.error_log (
  id bigserial PRIMARY KEY,
  source non_empty_text NOT NULL,
  level non_empty_text NOT NULL,
  category non_empty_text NOT NULL DEFAULT 'application',
  message non_empty_text NOT NULL,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  user_id uuid REFERENCES auth.users (id),
  request_id text,
  http_method text,
  http_path text,
  status_code integer CHECK (status_code BETWEEN 100 AND 599),
  ip_address text,
  user_agent text,
  fingerprint text,
  tags text[] NOT NULL DEFAULT '{}',
  resolved_at timestamptz,
  resolved_by uuid REFERENCES auth.users(id),
  occurred_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_error_log_time ON logs.error_log (occurred_at);
CREATE INDEX IF NOT EXISTS idx_error_log_user ON logs.error_log (user_id);
CREATE INDEX IF NOT EXISTS idx_error_log_level ON logs.error_log (level);
CREATE INDEX IF NOT EXISTS idx_error_log_category ON logs.error_log (category);
CREATE INDEX IF NOT EXISTS idx_error_log_status_code ON logs.error_log (status_code);
CREATE INDEX IF NOT EXISTS idx_error_log_request_id ON logs.error_log (request_id);
CREATE INDEX IF NOT EXISTS idx_error_log_fingerprint ON logs.error_log (fingerprint);
CREATE INDEX IF NOT EXISTS idx_error_log_resolved_at ON logs.error_log (resolved_at);

-- === Migration log ===
CREATE TABLE IF NOT EXISTS logs.migration_log (
  id bigserial PRIMARY KEY,
  filename text NOT NULL UNIQUE,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now_utc (),
  applied_by text,
  execution_time_ms integer CHECK (execution_time_ms >= 0)
);

CREATE INDEX IF NOT EXISTS idx_migration_log_applied_at
  ON logs.migration_log (applied_at);
