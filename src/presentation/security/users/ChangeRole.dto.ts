import { z } from "zod";

export const ChangeRoleDTO = z.object({
  newRole: z.enum(["User", "Admin"]),
});

export type ChangeRoleDTO = z.infer<typeof ChangeRoleDTO>;
