import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindGalaxyByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindGalaxyByIdDTO = z.infer<typeof FindGalaxyByIdDTO>;
