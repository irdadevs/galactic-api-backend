import type { RouteDef } from ".";
import { SystemController } from "../controllers/System.controller";
import { AuthMiddleware } from "../middlewares/Auth.middleware";
import { ScopeMiddleware } from "../middlewares/Scope.middleware.ts";

export function SystemRoutes(
  ctrl: SystemController,
  auth: AuthMiddleware,
  _scope: ScopeMiddleware,
): RouteDef[] {
  return [
    {
      method: "get",
      path: "/galaxy/:galaxyId",
      before: [auth.requireAuth()],
      handler: ctrl.listByGalaxy,
    },
    {
      method: "get",
      path: "/name/:name",
      before: [auth.requireAuth()],
      handler: ctrl.findByName,
    },
    {
      method: "get",
      path: "/position",
      before: [auth.requireAuth()],
      handler: ctrl.findByPosition,
    },
    {
      method: "get",
      path: "/:id",
      before: [auth.requireAuth()],
      handler: ctrl.findById,
    },
    {
      method: "patch",
      path: "/:id/name",
      before: [auth.requireAuth()],
      handler: ctrl.changeName,
    },
    {
      method: "patch",
      path: "/:id/position",
      before: [auth.requireAuth()],
      handler: ctrl.changePosition,
    },
  ];
}
