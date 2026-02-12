import { RequestHandler, Router } from "express";
import { API_VERSION } from "../../utils/constants";
import { UserController } from "../controllers/User.controller";
import { UserRoutes } from "./User.routes";
import { AuthMiddleware } from "../middlewares/Auth.middleware";
import { ScopeMiddleware } from "../middlewares/Scope.middleware.ts";

export type ExpressHandler = RequestHandler;
export type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

export type RouteDef = {
  method: HttpMethod;
  path: string;
  /** one or many middlewares */
  before?: ExpressHandler | ExpressHandler[];
  handler: ExpressHandler;
};

function registerRoutes(
  router: Router,
  base: string,
  defs: ReturnType<typeof UserRoutes>,
) {
  for (const def of defs) {
    const path = `${base}${def.path}`;
    const befores = def.before
      ? Array.isArray(def.before)
        ? def.before
        : [def.before]
      : [];
    (router as any)[def.method](path, ...befores, def.handler);
  }
}

export function buildApiRouter(deps: {
  userController: UserController;
  auth: AuthMiddleware;
  scope: ScopeMiddleware;
}): Router {
  const router = Router();
  const base = `/api/v${API_VERSION}`;

  registerRoutes(
    router,
    `${base}/users`,
    UserRoutes(deps.userController, deps.auth, deps.scope),
  );

  registerRoutes(router, `${base}/galaxy`, []);
  registerRoutes(router, `${base}/system`, []);
  registerRoutes(router, `${base}/star`, []);
  registerRoutes(router, `${base}/planet`, []);
  registerRoutes(router, `${base}/moon`, []);
  registerRoutes(router, `${base}/asteroid`, []);

  return router;
}
