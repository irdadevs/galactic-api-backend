import { z } from "zod";

export const ChangeStarNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type ChangeStarNameDTO = z.infer<typeof ChangeStarNameDTO>;
