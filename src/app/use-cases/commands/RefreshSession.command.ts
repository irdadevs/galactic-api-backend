import { IJWT } from "../../interfaces/Jwt.port";
import { ISession } from "../../interfaces/Session.port";
import { IHasher } from "../../interfaces/Hasher.port";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";

export class RefreshSession {
  constructor(
    private readonly jwt: IJWT,
    private readonly sessionRepo: ISession,
    private readonly hasher: IHasher,
  ) {}

  async execute(refreshToken: string) {
    const claims = this.jwt.verifyRefreshToken(refreshToken);

    if (!claims.sessionId) {
      throw SharedErrorFactory.presentation("AUTH.INVALID_REFRESH");
    }

    const session = await this.sessionRepo.findById(claims.sessionId);

    if (!session || session.isRevoked) {
      throw SharedErrorFactory.presentation("AUTH.SESSION_INVALID");
    }

    if (session.expiresAt < new Date()) {
      throw SharedErrorFactory.presentation("AUTH.SESSION_EXPIRED");
    }

    const matches = await this.hasher.compare(
      refreshToken,
      session.refreshTokenHash,
    );

    if (!matches) {
      await this.sessionRepo.revoke(session.id);
      throw SharedErrorFactory.presentation("AUTH.REFRESH_REUSED");
    }

    // 🔁 ROTATION

    const newAccessToken = this.jwt.signAccessToken({
      sub: claims.sub,
      kind: claims.kind,
      userRole: claims.userRole,
      tenantId: claims.tenantId,
    });

    const newRefreshToken = this.jwt.signRefreshToken({
      sub: claims.sub,
      kind: claims.kind,
      userRole: claims.userRole,
      tenantId: claims.tenantId,
      sessionId: session.id,
    });

    const newHash = await this.hasher.hash(newRefreshToken);

    await this.sessionRepo.updateRefreshTokenHash(
      session.id,
      newHash,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }
}
