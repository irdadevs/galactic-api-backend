import { z } from "zod";

export const ChangePasswordDTO = z.object({
  userId: z.string().uuid(),
  currentPassword: z.string(),
  newPassword: z.string().min(6),
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;
