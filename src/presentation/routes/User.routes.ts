import type { RouteDef } from ".";
import { UserController } from "../controllers/User.controller";
import { AuthMiddleware } from "../middlewares/Auth.middleware";
import { ScopeMiddleware } from "../middlewares/scope";

export function UserRoutes(
  ctrl: UserController,
  auth: AuthMiddleware,
  scope: ScopeMiddleware,
): RouteDef[] {
  return [
    {
      method: "get",
      path: "/health",
      before: [auth.requireAuth(), auth.requireRoles("Admin")],
      handler: ctrl.health,
    },
    {
      method: "post",
      path: "login",
      handler: ctrl.health, // swith to ctr.login
    },
  ];
}
