import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindAsteroidByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindAsteroidByIdDTO = z.infer<typeof FindAsteroidByIdDTO>;
