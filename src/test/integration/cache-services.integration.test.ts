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
import { Log } from "../../domain/aggregates/Log";
import { LogCacheService } from "../../app/app-services/logs/LogCache.service";
import { Metric } from "../../domain/aggregates/Metric";
import { MetricCacheService } from "../../app/app-services/metrics/MetricCache.service";

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

describe("Integration - LogCacheService", () => {
  test("stores and invalidates log entity/list keys", async () => {
    const cache = new MemoryCache();
    const service = new LogCacheService(cache);
    const log = Log.create({
      source: "http",
      level: "error",
      category: "security",
      message: "Unauthorized access attempt",
      statusCode: 401,
      path: "/api/v1/galaxies",
      method: "GET",
      requestId: "req-1",
      userId: IDS.userA,
      context: { code: "UNAUTHORIZED" },
    });

    await service.setLog(log);
    await service.setList({ category: "security", limit: 10 }, { rows: [log], total: 1 });

    expect(await service.getById(log.id)).not.toBeNull();
    expect(await service.getList({ category: "security", limit: 10 })).not.toBeNull();

    await service.invalidateForMutation(log.id);

    expect(await service.getById(log.id)).toBeNull();
    expect(await service.getList({ category: "security", limit: 10 })).toBeNull();
  });
});

describe("Integration - MetricCacheService", () => {
  test("stores and invalidates metric entity/list/dashboard keys", async () => {
    const cache = new MemoryCache();
    const service = new MetricCacheService(cache);
    const metric = Metric.create({
      metricName: "use_case.galaxy.create",
      metricType: "use_case",
      source: "CreateGalaxy",
      durationMs: 42,
      success: true,
      userId: IDS.userA,
      context: { systemCount: 10 },
    });

    await service.setMetric(metric);
    await service.setList({ metricType: "use_case", limit: 10 }, { rows: [metric], total: 1 });
    await service.setDashboard(
      { hours: 24, topLimit: 10 },
      {
        from: new Date(),
        to: new Date(),
        summary: {
          total: 1,
          avgDurationMs: 42,
          p95DurationMs: 42,
          p99DurationMs: 42,
          maxDurationMs: 42,
          errorRate: 0,
        },
        byType: [],
        topBottlenecks: [],
        recentFailures: [],
      },
    );

    expect(await service.getById(metric.id)).not.toBeNull();
    expect(await service.getList({ metricType: "use_case", limit: 10 })).not.toBeNull();
    expect(await service.getDashboard({ hours: 24, topLimit: 10 })).not.toBeNull();

    await service.invalidateForMutation(metric.id);
    expect(await service.getById(metric.id)).toBeNull();
    expect(await service.getList({ metricType: "use_case", limit: 10 })).toBeNull();
    expect(await service.getDashboard({ hours: 24, topLimit: 10 })).toBeNull();
  });
});
