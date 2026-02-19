import { z } from "zod";

export const TrackMetricDTO = z.object({
  metricName: z.string().min(1).max(120),
  metricType: z.enum(["http", "db", "use_case", "cache", "infra"]),
  source: z.string().min(1).max(120),
  durationMs: z.number().min(0),
  success: z.boolean().optional(),
  userId: z.uuid().nullable().optional(),
  requestId: z.string().max(120).nullable().optional(),
  tags: z.record(z.string(), z.unknown()).optional(),
  context: z.record(z.string(), z.unknown()).optional(),
});

export type TrackMetricDTO = z.infer<typeof TrackMetricDTO>;
