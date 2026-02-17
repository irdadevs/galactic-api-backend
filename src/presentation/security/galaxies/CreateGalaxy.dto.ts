import { z } from "zod";

export const CreateGalaxyDTO = z.object({
  name: z.string().min(4).max(14),
  shape: z
    .enum(["spherical", "3-arm spiral", "5-arm spiral", "irregular"])
    .optional(),
  systemCount: z.number().min(1).max(1000),
});

export type CreateGalaxyDTO = z.infer<typeof CreateGalaxyDTO>;
