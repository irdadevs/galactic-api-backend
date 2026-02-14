import { z } from "zod";

export const VerifyDTO = z.object({
  email: z.email(),
  code: z.string().length(8),
});

export type VerifyDTO = z.infer<typeof VerifyDTO>;
