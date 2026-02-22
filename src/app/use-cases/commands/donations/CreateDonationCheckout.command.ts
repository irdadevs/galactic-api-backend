import { Donation } from "../../../../domain/aggregates/Donation";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { DonationCacheService } from "../../../app-services/donations/DonationCache.service";
import { IDonation } from "../../../interfaces/Donation.port";
import { IPaymentGateway } from "../../../interfaces/PaymentGateway.port";

export class CreateDonationCheckout {
  constructor(
    private readonly donationRepo: IDonation,
    private readonly paymentGateway: IPaymentGateway,
    private readonly donationCache: DonationCacheService,
  ) {}

  async execute(input: {
    userId: string;
    donationType: "one_time" | "monthly";
    amountMinor: number;
    currency: string;
    successUrl: string;
    cancelUrl: string;
    customerEmail?: string;
  }): Promise<{ checkoutUrl: string; donationId: string; sessionId: string }> {
    if (!input.successUrl || !input.cancelUrl) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "successUrl/cancelUrl",
      });
    }

    const checkout = await this.paymentGateway.createCheckoutSession({
      donationType: input.donationType,
      amountMinor: input.amountMinor,
      currency: input.currency,
      successUrl: input.successUrl,
      cancelUrl: input.cancelUrl,
      customerEmail: input.customerEmail,
      metadata: { userId: input.userId, donationType: input.donationType },
    });

    const donation = Donation.create({
      userId: input.userId,
      donationType: input.donationType,
      amountMinor: input.amountMinor,
      currency: input.currency,
      status: "pending",
      provider: "stripe",
      providerSessionId: checkout.sessionId,
    });

    const saved = await this.donationRepo.save(donation);
    await this.donationCache.invalidateForMutation(saved);

    return {
      checkoutUrl: checkout.url,
      donationId: saved.id,
      sessionId: checkout.sessionId,
    };
  }
}
