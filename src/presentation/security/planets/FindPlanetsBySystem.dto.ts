import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindPlanetsBySystemDTO = z.object({
  systemId: z.string().regex(REGEXP.uuid),
});

export type FindPlanetsBySystemDTO = z.infer<typeof FindPlanetsBySystemDTO>;
