import { Moon } from "../../domain/aggregates/Moon";
import { TTL_MAP } from "../TTL.map";

export type CachedMoon = ReturnType<Moon["toJSON"]>;

export type CachedListMoonsByPlanetResult = {
  rows: CachedMoon[];
  total: number;
};

export const MOON_CACHE_POLICY = {
  moonTtl: TTL_MAP.oneWeek,
  moonsListTtl: TTL_MAP.oneDay,
} as const;

const MOONS_PREFIX = "moons";
const MOONS_BY_NAME_PREFIX = `${MOONS_PREFIX}:by-name`;
const MOONS_LIST_PLANET_PREFIX = `${MOONS_PREFIX}:list-by-planet`;

export const MoonCacheKeys = {
  byId: (id: string): string => `${MOONS_PREFIX}:by-id:${id}`,
  byName: (name: string): string => `${MOONS_BY_NAME_PREFIX}:${name.trim().toLowerCase()}`,
  byNamePrefix: (): string => MOONS_BY_NAME_PREFIX,
  listByPlanet: (planetId: string): string => `${MOONS_LIST_PLANET_PREFIX}:${planetId}`,
  listByPlanetPrefix: (): string => MOONS_LIST_PLANET_PREFIX,
};

export function serializeMoonForCache(moon: Moon): CachedMoon {
  return moon.toJSON();
}

export function deserializeMoonFromCache(cached: CachedMoon): Moon {
  return Moon.rehydrate(cached);
}
