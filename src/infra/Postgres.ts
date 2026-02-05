import { Pool } from "pg";
import type {
  Queryable,
  QueryParams,
  QueryResult,
  QueryResultRow,
  PgConfig,
} from "../config/db/Queryable";
import { SharedErrorFactory } from "../utils/errors/Error.map";
import { CONSOLE_COLORS } from "../utils/Chalk";

export type Logger = {
  info: (...a: any[]) => void;
  warn: (...a: any[]) => void;
  error: (...a: any[]) => void;
};

export class PgPoolQueryable implements Queryable {
  private constructor(
    private readonly pool: Pool,
    private readonly log?: Logger,
  ) {}

  static async connect(
    cfg: PgConfig,
    log?: Logger,
    maxAttempts = 5,
  ): Promise<PgPoolQueryable> {
    const pool = new Pool(cfg);

    let attempt = 0;
    const start = Date.now();

    while (true) {
      attempt++;
      try {
        const client = await pool.connect();
        try {
          await client.query("SELECT 1");
        } finally {
          client.release();
        }

        log?.info?.(
          `✅${CONSOLE_COLORS.labelColor("[db]")} ${CONSOLE_COLORS.successColor(
            `connected (attempt ${attempt}, ${Date.now() - start}ms at port ${cfg.port}).`,
          )}`,
        );
        break;
      } catch (err) {
        log?.warn?.(
          `⚠️ ${CONSOLE_COLORS.labelColor("[db]")} ${CONSOLE_COLORS.warningColor(
            `connection attempt ${attempt} failed. Retrying...`,
          )}`,
        );

        if (attempt >= maxAttempts) {
          log?.error?.(
            `🔥${CONSOLE_COLORS.labelColor("[db]")} ${CONSOLE_COLORS.errorColor(
              `giving up after max attempts`,
            )}`,
          );
          await pool.end().catch(() => {});
          throw SharedErrorFactory.infra("SHARED.DATABASE_CONNECTION");
        }

        const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 10_000);
        await sleep(backoffMs);
      }
    }

    return new PgPoolQueryable(pool, log);
  }

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: QueryParams,
  ): Promise<QueryResult<T>> {
    const res = await this.pool.query<T>(sql as any, params as any);

    const rows = Array.isArray(res.rows) ? (res.rows as T[]) : [];

    return {
      rows,
      rowCount: typeof res.rowCount === "number" ? res.rowCount : rows.length,
    };
  }

  async ping(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }

  /** internal escape hatch for UoW factory */
  _getPool(): Pool {
    return this.pool;
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
