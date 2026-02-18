import { z } from "zod";

export const ChangeMoonOrbitalDTO = z.object({
  orbital: z.number().positive(),
});

export type ChangeMoonOrbitalDTO = z.infer<typeof ChangeMoonOrbitalDTO>;
