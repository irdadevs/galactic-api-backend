import { ICache } from "../../app/interfaces/Cache.port";
import { Star } from "../../domain/aggregates/Star";
import { Planet } from "../../domain/aggregates/Planet";
import { Moon } from "../../domain/aggregates/Moon";
import { Asteroid } from "../../domain/aggregates/Asteroid";
import { StarCacheService } from "../../app/app-services/stars/StarCache.service";
import { PlanetCacheService } from "../../app/app-services/planets/PlanetCache.service";
import { MoonCacheService } from "../../app/app-services/moons/MoonCache.service";
import { AsteroidCacheService } from "../../app/app-services/asteroids/AsteroidCache.service";
import { AsteroidCacheKeys } from "../../utils/cache/AsteroidCache";
import { MoonCacheKeys } from "../../utils/cache/MoonCache";
import { PlanetCacheKeys } from "../../utils/cache/PlanetCache";
import { StarCacheKeys } from "../../utils/cache/StarCache";
import { IDS } from "../helpers/apiTestApp";

class MemoryCache implements ICache {
  private readonly store = new Map<string, unknown>();

  async get<T = unknown>(key: string): Promise<T | null> {
    if (!this.store.has(key)) return null;
    return this.store.get(key) as T;
  }

  async set<T = unknown>(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
  }

  async delMany(keys: string[]): Promise<void> {
    for (const key of keys) {
      this.store.delete(key);
    }
  }

  async delByPrefix(prefix: string): Promise<number> {
    const keys = Array.from(this.store.keys()).filter((k) => k.startsWith(prefix));
    await this.delMany(keys);
    return keys.length;
  }

  async close(): Promise<void> {
    this.store.clear();
  }
}

describe("Integration - StarCacheService", () => {
  test("stores and invalidates star entity/list keys", async () => {
    const cache = new MemoryCache();
    const service = new StarCacheService(cache);
    const star = Star.create({
      systemId: IDS.systemA,
      name: "Heliora",
      orbital: 1,
      orbitalStarter: 0,
    });

    await service.setStar(star);
    await service.setListBySystem(star.systemId, { rows: [star], total: 1 });
    await cache.set(StarCacheKeys.byName("LegacyStar"), { id: "legacy" });

    expect(await service.getById(star.id)).not.toBeNull();
    expect(await service.getListBySystem(star.systemId)).not.toBeNull();

    await service.invalidateForMutation(star, { name: "LegacyStar", systemId: star.systemId });

    expect(await service.getById(star.id)).toBeNull();
    expect(await service.getListBySystem(star.systemId)).toBeNull();
  });
});

describe("Integration - PlanetCacheService", () => {
  test("stores and invalidates planet entity/list keys", async () => {
    const cache = new MemoryCache();
    const service = new PlanetCacheService(cache);
    const planet = Planet.create({
      systemId: IDS.systemA,
      name: "Terranova",
      orbital: 1,
    });

    await service.setPlanet(planet);
    await service.setListBySystem(planet.systemId, { rows: [planet], total: 1 });
    await cache.set(PlanetCacheKeys.byName("LegacyPlanet"), { id: "legacy" });

    expect(await service.getById(planet.id)).not.toBeNull();
    expect(await service.getListBySystem(planet.systemId)).not.toBeNull();

    await service.invalidateForMutation(planet, {
      name: "LegacyPlanet",
      systemId: planet.systemId,
    });

    expect(await service.getById(planet.id)).toBeNull();
    expect(await service.getListBySystem(planet.systemId)).toBeNull();
  });
});

describe("Integration - MoonCacheService", () => {
  test("stores and invalidates moon entity/list keys", async () => {
    const cache = new MemoryCache();
    const service = new MoonCacheService(cache);
    const moon = Moon.create({ planetId: IDS.planetA, name: "Lunara", orbital: 1 });

    await service.setMoon(moon);
    await service.setListByPlanet(moon.planetId, { rows: [moon], total: 1 });
    await cache.set(MoonCacheKeys.byName("LegacyMoon"), { id: "legacy" });

    expect(await service.getById(moon.id)).not.toBeNull();
    expect(await service.getListByPlanet(moon.planetId)).not.toBeNull();

    await service.invalidateForMutation(moon, {
      name: "LegacyMoon",
      planetId: moon.planetId,
    });

    expect(await service.getById(moon.id)).toBeNull();
    expect(await service.getListByPlanet(moon.planetId)).toBeNull();
  });
});

describe("Integration - AsteroidCacheService", () => {
  test("stores and invalidates asteroid entity/list keys", async () => {
    const cache = new MemoryCache();
    const service = new AsteroidCacheService(cache);
    const asteroid = Asteroid.create({ systemId: IDS.systemA, orbital: 1.5 });

    await service.setAsteroid(asteroid);
    await service.setListBySystem(asteroid.systemId, { rows: [asteroid], total: 1 });
    await cache.set(AsteroidCacheKeys.byName("AST-OLD"), { id: "legacy" });

    expect(await service.getById(asteroid.id)).not.toBeNull();
    expect(await service.getListBySystem(asteroid.systemId)).not.toBeNull();

    await service.invalidateForMutation(asteroid, {
      name: "AST-OLD",
      systemId: asteroid.systemId,
    });

    expect(await service.getById(asteroid.id)).toBeNull();
    expect(await service.getListBySystem(asteroid.systemId)).toBeNull();
  });
});
