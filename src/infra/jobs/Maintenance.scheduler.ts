import { Queryable } from "../../config/db/Queryable";
import {
  MaintenanceConfig,
  resolveMaintenanceConfig,
} from "../../config/maintenance/Maintenance.config";

type MaintenanceTask = {
  key: string;
  intervalMs: number;
  run: () => Promise<Record<string, unknown>>;
};

export class MaintenanceScheduler {
  private readonly timers: NodeJS.Timeout[] = [];
  private readonly inFlight = new Set<string>();
  private started = false;

  constructor(
    private readonly db: Queryable,
    private readonly config: MaintenanceConfig = resolveMaintenanceConfig(),
    private readonly logger: Pick<Console, "info" | "warn" | "error"> = console,
  ) {}

  async start(): Promise<void> {
    if (!this.config.enabled || this.started) return;

    const tasks: MaintenanceTask[] = [
      {
        key: "maintenance.housekeeping",
        intervalMs: this.config.housekeepingIntervalMs,
        run: async () => this.runHousekeeping(),
      },
      {
        key: "maintenance.users.archive_inactive",
        intervalMs: this.config.usersArchiveIntervalMs,
        run: async () => this.runUsersArchive(),
      },
      {
        key: "maintenance.partition_plan.refresh",
        intervalMs: this.config.partitionPlanIntervalMs,
        run: async () => this.runPartitionPlanRefresh(),
      },
    ];

    for (const task of tasks) {
      this.scheduleTask(task);
    }

    this.started = true;
  }

  stop(): void {
    for (const timer of this.timers) {
      clearInterval(timer);
    }
    this.timers.length = 0;
    this.inFlight.clear();
    this.started = false;
  }

  async runHousekeeping(): Promise<Record<string, unknown>> {
    const result = await this.db.query<{ result: unknown }>(
      `SELECT logs_run_maintenance_housekeeping($1, $2, $3, $4) AS result`,
      [
        this.config.usersArchiveDays,
        this.config.logsArchiveDays,
        this.config.metricsArchiveDays,
        this.config.donationsArchiveDays,
      ],
    );

    return {
      result: result.rows[0]?.result ?? {},
    };
  }

  async runUsersArchive(): Promise<Record<string, unknown>> {
    const result = await this.db.query<{ total: number }>(
      `SELECT COUNT(*)::int AS total FROM auth_archive_inactive_users($1)`,
      [this.config.usersArchiveDays],
    );

    return {
      usersArchived: Number(result.rows[0]?.total ?? 0),
      thresholdDays: this.config.usersArchiveDays,
    };
  }

  async runPartitionPlanRefresh(): Promise<Record<string, unknown>> {
    const result = await this.db.query<{ rows_upserted: number }>(
      `SELECT logs_refresh_archive_partition_plan()::bigint AS rows_upserted`,
    );

    return {
      rowsUpserted: Number(result.rows[0]?.rows_upserted ?? 0),
    };
  }

  private scheduleTask(task: MaintenanceTask): void {
    const run = async () => {
      await this.runTask(task);
    };

    if (this.config.runOnStart) {
      void run();
    }

    const timer = setInterval(() => {
      void run();
    }, Math.max(task.intervalMs, 1_000));

    this.timers.push(timer);
  }

  private async runTask(task: MaintenanceTask): Promise<void> {
    if (this.inFlight.has(task.key)) {
      this.logger.warn(`[MAINTENANCE] skip overlapping run for ${task.key}`);
      return;
    }

    this.inFlight.add(task.key);
    const startedAt = new Date();

    try {
      const details = await task.run();
      await this.persistRun(task.key, startedAt, true, details, null);
      this.logger.info(`[MAINTENANCE] ${task.key} completed`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await this.persistRun(task.key, startedAt, false, {}, message);
      this.logger.error(`[MAINTENANCE] ${task.key} failed: ${message}`);
    } finally {
      this.inFlight.delete(task.key);
    }
  }

  private async persistRun(
    jobKey: string,
    startedAt: Date,
    success: boolean,
    details: Record<string, unknown>,
    errorMessage: string | null,
  ): Promise<void> {
    try {
      await this.db.query(
        `
        INSERT INTO logs.maintenance_job_runs (
          job_key,
          started_at,
          finished_at,
          success,
          details,
          error_message
        )
        VALUES ($1, $2, now_utc(), $3, $4::jsonb, $5)
        `,
        [jobKey, startedAt, success, JSON.stringify(details), errorMessage],
      );
    } catch {
      return;
    }
  }
}
