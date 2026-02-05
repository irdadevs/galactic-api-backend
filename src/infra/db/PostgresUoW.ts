import { Pool, PoolClient } from "pg";
import type {
  Queryable,
  QueryResultRow,
  QueryResult,
  QueryParams,
} from "../../config/db/Queryable";
import type { UnitOfWork, UnitOfWorkFactory } from "../../config/db/UnitOfWork";

class PgClientQueryable implements Queryable {
  constructor(private client: PoolClient) {}

  async connect(): Promise<void> {}

  async query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: QueryParams,
  ): Promise<QueryResult<T>> {
    const res = await this.client.query<T>(sql, params);

    const rows = Array.isArray(res.rows) ? res.rows : [];

    return {
      rows,
      rowCount: typeof res.rowCount === "number" ? res.rowCount : rows.length,
    };
  }

  async ping(): Promise<void> {
    await this.client.query("SELECT 1");
  }

  async close(): Promise<void> {}
}

class PgUnitOfWork implements UnitOfWork {
  readonly db: Queryable;

  constructor(private client: PoolClient) {
    this.db = new PgClientQueryable(client);
  }

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
