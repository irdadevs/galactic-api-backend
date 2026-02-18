import { ICache } from "../../interfaces/Cache.port";
import { Star } from "../../../domain/aggregates/Star";
import {
  CachedListStarsBySystemResult,
  CachedStar,
  STAR_CACHE_POLICY,
  StarCacheKeys,
  deserializeStarFromCache,
  serializeStarForCache,
} from "../../../utils/cache/StarCache";

type StarIdentitySnapshot = {
  name: string;
  systemId: string;
};

export class StarCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Star | null> {
    try {
      const cached = await this.cache.get<CachedStar>(StarCacheKeys.byId(id));
      return cached ? deserializeStarFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<Star | null> {
    try {
      const cached = await this.cache.get<CachedStar>(StarCacheKeys.byName(name));
      return cached ? deserializeStarFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setStar(star: Star): Promise<void> {
    const payload = serializeStarForCache(star);
    try {
      await this.cache.set(StarCacheKeys.byId(star.id), payload, STAR_CACHE_POLICY.starTtl);
      await this.cache.set(StarCacheKeys.byName(star.name), payload, STAR_CACHE_POLICY.starTtl);
    } catch {
      return;
    }
  }

  async getListBySystem(systemId: string): Promise<{ rows: Star[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListStarsBySystemResult>(StarCacheKeys.listBySystem(systemId));
      if (!cached) return null;
      return { rows: cached.rows.map(deserializeStarFromCache), total: cached.total };
    } catch {
      return null;
    }
  }

  async setListBySystem(systemId: string, result: { rows: Star[]; total: number }): Promise<void> {
    try {
      await this.cache.set(
        StarCacheKeys.listBySystem(systemId),
        { rows: result.rows.map(serializeStarForCache), total: result.total },
        STAR_CACHE_POLICY.starsListTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(current: Star, previous?: StarIdentitySnapshot): Promise<void> {
    const keys = [
      StarCacheKeys.byId(current.id),
      StarCacheKeys.byName(current.name),
      StarCacheKeys.listBySystem(current.systemId),
    ];

    if (previous) {
      keys.push(StarCacheKeys.byName(previous.name));
      keys.push(StarCacheKeys.listBySystem(previous.systemId));
    }

    try {
      await this.cache.delMany(Array.from(new Set(keys)));
      await this.cache.delByPrefix(StarCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }

  async invalidateForDelete(snapshot: { id: string; name: string; systemId: string }): Promise<void> {
    try {
      await this.cache.delMany([
        StarCacheKeys.byId(snapshot.id),
        StarCacheKeys.byName(snapshot.name),
        StarCacheKeys.listBySystem(snapshot.systemId),
      ]);
      await this.cache.delByPrefix(StarCacheKeys.byNamePrefix());
    } catch {
      return;
    }
  }
}
