import { randomUUID } from "crypto";
import { LoginUser } from "../../use-cases/commands/LoginUser.command";
import { IJWT } from "../../interfaces/Jwt.port";
import { IHasher } from "../../interfaces/Hasher.port";
import { ISession } from "../../interfaces/Session.port";
import { LoginDTO } from "../../../presentation/security/Login.dto";
import { RefreshSession } from "../../use-cases/commands/RefreshSession.command";
import { LogoutSession } from "../../use-cases/commands/LogoutSession.command";
import { LogoutAllSessions } from "../../use-cases/commands/LogoutAllSessions.command";

export class AuthService {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly refreshSession: RefreshSession,
    private readonly logoutSession: LogoutSession,
    private readonly logoutAllSessions: LogoutAllSessions,
    private readonly sessionRepo: ISession,
    private readonly jwt: IJWT,
    private readonly hasher: IHasher,
  ) {}

  async login(dto: LoginDTO, meta?: { userAgent?: string; ip?: string }) {
    const user = await this.loginUser.execute(dto);

    const sessionId = randomUUID();

    const accessToken = this.jwt.signAccessToken({
      sub: user.id,
      kind: "user",
      userRole: user.role,
    });

    const refreshToken = this.jwt.signRefreshToken({
      sub: user.id,
      kind: "user",
      userRole: user.role,
      sessionId,
    });

    const hash = await this.hasher.hash(refreshToken);

    await this.sessionRepo.create({
      id: sessionId,
      userId: user.id,
      refreshTokenHash: hash,
      userAgent: meta?.userAgent,
      ip: meta?.ip,
      isRevoked: false,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  refresh(refreshToken: string) {
    return this.refreshSession.execute(refreshToken);
  }

  logout(sessionId: string) {
    return this.logoutSession.execute(sessionId);
  }

  logoutAll(userId: string) {
    return this.logoutAllSessions.execute(userId);
  }
}
