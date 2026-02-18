import { RequestHandler, Router } from "express";
import { API_VERSION } from "../../utils/constants";
import { UserController } from "../controllers/User.controller";
import { GalaxyController } from "../controllers/Galaxy.controller";
import { SystemController } from "../controllers/System.controller";
import { StarController } from "../controllers/Star.controller";
import { PlanetController } from "../controllers/Planet.controller";
import { MoonController } from "../controllers/Moon.controller";
import { AsteroidController } from "../controllers/Asteroid.controller";
import { UserRoutes } from "./User.routes";
import { GalaxyRoutes } from "./Galaxy.routes";
import { SystemRoutes } from "./System.routes";
import { StarRoutes } from "./Star.routes";
import { PlanetRoutes } from "./Planet.routes";
import { MoonRoutes } from "./Moon.routes";
import { AsteroidRoutes } from "./Asteroid.routes";
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
  starController: StarController;
  planetController: PlanetController;
  moonController: MoonController;
  asteroidController: AsteroidController;
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
  registerRoutes(
    router,
    `${base}/stars`,
    StarRoutes(deps.starController, deps.auth, deps.scope),
  );
  registerRoutes(
    router,
    `${base}/planets`,
    PlanetRoutes(deps.planetController, deps.auth, deps.scope),
  );
  registerRoutes(
    router,
    `${base}/moons`,
    MoonRoutes(deps.moonController, deps.auth, deps.scope),
  );
  registerRoutes(
    router,
    `${base}/asteroids`,
    AsteroidRoutes(deps.asteroidController, deps.auth, deps.scope),
  );

  return router;
}
