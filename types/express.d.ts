import { Entitlements } from "../modules/auth/application/services/LoadBusinessEntitlements.service";
import type { Container } from "../platform/di/Container";

export type AuthUser = {
  userId: string;
  userRole: string;
  tenantId: string;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser;
      scope?: {
        userId: string;
        tenantId: string;
      };
    }
  }
}
