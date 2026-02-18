import type { RouteDef } from ".";
import { AsteroidController } from "../controllers/Asteroid.controller";
import { AuthMiddleware } from "../middlewares/Auth.middleware";
import { ScopeMiddleware } from "../middlewares/Scope.middleware.ts";

export function AsteroidRoutes(
  ctrl: AsteroidController,
  auth: AuthMiddleware,
  _scope: ScopeMiddleware,
): RouteDef[] {
  return [
    { method: "get", path: "/system/:systemId", before: [auth.requireAuth()], handler: ctrl.listBySystem },
    { method: "get", path: "/name/:name", before: [auth.requireAuth()], handler: ctrl.findByName },
    { method: "get", path: "/:id", before: [auth.requireAuth()], handler: ctrl.findById },
    { method: "patch", path: "/:id/name", before: [auth.requireAuth()], handler: ctrl.changeName },
    { method: "patch", path: "/:id/type", before: [auth.requireAuth()], handler: ctrl.changeType },
    { method: "patch", path: "/:id/size", before: [auth.requireAuth()], handler: ctrl.changeSize },
    { method: "patch", path: "/:id/orbital", before: [auth.requireAuth()], handler: ctrl.changeOrbital },
  ];
}
