import { Request, Response, NextFunction } from "express";

export function makeScope() {
  // ensure req.di and base scope
  function attachBaseScope(req: Request, _res: Response, next: NextFunction) {
    if (!req.auth) return next(); // requireAuth should run earlier
    req.scope = req.scope ?? {
      userId: req.auth.userId,
      tenantId: req.auth.tenantId,
    };
    return next();
  }

  /** User isolation: compare a param with req.auth.userId */
  function sameUserParam(id: string) {
    return [
      attachBaseScope,
      (req: Request, res: Response, next: NextFunction) => {
        const p = (req.params?.[id] || req.query?.[id] || req.body?.[id]) as
          | string
          | undefined;
        if (!req.auth)
          return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
        // If route has no userId param, we still keep scope = auth.sub
        if (p && p !== req.auth.userId) {
          return res
            .status(403)
            .json({ ok: false, error: "CROSS_TENANT_FORBIDDEN" });
        }
        // lock scope to the authenticated user
        req.scope = {
          ...(req.scope ?? {}),
          userId: req.auth.userId,
          tenantId: req.auth.tenantId,
        };
        next();
      },
    ];
  }

  /** Tenant isolation: compare header or param with req.auth.tenantId */
  function sameTenant(id: string, header = "x-tenant-id") {
    return [
      attachBaseScope,
      (req: Request, res: Response, next: NextFunction) => {
        if (!req.auth)
          return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

        const p = (req.params?.[id] || req.query?.[id] || req.body?.[id]) as
          | string
          | undefined;
        const h = req.header(header) || undefined;
        const tenant = req.auth.tenantId;

        if (tenant && ((p && p !== tenant) || (h && h !== tenant))) {
          return res
            .status(403)
            .json({ ok: false, error: "CROSS_TENANT_FORBIDDEN" });
        }

        req.scope = {
          ...(req.scope ?? {}),
          userId: req.auth.userId,
          tenantId: tenant,
        };
        next();
      },
    ];
  }

  return {
    sameUserParam,
    sameTenant,
  };
}
