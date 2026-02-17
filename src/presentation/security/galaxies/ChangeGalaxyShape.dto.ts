import { z } from "zod";

export const ChangeGalaxyShapeDTO = z.object({
  shape: z.enum(["spherical", "3-arm spiral", "5-arm spiral", "irregular"]),
});

export type ChangeGalaxyShapeDTO = z.infer<typeof ChangeGalaxyShapeDTO>;
