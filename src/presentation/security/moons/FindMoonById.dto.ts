import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindMoonByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindMoonByIdDTO = z.infer<typeof FindMoonByIdDTO>;
