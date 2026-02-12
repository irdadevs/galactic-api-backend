import { z } from "zod";

export const LoginDTO = z.object({
  email: z.email(),
  rawPassword: z.string(),
});

export type LoginDTO = z.infer<typeof LoginDTO>;
