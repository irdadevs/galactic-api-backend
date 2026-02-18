import { ICache } from "../../interfaces/Cache.port";
import { Moon } from "../../../domain/aggregates/Moon";
import {
  CachedListMoonsByPlanetResult,
  CachedMoon,
  MOON_CACHE_POLICY,
  MoonCacheKeys,
  deserializeMoonFromCache,
  serializeMoonForCache,
} from "../../../utils/cache/MoonCache";

type MoonIdentitySnapshot = {
  name: string;
  planetId: string;
};

export class MoonCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Moon | null> {
    try {
      const cached = await this.cache.get<CachedMoon>(MoonCacheKeys.byId(id));
      return cached ? deserializeMoonFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<Moon | null> {
    try {
      const cached = await this.cache.get<CachedMoon>(MoonCacheKeys.byName(name));
      return cached ? deserializeMoonFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setMoon(moon: Moon): Promise<void> {
    const payload = serializeMoonForCache(moon);
    try {
      await this.cache.set(MoonCacheKeys.byId(moon.id), payload, MOON_CACHE_POLICY.moonTtl);
      await this.cache.set(MoonCacheKeys.byName(moon.name), payload, MOON_CACHE_POLICY.moonTtl);
    } catch {
      return;
    }
  }

  async getListByPlanet(planetId: string): Promise<{ rows: Moon[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListMoonsByPlanetResult>(MoonCacheKeys.listByPlanet(planetId));
      if (!cached) return null;
      return { rows: cached.rows.map(deserializeMoonFromCache), total: cached.total };
    } catch {
      return null;
    }
  }

  async setListByPlanet(planetId: string, result: { rows: Moon[]; total: number }): Promise<void> {
    try {
      await this.cache.set(
        MoonCacheKeys.listByPlanet(planetId),
        { rows: result.rows.map(serializeMoonForCache), total: result.total },
        MOON_CACHE_POLICY.moonsListTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(current: Moon, previous?: MoonIdentitySnapshot): Promise<void> {
    const keys = [
      MoonCacheKeys.byId(current.id),
      MoonCacheKeys.byName(current.name),
      MoonCacheKeys.listByPlanet(current.planetId),
    ];

    if (previous) {
      keys.push(MoonCacheKeys.byName(previous.name));
      keys.push(MoonCacheKeys.listByPlanet(previous.planetId));
    }

    try {
      await this.cache.delMany(Array.from(new Set(keys)));
      await this.cache.delByPrefix(MoonCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }

  async invalidateForDelete(snapshot: { id: string; name: string; planetId: string }): Promise<void> {
    try {
      await this.cache.delMany([
        MoonCacheKeys.byId(snapshot.id),
        MoonCacheKeys.byName(snapshot.name),
        MoonCacheKeys.listByPlanet(snapshot.planetId),
      ]);
      await this.cache.delByPrefix(MoonCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }
}
