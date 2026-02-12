import { ISession, Session } from "../../app/interfaces/Session.port";
import { Pool } from "pg";

export class SessionRepo implements ISession {
  constructor(private readonly pool: Pool) {}

  async create(session: Omit<Session, "createdAt">): Promise<void> {
    await this.pool.query(
      `
      INSERT INTO auth.user_sessions (
        id,
        user_id,
        refresh_token_hash,
        user_agent,
        ip,
        is_revoked,
        expires_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      `,
      [
        session.id,
        session.userId,
        session.refreshTokenHash,
        session.userAgent ?? null,
        session.ip ?? null,
        session.isRevoked,
        session.expiresAt,
      ],
    );
  }

  async findById(id: string): Promise<Session | null> {
    const { rows } = await this.pool.query(
      `SELECT * FROM auth.user_sessions WHERE id = $1`,
      [id],
    );

    if (!rows[0]) return null;

    return rows[0];
  }

  async revoke(sessionId: string): Promise<void> {
    await this.pool.query(
      `UPDATE auth.user_sessions SET is_revoked = true WHERE id = $1`,
      [sessionId],
    );
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE auth.user_sessions SET is_revoked = true WHERE user_id = $1`,
      [userId],
    );
  }

  async updateRefreshTokenHash(
    sessionId: string,
    newHash: string,
    newExpiresAt: Date,
  ): Promise<void> {
    await this.pool.query(
      `
      UPDATE auth.user_sessions
      SET refresh_token_hash = $1,
          expires_at = $2
      WHERE id = $3
      `,
      [newHash, newExpiresAt, sessionId],
    );
  }
}
