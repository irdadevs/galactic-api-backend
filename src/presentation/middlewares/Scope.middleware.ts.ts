import { NextFunction, Request, Response } from "express";

export class ScopeMiddleware {
  sameUserParam(id: string) {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.auth)
        return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

      const p = req.params?.[id] || req.body?.[id];

      if (p && p !== req.auth.userId)
        return res
          .status(403)
          .json({ ok: false, error: "CROSS_TENANT_FORBIDDEN" });

      req.scope = {
        userId: req.auth.userId,
        tenantId: req.auth.tenantId,
      };

      next();
    };
  }
}
