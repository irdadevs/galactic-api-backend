import { Donation } from "../../../../domain/aggregates/Donation";
import { DonationCacheService } from "../../../app-services/donations/DonationCache.service";
import { IDonation } from "../../../interfaces/Donation.port";

export class FindDonation {
  constructor(
    private readonly donationRepo: IDonation,
    private readonly donationCache: DonationCacheService,
  ) {}

  async byId(id: string): Promise<Donation | null> {
    const cached = await this.donationCache.getById(id);
    if (cached) return cached;
    const donation = await this.donationRepo.findById(id);
    if (donation) await this.donationCache.setDonation(donation);
    return donation;
  }

  async byProviderSessionId(sessionId: string): Promise<Donation | null> {
    const cached = await this.donationCache.getByProviderSessionId(sessionId);
    if (cached) return cached;
    const donation = await this.donationRepo.findByProviderSessionId(sessionId);
    if (donation) await this.donationCache.setDonation(donation);
    return donation;
  }
}
