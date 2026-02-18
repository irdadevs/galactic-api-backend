import type { RouteDef } from ".";
import { PlanetController } from "../controllers/Planet.controller";
import { AuthMiddleware } from "../middlewares/Auth.middleware";
import { ScopeMiddleware } from "../middlewares/Scope.middleware.ts";

export function PlanetRoutes(
  ctrl: PlanetController,
  auth: AuthMiddleware,
  _scope: ScopeMiddleware,
): RouteDef[] {
  return [
    { method: "get", path: "/system/:systemId", before: [auth.requireAuth()], handler: ctrl.listBySystem },
    { method: "get", path: "/name/:name", before: [auth.requireAuth()], handler: ctrl.findByName },
    { method: "get", path: "/:id", before: [auth.requireAuth()], handler: ctrl.findById },
    { method: "patch", path: "/:id/name", before: [auth.requireAuth()], handler: ctrl.changeName },
    { method: "patch", path: "/:id/orbital", before: [auth.requireAuth()], handler: ctrl.changeOrbital },
    { method: "patch", path: "/:id/biome", before: [auth.requireAuth()], handler: ctrl.changeBiome },
  ];
}
