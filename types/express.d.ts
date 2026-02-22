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
