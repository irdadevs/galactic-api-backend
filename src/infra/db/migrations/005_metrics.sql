-- === Metrics ===
CREATE SCHEMA IF NOT EXISTS metrics;

CREATE TABLE IF NOT EXISTS metrics.events (
  id bigserial PRIMARY KEY,
  event_name non_empty_text NOT NULL,
  user_id uuid REFERENCES auth.users (id),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_events_time ON metrics.events (occurred_at);
CREATE INDEX IF NOT EXISTS idx_events_name ON metrics.events (event_name);
CREATE INDEX IF NOT EXISTS idx_events_user ON metrics.events (user_id);

CREATE TABLE IF NOT EXISTS metrics.performance_metrics (
  id bigserial PRIMARY KEY,
  metric_name non_empty_text NOT NULL,
  metric_type non_empty_text NOT NULL,
  source non_empty_text NOT NULL,
  duration_ms numeric NOT NULL CHECK (duration_ms >= 0),
  success boolean NOT NULL DEFAULT true,
  user_id uuid REFERENCES auth.users (id),
  request_id text,
  tags jsonb NOT NULL DEFAULT '{}'::jsonb,
  context jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now_utc ()
);

CREATE INDEX IF NOT EXISTS idx_perf_metrics_time
  ON metrics.performance_metrics (occurred_at);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_type
  ON metrics.performance_metrics (metric_type);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_name
  ON metrics.performance_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_source
  ON metrics.performance_metrics (source);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_success
  ON metrics.performance_metrics (success);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_request
  ON metrics.performance_metrics (request_id);
CREATE INDEX IF NOT EXISTS idx_perf_metrics_duration
  ON metrics.performance_metrics (duration_ms DESC);

CREATE TABLE IF NOT EXISTS metrics.daily_usage (
  event_date date NOT NULL,
  event_name non_empty_text NOT NULL,
  total_count bigint NOT NULL DEFAULT 0,
  PRIMARY KEY (event_date, event_name)
);

DROP TRIGGER IF EXISTS trg_metrics_rollup ON metrics.events;
CREATE TRIGGER trg_metrics_rollup
AFTER INSERT ON metrics.events
FOR EACH ROW
EXECUTE FUNCTION metrics_rollup_daily();
