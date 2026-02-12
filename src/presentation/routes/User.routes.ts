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
      before: [
        auth.requireAuth(),
        auth.requireRoles("Admin"),
        // scope.sameUserParam("userId"),
      ],
      handler: ctrl.health,
    },
  ];
}
