import { z } from "zod";

export const FindMoonByNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type FindMoonByNameDTO = z.infer<typeof FindMoonByNameDTO>;
