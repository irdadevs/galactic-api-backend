import { IUser, ListUsersQuery } from "../../app/interfaces/User.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { paginateFrom } from "../../utils/Pagination";
import { SharedErrorFactory } from "../../utils/errors/Error.map";
import {
  Email,
  PasswordHash,
  User,
  Username,
  UserRole,
  Uuid,
} from "../../domain/aggregates/User";

export default class UserRepo implements IUser {
  constructor(private readonly db: Queryable) {}

  private mapRow(row: QueryResultRow): User {
    return User.rehydrate({
      id: row.id,
      email: row.email,
      passwordHash: row.hashed_password,
      username: row.username,
      isVerified: row.is_verified,
      isDeleted: row.is_deleted,
      deletedAt: row.deleted_at ?? null,
      createdAt: row.created_at,
      role: (row.role ?? "User") as UserRole,
    });
  }

  private async findOneBy(
    whereSql: string,
    params: any[],
  ): Promise<User | null> {
    const sql = `
      SELECT
        u.id,
        u.email,
        u.hashed_password,
        u.username,
        u.is_verified,
        u.is_deleted,
        u.deleted_at,
        u.created_at,
        r.key AS role
      FROM auth.users u
      LEFT JOIN auth.user_roles ur ON ur.user_id = u.id
      LEFT JOIN auth.roles r ON r.id = ur.role_id
      ${whereSql}
      LIMIT 1
    `;

    const query = await this.db.query(sql, params);
    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async findById(id: Uuid): Promise<User | null> {
    return this.findOneBy("WHERE u.id = $1", [id.toString()]);
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.findOneBy("WHERE u.email = $1", [email.toString()]);
  }

  async findByUsername(username: Username): Promise<User | null> {
    return this.findOneBy("WHERE u.username = $1", [username.toString()]);
  }

  async changeEmail(id: Uuid, email: Email): Promise<User> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET email = $1, updated_at = now_utc()
       WHERE id = $2`,
      [email.toString(), id.toString()],
    );

    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    const user = await this.findById(id);
    if (!user) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }
    return user;
  }

  async changePassword(id: Uuid, hash: PasswordHash): Promise<User> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET hashed_password = $1, updated_at = now_utc()
       WHERE id = $2`,
      [hash.toString(), id.toString()],
    );

    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    const user = await this.findById(id);
    if (!user) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }
    return user;
  }

  async changeUsername(id: Uuid, username: Username): Promise<User> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET username = $1, updated_at = now_utc()
       WHERE id = $2`,
      [username.toString(), id.toString()],
    );

    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    const user = await this.findById(id);
    if (!user) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }
    return user;
  }

  async list(query: ListUsersQuery): Promise<{ rows: User[]; total: number }> {
    const params: any[] = [];
    const conditions: string[] = [];

    if (!query.includeDeleted) {
      conditions.push("COALESCE(u.is_deleted, false) = false");
    }

    if (query.search && query.search.trim().length > 0) {
      params.push(`%${query.search.trim()}%`);
      const idx = `$${params.length}`;
      conditions.push(`(u.email ILIKE ${idx} OR u.username ILIKE ${idx})`);
    }

    const whereClause = conditions.length
      ? `WHERE ${conditions.join(" AND ")}`
      : "";

    const fromSql = `
      FROM auth.users u
      LEFT JOIN auth.user_roles ur ON ur.user_id = u.id
      LEFT JOIN auth.roles r ON r.id = ur.role_id
      ${whereClause}
    `;

    const orderMap: Record<string, string> = {
      createdAt: "u.created_at",
      username: "u.username",
      email: "u.email",
    };

    const { rows, total } = await paginateFrom(this.db, fromSql, params, {
      orderMap,
      orderBy: query.orderBy,
      orderDir: query.orderDir,
      limit: query.limit,
      offset: query.offset,
      select: `
          u.id,
          u.email,
          u.hashed_password,
          u.username,
          u.is_verified,
          u.is_deleted,
          u.deleted_at,
          u.created_at,
          r.key AS role
        `,
    });

    return { rows: rows.map((row: any) => this.mapRow(row)), total };
  }

  async verify(email: Email): Promise<void> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET is_verified = true, updated_at = now_utc()
       WHERE email = $1`,
      [email.toString()],
    );

    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: email.toString(),
      });
    }
  }

  async softDelete(email: Email, at?: Date): Promise<void> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET is_deleted = true,
           deleted_at = COALESCE($2, now_utc()),
           updated_at = now_utc()
       WHERE email = $1`,
      [email.toString(), at ?? null],
    );

    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: email.toString(),
      });
    }
  }

  async restore(email: Email): Promise<void> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET is_deleted = false,
           deleted_at = NULL,
           updated_at = now_utc()
       WHERE email = $1`,
      [email.toString()],
    );

    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: email.toString(),
      });
    }
  }
}
