import { z } from "zod";

export const FindSystemByNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type FindSystemByNameDTO = z.infer<typeof FindSystemByNameDTO>;
