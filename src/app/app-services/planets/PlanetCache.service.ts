import { ICache } from "../../interfaces/Cache.port";
import { Planet } from "../../../domain/aggregates/Planet";
import {
  CachedListPlanetsBySystemResult,
  CachedPlanet,
  PLANET_CACHE_POLICY,
  PlanetCacheKeys,
  deserializePlanetFromCache,
  serializePlanetForCache,
} from "../../../utils/cache/PlanetCache";

type PlanetIdentitySnapshot = {
  name: string;
  systemId: string;
};

export class PlanetCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Planet | null> {
    try {
      const cached = await this.cache.get<CachedPlanet>(PlanetCacheKeys.byId(id));
      return cached ? deserializePlanetFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<Planet | null> {
    try {
      const cached = await this.cache.get<CachedPlanet>(PlanetCacheKeys.byName(name));
      return cached ? deserializePlanetFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setPlanet(planet: Planet): Promise<void> {
    const payload = serializePlanetForCache(planet);
    try {
      await this.cache.set(PlanetCacheKeys.byId(planet.id), payload, PLANET_CACHE_POLICY.planetTtl);
      await this.cache.set(PlanetCacheKeys.byName(planet.name), payload, PLANET_CACHE_POLICY.planetTtl);
    } catch {
      return;
    }
  }

  async getListBySystem(systemId: string): Promise<{ rows: Planet[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListPlanetsBySystemResult>(PlanetCacheKeys.listBySystem(systemId));
      if (!cached) return null;
      return { rows: cached.rows.map(deserializePlanetFromCache), total: cached.total };
    } catch {
      return null;
    }
  }

  async setListBySystem(systemId: string, result: { rows: Planet[]; total: number }): Promise<void> {
    try {
      await this.cache.set(
        PlanetCacheKeys.listBySystem(systemId),
        { rows: result.rows.map(serializePlanetForCache), total: result.total },
        PLANET_CACHE_POLICY.planetsListTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(current: Planet, previous?: PlanetIdentitySnapshot): Promise<void> {
    const keys = [
      PlanetCacheKeys.byId(current.id),
      PlanetCacheKeys.byName(current.name),
      PlanetCacheKeys.listBySystem(current.systemId),
    ];

    if (previous) {
      keys.push(PlanetCacheKeys.byName(previous.name));
      keys.push(PlanetCacheKeys.listBySystem(previous.systemId));
    }

    try {
      await this.cache.delMany(Array.from(new Set(keys)));
      await this.cache.delByPrefix(PlanetCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }

  async invalidateForDelete(snapshot: { id: string; name: string; systemId: string }): Promise<void> {
    try {
      await this.cache.delMany([
        PlanetCacheKeys.byId(snapshot.id),
        PlanetCacheKeys.byName(snapshot.name),
        PlanetCacheKeys.listBySystem(snapshot.systemId),
      ]);
      await this.cache.delByPrefix(PlanetCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }
}
