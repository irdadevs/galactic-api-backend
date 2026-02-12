// presentation/middlewares/AuthMiddleware.ts

import { Request, Response, NextFunction } from "express";
import { IJWT } from "../../app/interfaces/Jwt.port";
import { Uuid } from "../../domain/aggregates/User";

export class AuthMiddleware {
  constructor(
    private readonly jwt: IJWT,
    private readonly config: {
      issuer?: string;
      audience?: string;
    },
  ) {}

  private getBearer(req: Request): string | null {
    const h = req.header("authorization");
    if (!h) return null;
    const [scheme, token] = h.split(" ");
    if (scheme?.toLowerCase() !== "bearer") return null;
    return token;
  }

  requireAuth() {
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const token = this.getBearer(req);
        if (!token)
          return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

        const claims = this.jwt.verifyToken(token, this.config);

        if (!Uuid.isValid(claims.sub))
          return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });

        req.auth = {
          userId: claims.sub,
          userRole: claims.userRole ?? "",
          tenantId: claims.tenantId,
        };

        next();
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
