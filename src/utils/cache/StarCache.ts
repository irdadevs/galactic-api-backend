import { Star } from "../../domain/aggregates/Star";
import { TTL_MAP } from "../TTL.map";

export type CachedStar = ReturnType<Star["toJSON"]>;

export type CachedListStarsBySystemResult = {
  rows: CachedStar[];
  total: number;
};

export const STAR_CACHE_POLICY = {
  starTtl: TTL_MAP.oneWeek,
  starsListTtl: TTL_MAP.oneDay,
} as const;

const STARS_PREFIX = "stars";
const STARS_BY_NAME_PREFIX = `${STARS_PREFIX}:by-name`;
const STARS_LIST_SYSTEM_PREFIX = `${STARS_PREFIX}:list-by-system`;

export const StarCacheKeys = {
  byId: (id: string): string => `${STARS_PREFIX}:by-id:${id}`,
  byName: (name: string): string => `${STARS_BY_NAME_PREFIX}:${name.trim().toLowerCase()}`,
  byNamePrefix: (): string => STARS_BY_NAME_PREFIX,
  listBySystem: (systemId: string): string => `${STARS_LIST_SYSTEM_PREFIX}:${systemId}`,
  listBySystemPrefix: (): string => STARS_LIST_SYSTEM_PREFIX,
};

export function serializeStarForCache(star: Star): CachedStar {
  return star.toJSON();
}

export function deserializeStarFromCache(cached: CachedStar): Star {
  return Star.rehydrate(cached);
}
