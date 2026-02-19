import { z } from "zod";

export const CreateLogDTO = z.object({
  source: z.string().min(1).max(80),
  level: z.enum(["debug", "info", "warn", "error", "critical"]),
  category: z.enum(["application", "security", "audit", "infrastructure"]),
  message: z.string().min(1).max(1000),
  context: z.record(z.string(), z.unknown()).optional(),
  userId: z.uuid().nullable().optional(),
  requestId: z.string().max(120).nullable().optional(),
  method: z.string().max(12).nullable().optional(),
  path: z.string().max(500).nullable().optional(),
  statusCode: z.number().int().min(100).max(599).nullable().optional(),
  ip: z.string().max(120).nullable().optional(),
  userAgent: z.string().max(500).nullable().optional(),
  tags: z.array(z.string().min(1).max(60)).max(20).optional(),
});

export type CreateLogDTO = z.infer<typeof CreateLogDTO>;
