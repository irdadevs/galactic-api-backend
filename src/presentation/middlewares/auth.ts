// platform/http/auth.ts
import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../infra/repos/Jwt.repository";
import { Uuid } from "../../domain/aggregates/User";

/** Pull Bearer token from Authorization header */
function getBearer(req: Request): string | null {
  const h = req.header("authorization") || req.header("Authorization");
  if (!h) return null;
  const [scheme, token] = h.split(" ");
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") return null;
  return token;
}

/** Factory creates middlewares */
export function makeAuth() {
  /** Hard authentication: 401 if no/invalid token */
  function requireAuth() {
    return [
      async (req: Request, res: Response, next: NextFunction) => {
        try {
          const token = getBearer(req);
          if (!token) {
            return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
          }

          const claims = verifyToken(token, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
          });

          if (!Uuid.isValid(claims.sub)) {
            return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
          }

          req.auth = {
            userId: claims.sub,
            userRole: claims.userRole ?? "",
            tenantId: claims.tenantId,
          };

          next();
        } catch (err) {
          console.error(err);
          return res.status(401).json({ ok: false, error: "INVALID_TOKEN" });
        }
      },
    ];
  }

  /** Soft authentication: attaches req.auth if present, otherwise continues */
  function optionalAuth() {
    return [
      (req: Request, _res: Response, next: NextFunction) => {
        const token = getBearer(req);
        if (!token) return next();
        try {
          const claims = verifyToken(token, {
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE,
          });
          if (!Uuid.isValid(claims.sub)) return next();
          req.auth = {
            userId: claims.sub,
            userRole: claims.userRole ?? "",
            tenantId: claims.tenantId,
          };
        } catch {
          // ignore invalid token for public routes
        }
        next();
      },
    ];
  }

  /** Authorization guard helpers */
  function requireRoles(role: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.auth)
        return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
      const has = role === req.auth.userRole;
      return has
        ? next()
        : res.status(403).json({ ok: false, error: "FORBIDDEN" });
    };
  }

  return {
    requireAuth,
    optionalAuth,
    requireRoles,
  };
}
