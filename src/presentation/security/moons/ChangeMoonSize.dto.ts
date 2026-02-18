import { z } from "zod";

export const ChangeMoonSizeDTO = z.object({
  size: z.enum(["dwarf", "medium", "giant"]),
});

export type ChangeMoonSizeDTO = z.infer<typeof ChangeMoonSizeDTO>;
