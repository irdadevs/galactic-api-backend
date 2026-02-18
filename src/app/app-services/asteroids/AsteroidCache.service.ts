import { ICache } from "../../interfaces/Cache.port";
import { Asteroid } from "../../../domain/aggregates/Asteroid";
import {
  ASTEROID_CACHE_POLICY,
  AsteroidCacheKeys,
  CachedAsteroid,
  CachedListAsteroidsBySystemResult,
  deserializeAsteroidFromCache,
  serializeAsteroidForCache,
} from "../../../utils/cache/AsteroidCache";

type AsteroidIdentitySnapshot = {
  name: string;
  systemId: string;
};

export class AsteroidCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Asteroid | null> {
    try {
      const cached = await this.cache.get<CachedAsteroid>(AsteroidCacheKeys.byId(id));
      return cached ? deserializeAsteroidFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<Asteroid | null> {
    try {
      const cached = await this.cache.get<CachedAsteroid>(AsteroidCacheKeys.byName(name));
      return cached ? deserializeAsteroidFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setAsteroid(asteroid: Asteroid): Promise<void> {
    const payload = serializeAsteroidForCache(asteroid);
    try {
      await this.cache.set(AsteroidCacheKeys.byId(asteroid.id), payload, ASTEROID_CACHE_POLICY.asteroidTtl);
      await this.cache.set(AsteroidCacheKeys.byName(asteroid.name), payload, ASTEROID_CACHE_POLICY.asteroidTtl);
    } catch {
      return;
    }
  }

  async getListBySystem(systemId: string): Promise<{ rows: Asteroid[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListAsteroidsBySystemResult>(AsteroidCacheKeys.listBySystem(systemId));
      if (!cached) return null;
      return { rows: cached.rows.map(deserializeAsteroidFromCache), total: cached.total };
    } catch {
      return null;
    }
  }

  async setListBySystem(systemId: string, result: { rows: Asteroid[]; total: number }): Promise<void> {
    try {
      await this.cache.set(
        AsteroidCacheKeys.listBySystem(systemId),
        { rows: result.rows.map(serializeAsteroidForCache), total: result.total },
        ASTEROID_CACHE_POLICY.asteroidsListTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(current: Asteroid, previous?: AsteroidIdentitySnapshot): Promise<void> {
    const keys = [
      AsteroidCacheKeys.byId(current.id),
      AsteroidCacheKeys.byName(current.name),
      AsteroidCacheKeys.listBySystem(current.systemId),
    ];

    if (previous) {
      keys.push(AsteroidCacheKeys.byName(previous.name));
      keys.push(AsteroidCacheKeys.listBySystem(previous.systemId));
    }

    try {
      await this.cache.delMany(Array.from(new Set(keys)));
      await this.cache.delByPrefix(AsteroidCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }

  async invalidateForDelete(snapshot: { id: string; name: string; systemId: string }): Promise<void> {
    try {
      await this.cache.delMany([
        AsteroidCacheKeys.byId(snapshot.id),
        AsteroidCacheKeys.byName(snapshot.name),
        AsteroidCacheKeys.listBySystem(snapshot.systemId),
      ]);
      await this.cache.delByPrefix(AsteroidCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }
}
