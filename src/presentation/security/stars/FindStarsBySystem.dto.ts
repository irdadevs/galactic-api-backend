import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindStarsBySystemDTO = z.object({
  systemId: z.string().regex(REGEXP.uuid),
});

export type FindStarsBySystemDTO = z.infer<typeof FindStarsBySystemDTO>;
