import { z } from "zod";

export const ChangeAsteroidNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type ChangeAsteroidNameDTO = z.infer<typeof ChangeAsteroidNameDTO>;
