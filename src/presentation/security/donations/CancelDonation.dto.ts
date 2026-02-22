import { z } from "zod";

export const CancelDonationDTO = z.object({
  id: z.uuid(),
});

export type CancelDonationDTO = z.infer<typeof CancelDonationDTO>;
