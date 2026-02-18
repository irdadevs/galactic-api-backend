import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindSystemsByGalaxyDTO = z.object({
  galaxyId: z.string().regex(REGEXP.uuid),
});

export type FindSystemsByGalaxyDTO = z.infer<typeof FindSystemsByGalaxyDTO>;
