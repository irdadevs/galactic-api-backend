export type JwtClaims = {
  sub: string;
  kind: string;
  userRole?: string;
  tenantId?: string;
  iat?: number;
  exp?: number;
};

export interface IJWT {
  signToken(
    claims: Omit<JwtClaims, "iat" | "exp">,
    opts?: { expiresIn?: string | number; issuer?: string; audience?: string },
  ): string;

  verifyToken(
    token: string,
    opts?: { issuer?: string; audience?: string },
  ): JwtClaims;
}
