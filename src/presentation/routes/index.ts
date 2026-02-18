import { RequestHandler, Router } from "express";
import { API_VERSION } from "../../utils/constants";
import { UserController } from "../controllers/User.controller";
import { GalaxyController } from "../controllers/Galaxy.controller";
import { SystemController } from "../controllers/System.controller";
import { UserRoutes } from "./User.routes";
import { GalaxyRoutes } from "./Galaxy.routes";
import { SystemRoutes } from "./System.routes";
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
  defs: RouteDef[],
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
  galaxyController: GalaxyController;
  systemController: SystemController;
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

  registerRoutes(
    router,
    `${base}/galaxies`,
    GalaxyRoutes(deps.galaxyController, deps.auth, deps.scope),
  );
  registerRoutes(
    router,
    `${base}/systems`,
    SystemRoutes(deps.systemController, deps.auth, deps.scope),
  );
  registerRoutes(router, `${base}/star`, []);
  registerRoutes(router, `${base}/planet`, []);
  registerRoutes(router, `${base}/moon`, []);
  registerRoutes(router, `${base}/asteroid`, []);

  return router;
}
