import { z } from "zod";

export const ResendVerificationDTO = z.object({
  email: z.email(),
});

export type ResendVerificationDTO = z.infer<typeof ResendVerificationDTO>;
