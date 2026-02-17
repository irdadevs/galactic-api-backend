import { z } from "zod";

export const FindGalaxyByNameDTO = z.object({
  name: z.string().min(5).max(15),
});

export type FindGalaxyByNameDTO = z.infer<typeof FindGalaxyByNameDTO>;
