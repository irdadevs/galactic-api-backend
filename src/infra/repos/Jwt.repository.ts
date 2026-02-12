import jwt, { Algorithm, SignOptions, VerifyOptions } from "jsonwebtoken";
import { SharedErrorFactory } from "../../utils/errors/Error.map";
import { IJWT } from "../../app/interfaces/Jwt.port";

export type JwtClaims = {
  sub: string; // userId
  kind: string;
  userRole?: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
};

const ALG: Algorithm = "HS256";

export default class JwtService implements IJWT {
  constructor() {}

  private mustGetSecret() {
    const s = process.env.JWT_SECRET;
    if (!s) throw SharedErrorFactory.presentation("SHARED.INVALID_SECRET");
    return s;
  }

  public signToken(
    claims: Omit<JwtClaims, "iat" | "exp">,
    opts?: { expiresIn?: number | number; issuer?: string; audience?: string },
  ): string {
    const secret = this.mustGetSecret();

    const signOpts: SignOptions = {
      algorithm: ALG,
      expiresIn: opts?.expiresIn ?? "24h",
      issuer: opts?.issuer,
      audience: opts?.audience,
    };

    return jwt.sign(claims, secret, signOpts);
  }

  public verifyToken(
    token: string,
    opts?: { issuer?: string; audience?: string },
  ): JwtClaims {
    const secret = this.mustGetSecret();

    const verifyOpts: VerifyOptions = {
      algorithms: [ALG],
      issuer: opts?.issuer,
      audience: opts?.audience,
    };

    const decoded = jwt.verify(token, secret, verifyOpts) as JwtClaims;
    return decoded;
  }
}
