import { z } from "zod";

export const ChangeAsteroidSizeDTO = z.object({
  size: z.enum(["small", "medium", "big", "massive"]),
});

export type ChangeAsteroidSizeDTO = z.infer<typeof ChangeAsteroidSizeDTO>;
