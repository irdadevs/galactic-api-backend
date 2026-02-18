import { z } from "zod";

export const ChangeStarStarterOrbitalDTO = z.object({
  orbitalStarter: z.number().min(0),
});

export type ChangeStarStarterOrbitalDTO = z.infer<
  typeof ChangeStarStarterOrbitalDTO
>;
