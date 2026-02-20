import { z } from "zod";

export const FindDonationByIdDTO = z.object({
  id: z.uuid(),
});

export type FindDonationByIdDTO = z.infer<typeof FindDonationByIdDTO>;
