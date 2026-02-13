import { z } from "zod";

export const ListUsersDTO = z.object({
  includeDeleted: z.boolean().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(["createdAt", "username", "email"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});

export type ListUsersDTO = z.infer<typeof ListUsersDTO>;
