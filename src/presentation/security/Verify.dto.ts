import { z } from "zod";

export const VerifyDTO = z.object({
  email: z.string().email(),
  code: z.string().length(6), // suponiendo código de verificación de 6 dígitos
});

export type VerifyDTO = z.infer<typeof VerifyDTO>;
