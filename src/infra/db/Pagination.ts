import type { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { SharedErrorFactory } from "../../utils/errors/Error.map";

export type OrderDir = "asc" | "desc";

export type SimplePaginateOpts = {
  /** Logical key -> physical column/expression mapping for ORDER BY */
  orderMap: Record<string, string>;
  /** Which key to use (must be in orderMap). If not provided, first key of orderMap is used. */
  orderBy?: string;
  /** Direction, default "asc" */
  orderDir?: OrderDir;
  /** Page size (default 25, min 1, max 100) */
  limit?: number;
  /** Offset (default 0) */
  offset?: number;
  /** SELECT list (default "*") */
  select?: string;
};

export class ParamBag {
  values: any[] = [];
  add(v: any): string {
    this.values.push(v);
    return `$${this.values.length}`;
  }
}

export async function paginateFrom<T extends QueryResultRow = QueryResultRow>(
  db: Queryable,
  fromSql: string, // e.g. "FROM users WHERE business_id = $1 AND deleted_at IS NULL"
  params: any[],
  opts: SimplePaginateOpts,
): Promise<{ rows: T[]; total: number }> {
  const select = opts.select ?? "*";
  const keys = Object.keys(opts.orderMap);
  if (keys.length === 0)
    throw SharedErrorFactory.infra("SHARED.ORDER_MAP_EMPTY");

  const orderKey =
    opts.orderBy && opts.orderMap[opts.orderBy] ? opts.orderBy : keys[0];
  const orderExpr = opts.orderMap[orderKey];

  const dir =
    (opts.orderDir ?? "asc").toLowerCase() === "desc" ? "DESC" : "ASC";
  const limit = clamp(opts.limit ?? 25, 1, 100);
  const offset = Math.max(0, opts.offset ?? 0);

  // Single roundtrip; window count provides total
  const sql = `
    SELECT ${select}, COUNT(*) OVER() AS __total
    ${fromSql}
    ORDER BY ${orderExpr} ${dir}
    LIMIT ${limit} OFFSET ${offset}
  `;

  const res = await db.query<T & { __total?: number }>(sql, params);
  const total = res.rows[0]?.__total ?? 0;
  // Strip __total from rows:
  (res.rows as any[]).forEach((r) => delete (r as any).__total);

  return { rows: res.rows as T[], total };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
