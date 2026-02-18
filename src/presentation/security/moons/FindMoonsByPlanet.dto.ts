import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindMoonsByPlanetDTO = z.object({
  planetId: z.string().regex(REGEXP.uuid),
});

export type FindMoonsByPlanetDTO = z.infer<typeof FindMoonsByPlanetDTO>;
