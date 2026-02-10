import type { RouteDef } from ".";
import { UserController } from "../controllers/User.controller";
import { authHealthHandler } from "../handlers/authHealth.handler";

type Guards = ReturnType<typeof import("../middlewares/auth").makeAuth>;

type Scope = ReturnType<typeof import("../middlewares/scope").makeScope>;

export function UserRoutes(
  ctrl: UserController,
  auth: Guards,
  scope: Scope,
): RouteDef[] {
  return [
    // Integrity check route
    {
      method: "get",
      path: "/health",
      before: [
        ...auth.requireAuth(),
        auth.requireRoles("Admin"),
        // ...scope.sameUserParam("userId"), This is just for remembering, implement when tenant isolationis needed
      ],
      handler: authHealthHandler,
    },
  ];
}
