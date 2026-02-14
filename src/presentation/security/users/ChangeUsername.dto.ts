import { z } from "zod";

export const ChangeUsernameDTO = z.object({
  newUsername: z.string().min(3).max(30),
});

export type ChangeUsernameDTO = z.infer<typeof ChangeUsernameDTO>;
