import { z } from "zod";

export const FindStarByNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type FindStarByNameDTO = z.infer<typeof FindStarByNameDTO>;
