import { Planet } from "../../domain/aggregates/Planet";
import { TTL_MAP } from "../TTL.map";

export type CachedPlanet = ReturnType<Planet["toJSON"]>;

export type CachedListPlanetsBySystemResult = {
  rows: CachedPlanet[];
  total: number;
};

export const PLANET_CACHE_POLICY = {
  planetTtl: TTL_MAP.oneWeek,
  planetsListTtl: TTL_MAP.oneDay,
} as const;

const PLANETS_PREFIX = "planets";
const PLANETS_BY_NAME_PREFIX = `${PLANETS_PREFIX}:by-name`;
const PLANETS_LIST_SYSTEM_PREFIX = `${PLANETS_PREFIX}:list-by-system`;

export const PlanetCacheKeys = {
  byId: (id: string): string => `${PLANETS_PREFIX}:by-id:${id}`,
  byName: (name: string): string => `${PLANETS_BY_NAME_PREFIX}:${name.trim().toLowerCase()}`,
  byNamePrefix: (): string => PLANETS_BY_NAME_PREFIX,
  listBySystem: (systemId: string): string => `${PLANETS_LIST_SYSTEM_PREFIX}:${systemId}`,
  listBySystemPrefix: (): string => PLANETS_LIST_SYSTEM_PREFIX,
};

export function serializePlanetForCache(planet: Planet): CachedPlanet {
  return planet.toJSON();
}

export function deserializePlanetFromCache(cached: CachedPlanet): Planet {
  return Planet.rehydrate(cached);
}
