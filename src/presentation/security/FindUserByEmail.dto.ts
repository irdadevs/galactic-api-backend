import { z } from "zod";

export const FindUserByEmailDTO = z.object({
  email: z.email(),
});

export type FindUserByEmailDTO = z.infer<typeof FindUserByEmailDTO>;
