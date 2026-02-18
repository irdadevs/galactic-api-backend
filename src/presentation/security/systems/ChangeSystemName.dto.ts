import { z } from "zod";

export const ChangeSystemNameDTO = z.object({
  name: z.string().min(3).max(25),
});

export type ChangeSystemNameDTO = z.infer<typeof ChangeSystemNameDTO>;
