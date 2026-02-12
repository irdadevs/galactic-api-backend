import { z } from "zod";

export const SignupDTO = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(30),
  rawPassword: z.string().min(6),
});

export type SignupDTO = z.infer<typeof SignupDTO>;
