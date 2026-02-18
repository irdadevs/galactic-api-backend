import { z } from "zod";

export const ChangeStarMainDTO = z.object({
  isMain: z.boolean(),
});

export type ChangeStarMainDTO = z.infer<typeof ChangeStarMainDTO>;
