import { z } from "zod";

export const ChangeEmailDTO = z.object({
  newEmail: z.email(),
});

export type ChangeEmailDTO = z.infer<typeof ChangeEmailDTO>;
