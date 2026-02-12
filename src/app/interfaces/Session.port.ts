export type Session = {
  id: string; // sessionId
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  isRevoked: boolean;
  createdAt: Date;
  expiresAt: Date;
};

export interface ISession {
  create(session: Omit<Session, "createdAt">): Promise<void>;

  findById(id: string): Promise<Session | null>;

  revoke(sessionId: string): Promise<void>;

  revokeAllForUser(userId: string): Promise<void>;

  updateRefreshTokenHash(
    sessionId: string,
    newHash: string,
    newExpiresAt: Date,
  ): Promise<void>;
}
