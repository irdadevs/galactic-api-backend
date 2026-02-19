import { z } from "zod";

export const ListLogsDTO = z.object({
  level: z.enum(["debug", "info", "warn", "error", "critical"]).optional(),
  category: z.enum(["application", "security", "audit", "infrastructure"]).optional(),
  source: z.string().max(80).optional(),
  requestId: z.string().max(120).optional(),
  userId: z.uuid().optional(),
  statusCode: z.coerce.number().int().min(100).max(599).optional(),
  unresolvedOnly: z.coerce.boolean().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().max(120).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(["occurredAt", "level", "category"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});

export type ListLogsDTO = z.infer<typeof ListLogsDTO>;
