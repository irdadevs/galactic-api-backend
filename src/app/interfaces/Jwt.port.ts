export type JwtClaims = {
  sub: string;
  kind: string;
  userRole?: string;
  tenantId?: string;
  sessionId?: string;
  iat?: number;
  exp?: number;
};

export type JwtOpts = {
  issuer?: string;
  audience?: string;
};

export interface IJWT {
  signAccessToken(claims: Omit<JwtClaims, "iat" | "exp">): string;

  signRefreshToken(claims: Omit<JwtClaims, "iat" | "exp">): string;

  verifyAccessToken(token: string): JwtClaims;

  verifyRefreshToken(token: string): JwtClaims;
}
