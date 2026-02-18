import { Asteroid } from "../../domain/aggregates/Asteroid";
import { TTL_MAP } from "../TTL.map";

export type CachedAsteroid = ReturnType<Asteroid["toJSON"]>;

export type CachedListAsteroidsBySystemResult = {
  rows: CachedAsteroid[];
  total: number;
};

export const ASTEROID_CACHE_POLICY = {
  asteroidTtl: TTL_MAP.oneWeek,
  asteroidsListTtl: TTL_MAP.oneDay,
} as const;

const ASTEROIDS_PREFIX = "asteroids";
const ASTEROIDS_BY_NAME_PREFIX = `${ASTEROIDS_PREFIX}:by-name`;
const ASTEROIDS_LIST_SYSTEM_PREFIX = `${ASTEROIDS_PREFIX}:list-by-system`;

export const AsteroidCacheKeys = {
  byId: (id: string): string => `${ASTEROIDS_PREFIX}:by-id:${id}`,
  byName: (name: string): string => `${ASTEROIDS_BY_NAME_PREFIX}:${name.trim().toLowerCase()}`,
  byNamePrefix: (): string => ASTEROIDS_BY_NAME_PREFIX,
  listBySystem: (systemId: string): string => `${ASTEROIDS_LIST_SYSTEM_PREFIX}:${systemId}`,
  listBySystemPrefix: (): string => ASTEROIDS_LIST_SYSTEM_PREFIX,
};

export function serializeAsteroidForCache(asteroid: Asteroid): CachedAsteroid {
  return asteroid.toJSON();
}

export function deserializeAsteroidFromCache(cached: CachedAsteroid): Asteroid {
  return Asteroid.rehydrate(cached);
}
