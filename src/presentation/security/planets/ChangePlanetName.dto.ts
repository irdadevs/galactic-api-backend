import { z } from "zod";

export const ChangePlanetNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type ChangePlanetNameDTO = z.infer<typeof ChangePlanetNameDTO>;
