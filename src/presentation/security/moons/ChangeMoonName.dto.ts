import { z } from "zod";

export const ChangeMoonNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type ChangeMoonNameDTO = z.infer<typeof ChangeMoonNameDTO>;
