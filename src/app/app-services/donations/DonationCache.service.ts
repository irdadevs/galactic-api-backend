import { ICache } from "../../interfaces/Cache.port";
import { ListDonationsQuery } from "../../interfaces/Donation.port";
import { Donation } from "../../../domain/aggregates/Donation";
import {
  CachedDonation,
  CachedListDonationsResult,
  DONATION_CACHE_POLICY,
  DonationCacheKeys,
  deserializeDonationFromCache,
  serializeDonationForCache,
} from "../../../utils/cache/DonationCache";

export class DonationCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Donation | null> {
    try {
      const cached = await this.cache.get<CachedDonation>(DonationCacheKeys.byId(id));
      return cached ? deserializeDonationFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByProviderSessionId(sessionId: string): Promise<Donation | null> {
    try {
      const cached = await this.cache.get<CachedDonation>(
        DonationCacheKeys.byProviderSessionId(sessionId),
      );
      return cached ? deserializeDonationFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setDonation(donation: Donation): Promise<void> {
    const payload = serializeDonationForCache(donation);
    try {
      await this.cache.set(
        DonationCacheKeys.byId(donation.id),
        payload,
        DONATION_CACHE_POLICY.donationTtl,
      );
      await this.cache.set(
        DonationCacheKeys.byProviderSessionId(donation.providerSessionId),
        payload,
        DONATION_CACHE_POLICY.donationTtl,
      );
    } catch {
      return;
    }
  }

  async getList(query: ListDonationsQuery): Promise<{ rows: Donation[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListDonationsResult>(DonationCacheKeys.list(query));
      if (!cached) return null;
      return {
        rows: cached.rows.map((row) => deserializeDonationFromCache(row)),
        total: cached.total,
      };
    } catch {
      return null;
    }
  }

  async setList(query: ListDonationsQuery, result: { rows: Donation[]; total: number }): Promise<void> {
    const payload: CachedListDonationsResult = {
      rows: result.rows.map((row) => serializeDonationForCache(row)),
      total: result.total,
    };

    try {
      await this.cache.set(
        DonationCacheKeys.list(query),
        payload,
        DONATION_CACHE_POLICY.donationsListTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(donation: Donation): Promise<void> {
    try {
      await this.cache.delMany([
        DonationCacheKeys.byId(donation.id),
        DonationCacheKeys.byProviderSessionId(donation.providerSessionId),
      ]);
      await this.cache.delByPrefix(DonationCacheKeys.listPrefix());
    } catch {
      return;
    }
  }
}
