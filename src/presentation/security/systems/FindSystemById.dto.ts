import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindSystemByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindSystemByIdDTO = z.infer<typeof FindSystemByIdDTO>;
