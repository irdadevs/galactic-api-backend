import { z } from "zod";

export const ChangePasswordDTO = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

export type ChangePasswordDTO = z.infer<typeof ChangePasswordDTO>;
