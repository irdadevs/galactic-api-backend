import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindPlanetByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindPlanetByIdDTO = z.infer<typeof FindPlanetByIdDTO>;
