import { z } from "zod";
import { REGEXP } from "../../utils/Regexp";

export const ChangeUsernameDTO = z.object({
  newUsername: z.string().min(3).max(30),
});

export type ChangeUsernameDTO = z.infer<typeof ChangeUsernameDTO>;
