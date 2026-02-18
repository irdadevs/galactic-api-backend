import { z } from "zod";

export const ChangeAsteroidOrbitalDTO = z.object({
  orbital: z.number().positive(),
});

export type ChangeAsteroidOrbitalDTO = z.infer<typeof ChangeAsteroidOrbitalDTO>;
