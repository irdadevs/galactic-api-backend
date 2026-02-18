import { z } from "zod";

export const ChangePlanetOrbitalDTO = z.object({
  orbital: z.number().positive(),
});

export type ChangePlanetOrbitalDTO = z.infer<typeof ChangePlanetOrbitalDTO>;
