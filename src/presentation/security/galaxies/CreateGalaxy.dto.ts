import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const CreateGalaxyDTO = z.object({
  ownerId: z.regex(REGEXP.uuid),
  name: z.string().min(4).max(14),
  shape: z
    .enum(["spherical", "3-arm spiral", "5-arm spiral", "irregular"])
    .optional(),
  systemCount: z.number().min(1).max(1000),
});

export type CreateGalaxyDTO = z.infer<typeof CreateGalaxyDTO>;
