import { z } from "zod";

export const ChangeSystemPositionDTO = z.object({
  x: z.number(),
  y: z.number(),
  z: z.number(),
});

export type ChangeSystemPositionDTO = z.infer<typeof ChangeSystemPositionDTO>;
