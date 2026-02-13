import { z } from "zod";
import { REGEXP } from "../../utils/Regexp";

export const LogoutDTO = z.object({
  sessionId: z.string().regex(REGEXP.uuid),
});

export type LogoutDTO = z.infer<typeof LogoutDTO>;
