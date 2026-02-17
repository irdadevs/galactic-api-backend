import { z } from "zod";

export const ChangeGalaxyNameDTO = z.object({
  name: z.string().min(5).max(15),
});

export type ChangeGalaxyNameDTO = z.infer<typeof ChangeGalaxyNameDTO>;
