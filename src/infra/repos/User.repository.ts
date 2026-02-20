import { IUser, ListUsersQuery } from "../../app/interfaces/User.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { paginateFrom } from "../../utils/Pagination";
import { ErrorFactory } from "../../utils/errors/Error.map";
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
      verificationCode: row.verification_code ?? null,
      verificationCodeExpiresAt: row.verification_code_expires_at ?? null,
      verifiedAt: row.verified_at ?? null,
      isDeleted: row.is_deleted,
      isArchived: row.is_archived ?? false,
      deletedAt: row.deleted_at ?? null,
      archivedAt: row.archived_at ?? null,
      lastActivityAt: row.last_activity_at ?? row.updated_at ?? row.created_at,
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
        u.verification_code,
        u.verification_code_expires_at,
        u.verified_at,
        u.is_deleted,
        u.is_archived,
        u.deleted_at,
        u.archived_at,
        u.last_activity_at,
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

  private async attachRole(user: User): Promise<void> {
    const roleRes = await this.db.query(
      `SELECT id FROM auth.roles WHERE key = $1 LIMIT 1`,
      [user.role],
    );

    if (roleRes.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "role",
        id: user.role,
      });
    }

    const roleId = roleRes.rows[0].id;

    await this.db.query(
      `
    INSERT INTO auth.user_roles (user_id, role_id)
    VALUES ($1, $2)
    `,
      [user.id.toString(), roleId],
    );
  }

  private async syncRole(user: User): Promise<void> {
    const roleRes = await this.db.query(
      `SELECT id FROM auth.roles WHERE key = $1 LIMIT 1`,
      [user.role],
    );

    if (roleRes.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "role",
        id: user.role,
      });
    }

    const roleId = roleRes.rows[0].id;

    await this.db.query(
      `
    DELETE FROM auth.user_roles
    WHERE user_id = $1
    `,
      [user.id.toString()],
    );

    await this.db.query(
      `
    INSERT INTO auth.user_roles (user_id, role_id)
    VALUES ($1, $2)
    `,
      [user.id.toString(), roleId],
    );
  }

  async save(user: User): Promise<User> {
    const id = user.id.toString();

    // Check if exists
    const exists = await this.db.query(
      `SELECT 1 FROM auth.users WHERE id = $1`,
      [id],
    );

    if (exists.rowCount === 0) {
      // INSERT
      await this.db.query(
        `
      INSERT INTO auth.users (
        id,
        email,
        hashed_password,
        username,
        is_verified,
        verification_code,
        verification_code_expires_at,
        verified_at,
        is_deleted,
        is_archived,
        deleted_at,
        archived_at,
        last_activity_at,
        created_at,
        updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, now_utc())
      `,
        [
          id,
          user.email.toString(),
          user.passwordHash.toString(),
          user.username.toString(),
          user.isVerified,
          user.verificationCode,
          user.verificationCodeExpiresAt,
          user.verifiedAt,
          user.isDeleted ?? false,
          user.isArchived ?? false,
          user.deletedAt ?? null,
          user.archivedAt ?? null,
          user.lastActivityAt,
          user.createdAt,
        ],
      );

      // Insert role
      await this.attachRole(user);
    } else {
      // UPDATE
      await this.db.query(
        `
      UPDATE auth.users
      SET
        email = $2,
        hashed_password = $3,
        username = $4,
        is_verified = $5,
        verification_code = $6,
        verification_code_expires_at = $7,
        verified_at = $8,
        is_deleted = $9,
        is_archived = $10,
        deleted_at = $11,
        archived_at = $12,
        last_activity_at = $13,
        updated_at = now_utc()
      WHERE id = $1
      `,
        [
          id,
          user.email.toString(),
          user.passwordHash.toString(),
          user.username.toString(),
          user.isVerified,
          user.verificationCode,
          user.verificationCodeExpiresAt,
          user.verifiedAt,
          user.isDeleted ?? false,
          user.isArchived ?? false,
          user.deletedAt ?? null,
          user.archivedAt ?? null,
          user.lastActivityAt,
        ],
      );

      // Update role (si cambió)
      await this.syncRole(user);
    }

    const updated = await this.findById(Uuid.create(user.id));
    if (!updated) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id,
      });
    }

    return updated;
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
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    const user = await this.findById(id);
    if (!user) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
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
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    const user = await this.findById(id);
    if (!user) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
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
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    const user = await this.findById(id);
    if (!user) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }
    return user;
  }

  async changeRole(id: Uuid, role: UserRole): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }

    user.changeRole(role);

    return this.save(user);
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
          u.verification_code,
          u.verification_code_expires_at,
          u.verified_at,
          u.is_deleted,
          u.is_archived,
          u.deleted_at,
          u.archived_at,
          u.last_activity_at,
          u.created_at,
          r.key AS role
        `,
    });

    return { rows: rows.map((row: any) => this.mapRow(row)), total };
  }

  async verify(email: Email): Promise<void> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET is_verified = true,
           verification_code = NULL,
           verification_code_expires_at = NULL,
           verified_at = now_utc(),
           updated_at = now_utc()
       WHERE email = $1`,
      [email.toString()],
    );

    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: email.toString(),
      });
    }
  }

  async softDelete(id: Uuid, at?: Date): Promise<void> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET is_deleted = true,
           deleted_at = COALESCE($2, now_utc()),
           updated_at = now_utc()
       WHERE id = $1`,
      [id.toString(), at ?? null],
    );

    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }
  }

  async restore(id: Uuid, _at?: Date): Promise<void> {
    const res = await this.db.query(
      `UPDATE auth.users
       SET is_deleted = false,
           deleted_at = NULL,
           updated_at = now_utc()
       WHERE id = $1
         AND COALESCE(is_archived, false) = false`,
      [id.toString()],
    );

    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "user",
        id: id.toString(),
      });
    }
  }

  async touchActivity(id: Uuid, at?: Date): Promise<void> {
    await this.db.query(
      `SELECT auth_touch_user_activity($1, $2)`,
      [id.toString(), at ?? null],
    );
  }

  async archiveInactive(
    days = 90,
  ): Promise<Array<{ id: string; email: string; username: string }>> {
    const res = await this.db.query<{ id: string; email: string; username: string }>(
      `SELECT * FROM auth_archive_inactive_users($1)`,
      [days],
    );

    return res.rows.map((row) => ({
      id: row.id,
      email: row.email,
      username: row.username,
    }));
  }
}
