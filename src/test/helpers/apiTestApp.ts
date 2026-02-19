// @ts-nocheck
import Express, { Express as ExpressApp } from "express";
import { AuthMiddleware } from "../../presentation/middlewares/Auth.middleware";
import { ScopeMiddleware } from "../../presentation/middlewares/Scope.middleware.ts";
import { buildApiRouter } from "../../presentation/routes";
import { UserController } from "../../presentation/controllers/User.controller";
import { GalaxyController } from "../../presentation/controllers/Galaxy.controller";
import { SystemController } from "../../presentation/controllers/System.controller";
import { StarController } from "../../presentation/controllers/Star.controller";
import { PlanetController } from "../../presentation/controllers/Planet.controller";
import { MoonController } from "../../presentation/controllers/Moon.controller";
import { AsteroidController } from "../../presentation/controllers/Asteroid.controller";
import { LogController } from "../../presentation/controllers/Log.controller";
import { MetricController } from "../../presentation/controllers/Metric.controller";
import { IJWT, JwtClaims } from "../../app/interfaces/Jwt.port";

export const IDS = {
  admin: "11111111-1111-4111-8111-111111111111",
  userA: "22222222-2222-4222-8222-222222222222",
  userB: "33333333-3333-4333-8333-333333333333",
  galaxyA: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  galaxyB: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  systemA: "aaaaaaaa-0000-4000-8000-aaaaaaaaaaaa",
  systemB: "bbbbbbbb-0000-4000-8000-bbbbbbbbbbbb",
  starA: "aaaaaaaa-1111-4111-8111-aaaaaaaaaaaa",
  starB: "bbbbbbbb-1111-4111-8111-bbbbbbbbbbbb",
  planetA: "aaaaaaaa-2222-4222-8222-aaaaaaaaaaaa",
  planetB: "bbbbbbbb-2222-4222-8222-bbbbbbbbbbbb",
  moonA: "aaaaaaaa-3333-4333-8333-aaaaaaaaaaaa",
  moonB: "bbbbbbbb-3333-4333-8333-bbbbbbbbbbbb",
  asteroidA: "aaaaaaaa-4444-4444-8444-aaaaaaaaaaaa",
  asteroidB: "bbbbbbbb-4444-4444-8444-bbbbbbbbbbbb",
} as const;

type GalaxyEntity = { id: string; ownerId: string; name: string; shape: string };
type SystemEntity = { id: string; galaxyId: string; name: string; x: number; y: number; z: number };
type StarEntity = { id: string; systemId: string; name: string };
type PlanetEntity = { id: string; systemId: string; name: string };
type MoonEntity = { id: string; planetId: string; name: string };
type AsteroidEntity = { id: string; systemId: string; name: string };

class FakeJwt implements IJWT {
  signAccessToken(): string {
    return "";
  }

  signRefreshToken(): string {
    return "";
  }

  verifyAccessToken(token: string): JwtClaims {
    const [sub, userRole] = token.split("|");
    if (!sub || !userRole) {
      throw new Error("Invalid token");
    }
    return { sub, userRole, kind: "access" };
  }

  verifyRefreshToken(): JwtClaims {
    throw new Error("Not implemented");
  }
}

const asId = (value: string | { toString(): string }): string => value.toString();
const asName = (value: string | { toString(): string }): string => value.toString();

export function makeAuthHeader(userId: string, role: "Admin" | "User"): string {
  return `Bearer ${userId}|${role}`;
}

