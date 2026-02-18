import { z } from "zod";

export const ChangeAsteroidTypeDTO = z.object({
  type: z.enum(["single", "cluster"]),
});

export type ChangeAsteroidTypeDTO = z.infer<typeof ChangeAsteroidTypeDTO>;
