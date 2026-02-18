import { z } from "zod";

export const FindSystemByPositionDTO = z.object({
  x: z.coerce.number(),
  y: z.coerce.number(),
  z: z.coerce.number(),
});

export type FindSystemByPositionDTO = z.infer<typeof FindSystemByPositionDTO>;
