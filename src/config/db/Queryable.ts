export type QueryParams = any[] | undefined;

export type QueryResultRow = Record<string, any>;

export interface QueryResult<T extends QueryResultRow = QueryResultRow> {
  rows: T[];
  rowCount: number;
}

export interface Queryable {
  /** Simple parameterized query */
  query<T extends QueryResultRow = QueryResultRow>(
    sql: string,
    params?: QueryParams
  ): Promise<QueryResult<T>>;

  /** Run a transaction; all queries inside share the same client */
  tx<R>(fn: (q: Queryable) => Promise<R>): Promise<R>;

  /** Quick health check */
  ping(): Promise<void>;

  /** Graceful shutdown */
  close(): Promise<void>;
}
