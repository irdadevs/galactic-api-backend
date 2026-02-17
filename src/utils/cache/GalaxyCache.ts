import { ListGalaxyQuery } from "../../app/interfaces/Galaxy.port";
import { Galaxy } from "../../domain/aggregates/Galaxy";
import { TTL_MAP } from "../TTL.map";

export type CachedGalaxy = {
  id: string;
  ownerId: string;
  name: string;
  shape: "spherical" | "3-arm spiral" | "5-arm spiral" | "irregular";
  systemCount: number;
  createdAt: string;
};

export type CachedListGalaxiesResult = {
  rows: CachedGalaxy[];
  total: number;
};

export const GALAXY_CACHE_POLICY = {
  galaxyTtl: TTL_MAP.twoWeeks,
  galaxiesListTtl: TTL_MAP.oneDay,
  populatedGalaxyTtl: TTL_MAP.oneDay,
} as const;

const GALAXIES_PREFIX = "galaxies";
const GALAXIES_LIST_PREFIX = `${GALAXIES_PREFIX}:list`;
const GALAXIES_POPULATE_PREFIX = `${GALAXIES_PREFIX}:populate`;

export const GalaxyCacheKeys = {
  byId: (id: string): string => `${GALAXIES_PREFIX}:by-id:${id}`,
  byOwner: (ownerId: string): string => `${GALAXIES_PREFIX}:by-owner:${ownerId}`,
  byName: (name: string): string =>
    `${GALAXIES_PREFIX}:by-name:${name.trim().toLowerCase()}`,
  listPrefix: (): string => GALAXIES_LIST_PREFIX,
  list: (query: ListGalaxyQuery): string =>
    `${GALAXIES_LIST_PREFIX}:${JSON.stringify(normalizeListQuery(query))}`,
  populatePrefix: (): string => GALAXIES_POPULATE_PREFIX,
  populate: (id: string): string => `${GALAXIES_POPULATE_PREFIX}:by-id:${id}`,
};

function normalizeListQuery(query: ListGalaxyQuery): ListGalaxyQuery {
  return {
    search: query.search?.trim() || undefined,
    limit: query.limit,
    offset: query.offset,
    orderBy: query.orderBy,
    orderDir: query.orderDir,
  };
}

export function serializeGalaxyForCache(galaxy: Galaxy): CachedGalaxy {
  const json = galaxy.toJSON();
  return {
    ...json,
    createdAt: json.createdAt.toISOString(),
  };
}

export function deserializeGalaxyFromCache(cached: CachedGalaxy): Galaxy {
  return Galaxy.rehydrate({
    id: cached.id,
    ownerId: cached.ownerId,
    name: cached.name,
    shape: cached.shape,
    systemCount: cached.systemCount,
    createdAt: new Date(cached.createdAt),
  });
}
