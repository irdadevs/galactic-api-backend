import { z } from "zod";

export const FindPlanetByNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type FindPlanetByNameDTO = z.infer<typeof FindPlanetByNameDTO>;
