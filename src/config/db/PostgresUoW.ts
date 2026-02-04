import { Pool, PoolClient } from "pg";
import type {
  Queryable,
  QueryParams,
  QueryResult,
  QueryResultRow,
} from "./Queryable";
import type { UnitOfWork, UnitOfWorkFactory } from "./UnitOfWork";

class PgUnitOfWork implements UnitOfWork {
  constructor(private client: PoolClient) {}

  // Queryable bound to THIS transaction (client)
  readonly db: Queryable = {
    query: async <T extends QueryResultRow = QueryResultRow>(
      sql: string,
      params?: QueryParams
    ): Promise<QueryResult<T>> => {
      const res = await this.client.query<T>(sql, params);
      return { rows: res.rows, rowCount: res.rowCount ?? res.rows.length };
    },

    // Nested tx using SAVEPOINT so callers can call tx() inside a UoW
    tx: async <R>(fn: (q: Queryable) => Promise<R>): Promise<R> => {
      await this.client.query("SAVEPOINT sp_nested");
      try {
        const out = await fn(this.db);
        await this.client.query("RELEASE SAVEPOINT sp_nested");
        return out;
      } catch (err) {
        await this.client.query("ROLLBACK TO SAVEPOINT sp_nested");
        throw err;
      }
    },

    ping: async (): Promise<void> => {
      await this.client.query("SELECT 1");
    },

    close: async (): Promise<void> => {
      // no-op; lifecycle handled by commit/rollback
    },
  };

  async commit(): Promise<void> {
    await this.client.query("COMMIT");
    this.client.release();
  }

  async rollback(): Promise<void> {
    await this.client.query("ROLLBACK");
    this.client.release();
  }
}

export class PgUnitOfWorkFactory implements UnitOfWorkFactory {
  constructor(private pool: Pool) {}

  async start(): Promise<UnitOfWork> {
    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      return new PgUnitOfWork(client);
    } catch (e) {
      client.release();
      throw e;
    }
  }
}
