import { z } from "zod";

export const SignupDTO = z.object({
  email: z.email(),
  username: z.string().min(5).max(30),
  rawPassword: z.string().min(6),
});

export type SignupDTO = z.infer<typeof SignupDTO>;
