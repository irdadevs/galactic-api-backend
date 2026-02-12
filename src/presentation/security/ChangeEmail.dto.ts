import { z } from "zod";

export const ChangeEmailDTO = z.object({
  userId: z.string().uuid(),
  newEmail: z.string().email(),
});

export type ChangeEmailDTO = z.infer<typeof ChangeEmailDTO>;
