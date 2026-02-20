import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { DonationCacheService } from "../../../app-services/donations/DonationCache.service";
import { IDonation } from "../../../interfaces/Donation.port";
import { IPaymentGateway } from "../../../interfaces/PaymentGateway.port";

export class ConfirmDonationBySession {
  constructor(
    private readonly donationRepo: IDonation,
    private readonly paymentGateway: IPaymentGateway,
    private readonly donationCache: DonationCacheService,
  ) {}

  async execute(sessionId: string): Promise<void> {
    const donation = await this.donationRepo.findByProviderSessionId(sessionId);
    if (!donation) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "donation",
        id: sessionId,
      });
    }

    const session = await this.paymentGateway.retrieveCheckoutSession(sessionId);

    if (session.status === "expired") {
      donation.expire();
    } else if (donation.donationType === "one_time") {
      if (session.paymentStatus === "paid") donation.completeOneTime();
      else donation.fail();
    } else {
      if (session.subscriptionId && session.status === "complete") {
        donation.activateRecurring({
          providerCustomerId: session.customerId,
          providerSubscriptionId: session.subscriptionId,
          currentPeriodStart: session.currentPeriodStart,
          currentPeriodEnd: session.currentPeriodEnd,
        });
      } else {
        donation.fail();
      }
    }

    const saved = await this.donationRepo.save(donation);
    await this.donationCache.invalidateForMutation(saved);
  }
}
