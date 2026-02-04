import { Pool, PoolClient } from "pg";
import type {
  Queryable,
  QueryParams,
  QueryResult,
  QueryResultRow,
} from "./Queryable";
import { SharedErrorFactory } from "../../shared/domain/errors/Error.map";
import { CONSOLE_COLORS } from "../../shared/infrastructure/utils/Chalk";

export const __PG_POOL = Symbol("__pg_pool");
export function getPgPool(q: Queryable): Pool | null {
  return (q as any)?.[__PG_POOL] ?? null;
}

export type PgConfig = {
  connectionString?: string;
  host?: string;
  port?: number;
  user?: string;
  password?: string;
  database?: string;
  ssl?: boolean | { rejectUnauthorized?: boolean };
  max?: number; // pool size
  idleTimeoutMillis?: number;
};

export type Logger = {
  info: (...a: any[]) => void;
  warn: (...a: any[]) => void;
  error: (...a: any[]) => void;
};

// src/platform/db/Postgres.ts

class PgPoolQueryable implements Queryable {
  constructor(private pool: Pool, private log?: Logger) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>> {
    const res = await this.pool.query(sql as any, params as any);
    const rows = Array.isArray((res as any)?.rows)
      ? ((res as any).rows as T[])
      : [];
    const rowCount =
      typeof (res as any)?.rowCount === "number"
        ? (res as any).rowCount
        : rows.length;
    return { rows, rowCount };
  }

  async tx<R>(fn: (q: Queryable) => Promise<R>): Promise<R> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const q: Queryable = new PgClientQueryable(client, this.log);
      const result = await fn(q);
      await client.query("COMMIT");
      return result;
    } catch (err) {
      try {
        await client.query("ROLLBACK");
      } catch {}
      throw err;
    } finally {
      client.release();
    }
  }

  async ping(): Promise<void> {
    await this.pool.query("SELECT 1");
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class PgClientQueryable implements Queryable {
  constructor(private client: PoolClient, private log?: Logger) {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>> {
    const res = await this.client.query(sql as any, params as any);
    const rows = Array.isArray((res as any)?.rows)
      ? ((res as any).rows as T[])
      : [];
    const rowCount =
      typeof (res as any)?.rowCount === "number"
        ? (res as any).rowCount
        : rows.length;
    return { rows, rowCount };
  }

  async tx<R>(fn: (q: Queryable) => Promise<R>): Promise<R> {
    await this.client.query("SAVEPOINT sp_nested");
    try {
      const result = await fn(this);
      await this.client.query("RELEASE SAVEPOINT sp_nested");
      return result;
    } catch (err) {
      await this.client.query("ROLLBACK TO SAVEPOINT sp_nested");
      throw err;
    }
  }

  async ping(): Promise<void> {
    await this.client.query("SELECT 1");
  }

  async close(): Promise<void> {
    // no-op
  }
}

/**
 * Connect with retry (max 5 attempts, exponential backoff).
 * Returns a Queryable bound to a single shared Pool.
 */
export async function connectDb(
  cfg: PgConfig,
  log?: Logger,
  maxAttempts = 5
): Promise<Queryable> {
  const pool = new Pool(cfg);

  let attempt = 0;
  const start = Date.now();

  while (true) {
    attempt++;
    try {
      // quick test connection
      const client = await pool.connect();
      try {
        await client.query("SELECT 1");
      } finally {
        client.release();
      }
      log?.info?.(
        `✅${CONSOLE_COLORS.labelColor("[db]")} ${CONSOLE_COLORS.successColor(
          `connected (attempt ${attempt}, ${Date.now() - start}ms at port ${
            cfg.port
          }).`
        )}`
      );
      break;
    } catch (err) {
      log?.warn?.(
        `⚠️ ${CONSOLE_COLORS.labelColor("[db]")} ${CONSOLE_COLORS.warningColor(
          `connection attempt ${attempt} failed: ${
            (err as any)?.message ?? err
          }`
        )}`
      );
      if (attempt >= maxAttempts) {
        log?.error?.(
          `🔥${CONSOLE_COLORS.labelColor("[db]")} ${CONSOLE_COLORS.errorColor(
            `giving up after max attempts`
          )}`
        );
        await pool.end().catch(() => {});
        throw SharedErrorFactory.infra("SHARED.DATABASE_CONNECTION");
      }
      const backoffMs = Math.min(1000 * 2 ** (attempt - 1), 10_000); // 1s,2s,4s,8s,10s cap
      await sleep(backoffMs);
    }
  }

  const q: Queryable = new PgPoolQueryable(pool, log);
  (q as any)[__PG_POOL] = pool;
  return q;
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
