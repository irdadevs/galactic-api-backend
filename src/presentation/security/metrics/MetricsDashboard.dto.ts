import { z } from "zod";

export const MetricsDashboardDTO = z.object({
  hours: z.coerce.number().int().min(1).max(24 * 30).optional(),
  topLimit: z.coerce.number().int().min(1).max(50).optional(),
});

export type MetricsDashboardDTO = z.infer<typeof MetricsDashboardDTO>;
