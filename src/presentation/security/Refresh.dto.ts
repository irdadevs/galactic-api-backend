import { z } from "zod";
import { REGEXP } from "../../utils/Regexp";

export const RefreshDTO = z.object({
  refreshToken: z
    .string()
    .regex(REGEXP.jwt)
    .refine((value) => value.split(".").length === 3),
});

export type RefreshDTO = z.infer<typeof RefreshDTO>;
