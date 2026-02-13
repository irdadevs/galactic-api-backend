import type { RouteDef } from ".";
import { UserController } from "../controllers/User.controller";
import { AuthMiddleware } from "../middlewares/Auth.middleware";
import { ScopeMiddleware } from "../middlewares/Scope.middleware.ts";

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
      path: "/login",
      handler: ctrl.login,
    },
    {
      method: "post",
      path: "/token/refresh",
      handler: ctrl.refresh,
    },
    {
      method: "post",
      path: "/logout",
      before: [auth.requireAuth()],
      handler: ctrl.logout,
    },
    {
      method: "post",
      path: "/logout/all",
      before: [auth.requireAuth()],
      handler: ctrl.logoutAll,
    },
    {
      method: "post",
      path: "/signup",
      handler: ctrl.signup,
    },
    {
      method: "patch",
      path: "/me/email",
      before: [auth.requireAuth()],
      handler: ctrl.changeEmail,
    },
    {
      method: "get",
      path: "/me",
      before: [auth.requireAuth()],
      handler: ctrl.me,
    },
    {
      method: "patch",
      path: "/me/password",
      before: [auth.requireAuth()],
      handler: ctrl.changePassword,
    },
    {
      method: "patch",
      path: "/me/username",
      before: [auth.requireAuth()],
      handler: ctrl.changeUsername,
    },
    {
      method: "post",
      path: "/me/verify",
      before: [auth.requireAuth()],
      handler: ctrl.verify,
    },
    {
      method: "delete",
      path: "/me",
      before: [auth.requireAuth()],
      handler: ctrl.selfSoftDelete,
    },
  ];
}
