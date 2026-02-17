import { z } from "zod";

export const ListGalaxiesDTO = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  orderBy: z.enum(["createdAt", "name", "shape", "owner"]).optional(),
  orderDir: z.enum(["asc", "desc"]).optional(),
});

export type ListGalaxiesDTO = z.infer<typeof ListGalaxiesDTO>;
