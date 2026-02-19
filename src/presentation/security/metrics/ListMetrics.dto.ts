import { z } from "zod";

export const ListMetricsDTO = z.object({
  metricType: z.enum(["http", "db", "use_case", "cache", "infra"]).optional(),
  metricName: z.string().max(120).optional(),
  source: z.string().max(120).optional(),
  requestId: z.string().max(120).optional(),
  userId: z.uuid().optional(),
  success: z.coerce.boolean().optional(),
  minDurationMs: z.coerce.number().min(0).optional(),
  maxDurationMs: z.coerce.number().min(0).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(["occurredAt", "durationMs", "metricName"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});

export type ListMetricsDTO = z.infer<typeof ListMetricsDTO>;
