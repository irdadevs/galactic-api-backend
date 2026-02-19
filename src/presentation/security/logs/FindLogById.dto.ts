import { z } from "zod";

export const FindLogByIdDTO = z.object({
  id: z.string().regex(/^\d+$/),
});

export type FindLogByIdDTO = z.infer<typeof FindLogByIdDTO>;
