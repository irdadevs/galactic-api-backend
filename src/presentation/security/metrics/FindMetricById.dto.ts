import { z } from "zod";

export const FindMetricByIdDTO = z.object({
  id: z.string().regex(/^\d+$/),
});

export type FindMetricByIdDTO = z.infer<typeof FindMetricByIdDTO>;
