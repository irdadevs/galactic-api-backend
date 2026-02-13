import { z } from "zod";

export const FindUserByUsernameDTO = z.object({
  username: z.string().min(5),
});

export type FindUserByUsernameDTO = z.infer<typeof FindUserByUsernameDTO>;
