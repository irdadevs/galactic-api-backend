import { z } from "zod";

export const ConfirmDonationBySessionDTO = z.object({
  sessionId: z.string().min(1).max(255),
});

export type ConfirmDonationBySessionDTO = z.infer<typeof ConfirmDonationBySessionDTO>;
