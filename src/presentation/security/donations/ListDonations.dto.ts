import { z } from "zod";

export const ListDonationsDTO = z.object({
  userId: z.uuid().optional(),
  donationType: z.enum(["one_time", "monthly"]).optional(),
  status: z
    .enum(["pending", "active", "completed", "canceled", "failed", "expired"])
    .optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(["createdAt", "updatedAt", "amountMinor"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});

export type ListDonationsDTO = z.infer<typeof ListDonationsDTO>;
