import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const SoftDeleteDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type SoftDeleteDTO = z.infer<typeof SoftDeleteDTO>;
