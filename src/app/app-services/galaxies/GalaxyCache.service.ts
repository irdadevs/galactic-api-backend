import { ICache } from "../../interfaces/Cache.port";
import { ListGalaxyQuery } from "../../interfaces/Galaxy.port";
import { Galaxy } from "../../../domain/aggregates/Galaxy";
import {
  CachedGalaxy,
  CachedListGalaxiesResult,
  GALAXY_CACHE_POLICY,
  GalaxyCacheKeys,
  deserializeGalaxyFromCache,
  serializeGalaxyForCache,
} from "../../../utils/cache/GalaxyCache";
import type { PopulatedGalaxy } from "../../use-cases/queries/galaxies/PopulateGalaxy.query";

type GalaxyIdentitySnapshot = {
  name: string;
};

export class GalaxyCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Galaxy | null> {
    try {
      const cached = await this.cache.get<CachedGalaxy>(GalaxyCacheKeys.byId(id));
      return cached ? deserializeGalaxyFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByOwner(ownerId: string): Promise<Galaxy | null> {
    try {
      const cached = await this.cache.get<CachedGalaxy>(
        GalaxyCacheKeys.byOwner(ownerId),
      );
      return cached ? deserializeGalaxyFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByName(name: string): Promise<Galaxy | null> {
    try {
      const cached = await this.cache.get<CachedGalaxy>(GalaxyCacheKeys.byName(name));
      return cached ? deserializeGalaxyFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setGalaxy(galaxy: Galaxy): Promise<void> {
    const payload = serializeGalaxyForCache(galaxy);
    const ttl = GALAXY_CACHE_POLICY.galaxyTtl;

    try {
      await this.cache.set(GalaxyCacheKeys.byId(galaxy.id), payload, ttl);
      await this.cache.set(GalaxyCacheKeys.byOwner(galaxy.ownerId), payload, ttl);
      await this.cache.set(GalaxyCacheKeys.byName(galaxy.name), payload, ttl);
    } catch {
      return;
    }
  }

  async getList(
    query: ListGalaxyQuery,
  ): Promise<{ rows: Galaxy[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListGalaxiesResult>(
        GalaxyCacheKeys.list(query),
      );
      if (!cached) return null;
      return {
        rows: cached.rows.map((row) => deserializeGalaxyFromCache(row)),
        total: cached.total,
      };
    } catch {
      return null;
    }
  }

  async setList(
    query: ListGalaxyQuery,
    result: { rows: Galaxy[]; total: number },
  ): Promise<void> {
    const payload: CachedListGalaxiesResult = {
      rows: result.rows.map((row) => serializeGalaxyForCache(row)),
      total: result.total,
    };

    try {
      await this.cache.set(
        GalaxyCacheKeys.list(query),
        payload,
        GALAXY_CACHE_POLICY.galaxiesListTtl,
      );
    } catch {
      return;
    }
  }

  async getPopulate(galaxyId: string): Promise<PopulatedGalaxy | null> {
    try {
      const cached = await this.cache.get<PopulatedGalaxy>(
        GalaxyCacheKeys.populate(galaxyId),
      );
      return cached ?? null;
    } catch {
      return null;
    }
  }

  async setPopulate(galaxyId: string, value: PopulatedGalaxy): Promise<void> {
    try {
      await this.cache.set(
        GalaxyCacheKeys.populate(galaxyId),
        value,
        GALAXY_CACHE_POLICY.populatedGalaxyTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(
    current: Galaxy,
    previous?: GalaxyIdentitySnapshot,
    options?: { invalidateList?: boolean; invalidatePopulate?: boolean },
  ): Promise<void> {
    const keys = [
      GalaxyCacheKeys.byId(current.id),
      GalaxyCacheKeys.byOwner(current.ownerId),
      GalaxyCacheKeys.byName(current.name),
    ];

    if (previous?.name) {
      keys.push(GalaxyCacheKeys.byName(previous.name));
    }

    if (options?.invalidatePopulate ?? true) {
      keys.push(GalaxyCacheKeys.populate(current.id));
    }

    const uniqueKeys = Array.from(new Set(keys));
    const invalidateList = options?.invalidateList ?? true;

    try {
      await this.cache.delMany(uniqueKeys);
      if (invalidateList) {
        await this.cache.delByPrefix(GalaxyCacheKeys.listPrefix());
      }
    } catch {
      return;
    }
  }

  async invalidateForDelete(snapshot: {
    id: string;
    ownerId: string;
    name: string;
  }): Promise<void> {
    try {
      await this.cache.delMany([
        GalaxyCacheKeys.byId(snapshot.id),
        GalaxyCacheKeys.byOwner(snapshot.ownerId),
        GalaxyCacheKeys.byName(snapshot.name),
        GalaxyCacheKeys.populate(snapshot.id),
      ]);
      await this.cache.delByPrefix(GalaxyCacheKeys.listPrefix());
    } catch {
      return;
    }
  }

  async invalidateList(): Promise<void> {
    try {
      await this.cache.delByPrefix(GalaxyCacheKeys.listPrefix());
    } catch {
      return;
    }
  }

  async invalidatePopulate(galaxyId: string): Promise<void> {
    try {
      await this.cache.del(GalaxyCacheKeys.populate(galaxyId));
    } catch {
      return;
    }
  }
}
