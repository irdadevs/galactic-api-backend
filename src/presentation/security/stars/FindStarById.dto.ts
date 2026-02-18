import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindStarByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindStarByIdDTO = z.infer<typeof FindStarByIdDTO>;
