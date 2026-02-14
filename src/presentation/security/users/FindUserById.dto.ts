import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const FindUserByIdDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type FindUserByIdDTO = z.infer<typeof FindUserByIdDTO>;
