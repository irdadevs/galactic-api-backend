-- Maintenance helpers for production operations

CREATE TABLE IF NOT EXISTS logs.maintenance_job_runs (
  id bigserial PRIMARY KEY,
  job_key text NOT NULL,
  started_at timestamptz NOT NULL,
  finished_at timestamptz NOT NULL DEFAULT now_utc(),
  success boolean NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now_utc()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_job_runs_key_time
  ON logs.maintenance_job_runs (job_key, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_maintenance_job_runs_success
  ON logs.maintenance_job_runs (success, started_at DESC);

CREATE TABLE IF NOT EXISTS logs.archive_partition_plan (
  source_table text NOT NULL,
  month_bucket date NOT NULL,
  rows_count bigint NOT NULL,
  refreshed_at timestamptz NOT NULL DEFAULT now_utc(),
  PRIMARY KEY (source_table, month_bucket)
);

CREATE OR REPLACE FUNCTION logs_refresh_archive_partition_plan()
RETURNS bigint AS $$
DECLARE
  upserted bigint := 0;
BEGIN
  WITH data AS (
    SELECT 'logs.error_log_archive'::text AS source_table,
           date_trunc('month', occurred_at)::date AS month_bucket,
           COUNT(*)::bigint AS rows_count
    FROM logs.error_log_archive
    GROUP BY 1, 2

    UNION ALL

    SELECT 'metrics.performance_metrics_archive'::text AS source_table,
           date_trunc('month', occurred_at)::date AS month_bucket,
           COUNT(*)::bigint AS rows_count
    FROM metrics.performance_metrics_archive
    GROUP BY 1, 2

    UNION ALL

    SELECT 'billing.donations_archive'::text AS source_table,
           date_trunc('month', created_at)::date AS month_bucket,
           COUNT(*)::bigint AS rows_count
    FROM billing.donations_archive
    GROUP BY 1, 2
  )
  INSERT INTO logs.archive_partition_plan (source_table, month_bucket, rows_count, refreshed_at)
  SELECT source_table, month_bucket, rows_count, now_utc()
  FROM data
  ON CONFLICT (source_table, month_bucket)
  DO UPDATE SET
    rows_count = EXCLUDED.rows_count,
    refreshed_at = EXCLUDED.refreshed_at;

  GET DIAGNOSTICS upserted = ROW_COUNT;
  RETURN upserted;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION logs_run_maintenance_housekeeping(
  p_users_archive_days integer DEFAULT 90,
  p_logs_archive_days integer DEFAULT 30,
  p_metrics_archive_days integer DEFAULT 30,
  p_donations_archive_days integer DEFAULT 365
) RETURNS jsonb AS $$
DECLARE
  users_archived bigint := 0;
  logs_archived bigint := 0;
  metrics_archived bigint := 0;
  donations_archived bigint := 0;
  partitions_rows bigint := 0;
BEGIN
  SELECT COUNT(*)::bigint INTO users_archived
  FROM auth_archive_inactive_users(p_users_archive_days);

  SELECT logs_soft_archive_before(now_utc() - make_interval(days => p_logs_archive_days))
  INTO logs_archived;

  SELECT metrics_soft_archive_before(now_utc() - make_interval(days => p_metrics_archive_days))
  INTO metrics_archived;

  SELECT billing_soft_archive_before(now_utc() - make_interval(days => p_donations_archive_days))
  INTO donations_archived;

  SELECT logs_refresh_archive_partition_plan()
  INTO partitions_rows;

  RETURN jsonb_build_object(
    'usersArchived', users_archived,
    'logsArchived', logs_archived,
    'metricsArchived', metrics_archived,
    'donationsArchived', donations_archived,
    'partitionPlanRowsUpserted', partitions_rows,
    'ranAt', now_utc()
  );
END;
$$ LANGUAGE plpgsql;
