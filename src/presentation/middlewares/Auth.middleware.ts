// presentation/middlewares/AuthMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { IJWT, JwtOpts } from "../../app/interfaces/Jwt.port";
import { Uuid } from "../../domain/aggregates/User";
import { AUTH_COOKIE_NAMES, getCookie } from "../../utils/Cookies";

export class AuthMiddleware {
  constructor(
    private readonly jwt: IJWT,
    private readonly opts: JwtOpts,
  ) {}

  private getBearer(req: Request): string | null {
    const h = req.header("authorization");
    if (h) {
      const [scheme, token] = h.split(" ");
      if (scheme?.toLowerCase() === "bearer" && token) {
        return token;
      }
    }

    return getCookie(req, AUTH_COOKIE_NAMES.accessToken);
  }

  requireAuth() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = this.getBearer(req);
        if (!token)
          return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

        const claims = this.jwt.verifyAccessToken(token);

        if (!Uuid.isValid(claims.sub))
          return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });

        req.auth = {
          userId: claims.sub,
          userRole: claims.userRole ?? "",
          tenantId: claims.tenantId,
        };

        return next();
      } catch {
        return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
      }
    };
  }

  requireRoles(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.auth)
        return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

      return role === req.auth.userRole
        ? next()
        : res.status(403).json({ ok: false, error: "FORBIDDEN" });
    };
  }
}
