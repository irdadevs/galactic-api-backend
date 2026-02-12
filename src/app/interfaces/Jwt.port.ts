import { JwtClaims } from "../../infra/repos/Jwt.repository";

export interface IJWT {
  mustGetSecret(): string;
  signToken(
    claims: Omit<JwtClaims, "iat" | "exp">,
    opts?: { expiresIn?: number | number; issuer?: string; audience?: string },
  ): string;
  verifyToken(
    token: string,
    opts?: { issuer?: string; audience?: string },
  ): JwtClaims;
}
