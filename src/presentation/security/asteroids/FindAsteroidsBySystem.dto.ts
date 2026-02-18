import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindAsteroidsBySystemDTO = z.object({
  systemId: z.string().regex(REGEXP.uuid),
});

export type FindAsteroidsBySystemDTO = z.infer<typeof FindAsteroidsBySystemDTO>;
