import { ListDonationsQuery } from "../../app/interfaces/Donation.port";
import { Donation, DonationStatus, DonationType, PaymentProvider } from "../../domain/aggregates/Donation";
import { TTL_MAP } from "../TTL.map";

export type CachedDonation = {
  id: string;
  userId: string;
  donationType: DonationType;
  amountMinor: number;
  currency: string;
  status: DonationStatus;
  provider: PaymentProvider;
  providerSessionId: string;
  providerCustomerId: string | null;
  providerSubscriptionId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  createdAt: string;
  updatedAt: string;
  canceledAt: string | null;
};

export type CachedListDonationsResult = {
  rows: CachedDonation[];
  total: number;
};

export const DONATION_CACHE_POLICY = {
  donationTtl: TTL_MAP.oneWeek,
  donationsListTtl: TTL_MAP.sixHours,
} as const;

const DONATIONS_PREFIX = "donations";
const DONATIONS_LIST_PREFIX = `${DONATIONS_PREFIX}:list`;

export const DonationCacheKeys = {
  byId: (id: string): string => `${DONATIONS_PREFIX}:by-id:${id}`,
  byProviderSessionId: (sessionId: string): string =>
    `${DONATIONS_PREFIX}:by-provider-session:${sessionId}`,
  listPrefix: (): string => DONATIONS_LIST_PREFIX,
  list: (query: ListDonationsQuery): string =>
    `${DONATIONS_LIST_PREFIX}:${JSON.stringify(normalizeListQuery(query))}`,
};

function normalizeListQuery(query: ListDonationsQuery): ListDonationsQuery {
  return {
    userId: query.userId?.trim() || undefined,
    donationType: query.donationType,
    status: query.status,
    limit: query.limit,
    offset: query.offset,
    orderBy: query.orderBy,
    orderDir: query.orderDir,
  };
}

export function serializeDonationForCache(donation: Donation): CachedDonation {
  const json = donation.toJSON();
  return {
    ...json,
    currentPeriodStart: json.currentPeriodStart
      ? json.currentPeriodStart.toISOString()
      : null,
    currentPeriodEnd: json.currentPeriodEnd
      ? json.currentPeriodEnd.toISOString()
      : null,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
    canceledAt: json.canceledAt ? json.canceledAt.toISOString() : null,
  };
}

export function deserializeDonationFromCache(cached: CachedDonation): Donation {
  return Donation.rehydrate({
    id: cached.id,
    userId: cached.userId,
    donationType: cached.donationType,
    amountMinor: cached.amountMinor,
    currency: cached.currency,
    status: cached.status,
    provider: cached.provider,
    providerSessionId: cached.providerSessionId,
    providerCustomerId: cached.providerCustomerId,
    providerSubscriptionId: cached.providerSubscriptionId,
    currentPeriodStart: cached.currentPeriodStart
      ? new Date(cached.currentPeriodStart)
      : null,
    currentPeriodEnd: cached.currentPeriodEnd
      ? new Date(cached.currentPeriodEnd)
      : null,
    createdAt: new Date(cached.createdAt),
    updatedAt: new Date(cached.updatedAt),
    canceledAt: cached.canceledAt ? new Date(cached.canceledAt) : null,
  });
}
