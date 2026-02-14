import { z } from "zod";
import { REGEXP } from "../../../utils/Regexp";

export const RestoreDTO = z.object({
  id: z.string().regex(REGEXP.uuid),
});

export type RestoreDTO = z.infer<typeof RestoreDTO>;
