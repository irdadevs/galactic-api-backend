import { z } from "zod";

export const ChangeStarOrbitalDTO = z.object({
  orbital: z.number().min(0),
});

export type ChangeStarOrbitalDTO = z.infer<typeof ChangeStarOrbitalDTO>;