export function buildTestApi(): {
  app: ExpressApp;
  mocks: Record<string, Record<string, jest.Mock>>;
} {
  const galaxies = new Map<string, GalaxyEntity>([
    [IDS.galaxyA, { id: IDS.galaxyA, ownerId: IDS.userA, name: "AlphaPrime", shape: "spherical" }],
    [IDS.galaxyB, { id: IDS.galaxyB, ownerId: IDS.userB, name: "BetaPrime", shape: "irregular" }],
  ]);
  const systems = new Map<string, SystemEntity>([
    [IDS.systemA, { id: IDS.systemA, galaxyId: IDS.galaxyA, name: "A-System", x: 10, y: 20, z: 30 }],
    [IDS.systemB, { id: IDS.systemB, galaxyId: IDS.galaxyB, name: "B-System", x: 15, y: 25, z: 35 }],
  ]);
  const stars = new Map<string, StarEntity>([
    [IDS.starA, { id: IDS.starA, systemId: IDS.systemA, name: "StarA" }],
    [IDS.starB, { id: IDS.starB, systemId: IDS.systemB, name: "StarB" }],
  ]);
  const planets = new Map<string, PlanetEntity>([
    [IDS.planetA, { id: IDS.planetA, systemId: IDS.systemA, name: "PlanetA" }],
    [IDS.planetB, { id: IDS.planetB, systemId: IDS.systemB, name: "PlanetB" }],
  ]);
  const moons = new Map<string, MoonEntity>([
    [IDS.moonA, { id: IDS.moonA, planetId: IDS.planetA, name: "MoonA" }],
    [IDS.moonB, { id: IDS.moonB, planetId: IDS.planetB, name: "MoonB" }],
  ]);
  const asteroids = new Map<string, AsteroidEntity>([
    [IDS.asteroidA, { id: IDS.asteroidA, systemId: IDS.systemA, name: "AST-789" }],
    [IDS.asteroidB, { id: IDS.asteroidB, systemId: IDS.systemB, name: "AST-900" }],
  ]);

  const mocks = {
    healthCheck: {
      execute: jest.fn(async () => ({ service: "auth", status: "ok" })),
    },
    findUser: {
      byId: jest.fn(async () => ({ id: IDS.userA, email: "a@test.com" })),
      byEmail: jest.fn(async () => null),
      byUsername: jest.fn(async () => null),
    },
    listUsers: {
      execute: jest.fn(async () => ({ rows: [], total: 0 })),
    },
    authService: {
      login: jest.fn(async () => ({
        user: { id: IDS.userA, email: "a@test.com", role: "User", isVerified: true },
        accessToken: "a",
        refreshToken: "b",
      })),
      refresh: jest.fn(async () => ({ accessToken: "a2", refreshToken: "b2" })),
      logout: jest.fn(async () => undefined),
      logoutByRefreshToken: jest.fn(async () => undefined),
      logoutAll: jest.fn(async () => undefined),
    },
    platformService: {
      signup: jest.fn(async () => ({ id: IDS.userA, email: "a@test.com", role: "User", isVerified: false })),
      changeEmail: jest.fn(async () => undefined),
      changePassword: jest.fn(async () => undefined),
      changeUsername: jest.fn(async () => undefined),
      changeRole: jest.fn(async () => undefined),
      verify: jest.fn(async () => undefined),
      resendVerification: jest.fn(async () => undefined),
    },
    lifecycleService: {
      softDelete: jest.fn(async () => undefined),
      restore: jest.fn(async () => undefined),
    },
    createGalaxy: {
      execute: jest.fn(async (payload: { ownerId: string; name: string; shape?: string; systemCount: number }) => ({
        id: IDS.galaxyA,
        ownerId: payload.ownerId,
        name: payload.name,
        shape: payload.shape ?? "spherical",
      })),
    },
    changeGalaxyName: { execute: jest.fn(async () => undefined) },
    changeGalaxyShape: { execute: jest.fn(async () => undefined) },
    deleteGalaxy: { execute: jest.fn(async () => undefined) },
    findGalaxy: {
      byId: jest.fn(async (id: string | { toString(): string }) => galaxies.get(asId(id)) ?? null),
      byOwner: jest.fn(async (ownerId: string | { toString(): string }) => {
        const owner = asId(ownerId);
        return Array.from(galaxies.values()).find((g) => g.ownerId === owner) ?? null;
      }),
      byName: jest.fn(async (name: string | { toString(): string }) => {
        const n = asName(name);
        return Array.from(galaxies.values()).find((g) => g.name === n) ?? null;
      }),
    },
    listGalaxies: {
      execute: jest.fn(async () => ({ rows: Array.from(galaxies.values()), total: galaxies.size })),
    },
    populateGalaxy: {
      execute: jest.fn(async (id: string | { toString(): string }) => ({
        galaxy: galaxies.get(asId(id)),
        systems: Array.from(systems.values()).filter((s) => s.galaxyId === asId(id)),
      })),
    },
    findSystem: {
      byId: jest.fn(async (id: string | { toString(): string }) => systems.get(asId(id)) ?? null),
      byName: jest.fn(async (name: string | { toString(): string }) => {
        const n = asName(name);
        return Array.from(systems.values()).find((s) => s.name === n) ?? null;
      }),
      byPosition: jest.fn(async (input: { x: number; y: number; z: number }) =>
        Array.from(systems.values()).find((s) => s.x === input.x && s.y === input.y && s.z === input.z) ?? null,
      ),
    },
    listSystemsByGalaxy: {
      execute: jest.fn(async (galaxyId: string | { toString(): string }) => {
        const id = asId(galaxyId);
        const rows = Array.from(systems.values()).filter((s) => s.galaxyId === id);
        return { rows, total: rows.length };
      }),
    },
    changeSystemName: { execute: jest.fn(async () => undefined) },
    changeSystemPosition: { execute: jest.fn(async () => undefined) },
    findStar: {
      byId: jest.fn(async (id: string | { toString(): string }) => stars.get(asId(id)) ?? null),
      byName: jest.fn(async (name: string | { toString(): string }) => {
        const n = asName(name);
        return Array.from(stars.values()).find((s) => s.name === n) ?? null;
      }),
    },
    listStarsBySystem: {
      execute: jest.fn(async (systemId: string | { toString(): string }) => {
        const id = asId(systemId);
        const rows = Array.from(stars.values()).filter((s) => s.systemId === id);
        return { rows, total: rows.length };
      }),
    },
    changeStarName: { execute: jest.fn(async () => undefined) },
    changeStarMain: { execute: jest.fn(async () => undefined) },
    changeStarOrbital: { execute: jest.fn(async () => undefined) },
    changeStarStarterOrbital: { execute: jest.fn(async () => undefined) },
    findPlanet: {
      byId: jest.fn(async (id: string | { toString(): string }) => planets.get(asId(id)) ?? null),
      byName: jest.fn(async (name: string | { toString(): string }) => {
        const n = asName(name);
        return Array.from(planets.values()).find((s) => s.name === n) ?? null;
      }),
    },
    listPlanetsBySystem: {
      execute: jest.fn(async (systemId: string | { toString(): string }) => {
        const id = asId(systemId);
        const rows = Array.from(planets.values()).filter((s) => s.systemId === id);
        return { rows, total: rows.length };
      }),
    },
    changePlanetName: { execute: jest.fn(async () => undefined) },
    changePlanetOrbital: { execute: jest.fn(async () => undefined) },
    changePlanetBiome: { execute: jest.fn(async () => undefined) },
    findMoon: {
      byId: jest.fn(async (id: string | { toString(): string }) => moons.get(asId(id)) ?? null),
      byName: jest.fn(async (name: string | { toString(): string }) => {
        const n = asName(name);
        return Array.from(moons.values()).find((s) => s.name === n) ?? null;
      }),
    },
    listMoonsByPlanet: {
      execute: jest.fn(async (planetId: string | { toString(): string }) => {
        const id = asId(planetId);
        const rows = Array.from(moons.values()).filter((s) => s.planetId === id);
        return { rows, total: rows.length };
      }),
    },
    changeMoonName: { execute: jest.fn(async () => undefined) },
    changeMoonSize: { execute: jest.fn(async () => undefined) },
    changeMoonOrbital: { execute: jest.fn(async () => undefined) },
    findAsteroid: {
      byId: jest.fn(async (id: string | { toString(): string }) => asteroids.get(asId(id)) ?? null),
      byName: jest.fn(async (name: string | { toString(): string }) => {
        const n = asName(name);
        return Array.from(asteroids.values()).find((s) => s.name === n) ?? null;
      }),
    },
    listAsteroidsBySystem: {
      execute: jest.fn(async (systemId: string | { toString(): string }) => {
        const id = asId(systemId);
        const rows = Array.from(asteroids.values()).filter((s) => s.systemId === id);
        return { rows, total: rows.length };
      }),
    },
    changeAsteroidName: { execute: jest.fn(async () => undefined) },
    changeAsteroidType: { execute: jest.fn(async () => undefined) },
    changeAsteroidSize: { execute: jest.fn(async () => undefined) },
    changeAsteroidOrbital: { execute: jest.fn(async () => undefined) },
    createLog: {
      execute: jest.fn(async (payload: Record<string, unknown>) => ({
        id: "1",
        ...payload,
        occurredAt: new Date(),
        resolvedAt: null,
        resolvedBy: null,
      })),
    },
    resolveLog: { execute: jest.fn(async () => undefined) },
    findLog: {
      byId: jest.fn(async (id: string) => ({
        id,
        source: "http",
        level: "warn",
        category: "security",
        message: "Forbidden",
      })),
    },
    listLogs: {
      execute: jest.fn(async () => ({ rows: [], total: 0 })),
    },
    trackMetric: {
      execute: jest.fn(async (payload: Record<string, unknown>) => ({
        id: "1",
        ...payload,
        occurredAt: new Date(),
      })),
    },
    findMetric: {
      byId: jest.fn(async (id: string) => ({
        id,
        metricName: "http.request.duration",
        metricType: "http",
        source: "express",
        durationMs: 10,
        success: true,
        occurredAt: new Date(),
      })),
    },
    listMetrics: {
      execute: jest.fn(async () => ({ rows: [], total: 0 })),
    },
    dashboardMetrics: {
      execute: jest.fn(async () => ({
        from: new Date(),
        to: new Date(),
        summary: {
          total: 0,
          avgDurationMs: 0,
          p95DurationMs: 0,
          p99DurationMs: 0,
          maxDurationMs: 0,
          errorRate: 0,
        },
        byType: [],
        topBottlenecks: [],
        recentFailures: [],
      })),
    },
  } as const;

  const userController = new UserController(
    mocks.healthCheck as any,
    mocks.findUser as any,
    mocks.listUsers as any,
    mocks.authService as any,
    mocks.platformService as any,
    mocks.lifecycleService as any,
  );

  const galaxyController = new GalaxyController(
    mocks.createGalaxy as any,
    mocks.changeGalaxyName as any,
    mocks.changeGalaxyShape as any,
    mocks.deleteGalaxy as any,
    mocks.findGalaxy as any,
    mocks.listGalaxies as any,
    mocks.populateGalaxy as any,
  );

  const systemController = new SystemController(
    mocks.findSystem as any,
    mocks.listSystemsByGalaxy as any,
    mocks.changeSystemName as any,
    mocks.changeSystemPosition as any,
    mocks.findGalaxy as any,
  );

  const starController = new StarController(
    mocks.findStar as any,
    mocks.listStarsBySystem as any,
    mocks.changeStarName as any,
    mocks.changeStarMain as any,
    mocks.changeStarOrbital as any,
    mocks.changeStarStarterOrbital as any,
    mocks.findSystem as any,
    mocks.findGalaxy as any,
  );

  const planetController = new PlanetController(
    mocks.findPlanet as any,
    mocks.listPlanetsBySystem as any,
    mocks.changePlanetName as any,
    mocks.changePlanetOrbital as any,
    mocks.changePlanetBiome as any,
    mocks.findSystem as any,
    mocks.findGalaxy as any,
  );

  const moonController = new MoonController(
    mocks.findMoon as any,
    mocks.listMoonsByPlanet as any,
    mocks.changeMoonName as any,
    mocks.changeMoonSize as any,
    mocks.changeMoonOrbital as any,
    mocks.findPlanet as any,
    mocks.findSystem as any,
    mocks.findGalaxy as any,
  );

  const asteroidController = new AsteroidController(
    mocks.findAsteroid as any,
    mocks.listAsteroidsBySystem as any,
    mocks.changeAsteroidName as any,
    mocks.changeAsteroidType as any,
    mocks.changeAsteroidSize as any,
    mocks.changeAsteroidOrbital as any,
    mocks.findSystem as any,
    mocks.findGalaxy as any,
  );
  const logController = new LogController(
    mocks.createLog as any,
    mocks.resolveLog as any,
    mocks.findLog as any,
    mocks.listLogs as any,
  );
  const metricController = new MetricController(
    mocks.trackMetric as any,
    mocks.findMetric as any,
    mocks.listMetrics as any,
    mocks.dashboardMetrics as any,
  );

  const app = Express();
  app.use(Express.json());
  const auth = new AuthMiddleware(new FakeJwt(), {});
  const scope = new ScopeMiddleware();

  app.use(
    buildApiRouter({
      userController,
      galaxyController,
      systemController,
      starController,
      planetController,
      moonController,
      asteroidController,
      logController,
      metricController,
      auth,
      scope,
    }),
  );

  return { app, mocks: mocks as unknown as Record<string, Record<string, jest.Mock>> };
}
