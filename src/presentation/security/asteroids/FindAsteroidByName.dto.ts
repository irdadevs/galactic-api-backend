import { z } from "zod";

export const FindAsteroidByNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type FindAsteroidByNameDTO = z.infer<typeof FindAsteroidByNameDTO>;
