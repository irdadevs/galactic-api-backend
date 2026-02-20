import { Donation } from "../../../../domain/aggregates/Donation";
import { DonationCacheService } from "../../../app-services/donations/DonationCache.service";
import { IDonation, ListDonationsQuery } from "../../../interfaces/Donation.port";

export class ListDonations {
  constructor(
    private readonly donationRepo: IDonation,
    private readonly donationCache: DonationCacheService,
  ) {}

  async execute(query: ListDonationsQuery): Promise<{ rows: Donation[]; total: number }> {
    const cached = await this.donationCache.getList(query);
    if (cached) return cached;
    const result = await this.donationRepo.list(query);
    await this.donationCache.setList(query, result);
    return result;
  }
}
