import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindGalaxyByOwnerDTO = z.object({
  ownerId: z.string().regex(REGEXP.uuid),
});

export type FindGalaxyByOwnerDTO = z.infer<typeof FindGalaxyByOwnerDTO>;
