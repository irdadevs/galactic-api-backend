import request from "supertest";
import { buildTestApi, IDS, makeAuthHeader } from "../helpers/apiTestApp";

describe("API E2E - auth, ownership and validation boundaries", () => {
  test("rejects protected endpoints when Authorization header is missing", async () => {
    const { app } = buildTestApi();
    await request(app).get("/api/v1/galaxies").expect(401);
  });

  test("rejects invalid bearer token payload", async () => {
    const { app } = buildTestApi();
    await request(app)
      .get("/api/v1/galaxies")
      .set("Authorization", "Bearer malformed-token")
      .expect(401);
  });

  test("sets access and refresh cookies on login", async () => {
    const { app } = buildTestApi();
    const response = await request(app)
      .post("/api/v1/users/login")
      .send({ email: "a@test.com", rawPassword: "123456" })
      .expect(200);

    const rawSetCookie = response.headers["set-cookie"];
    const setCookie = Array.isArray(rawSetCookie)
      ? rawSetCookie
      : rawSetCookie
        ? [rawSetCookie]
        : [];
    expect(setCookie.some((value: string) => value.startsWith("access_token="))).toBe(true);
    expect(setCookie.some((value: string) => value.startsWith("refresh_token="))).toBe(true);
    expect(response.body.user).toBeDefined();
    expect(response.body.accessToken).toBeUndefined();
    expect(response.body.refreshToken).toBeUndefined();
  });

  test("accepts access token from cookie for protected routes", async () => {
    const { app } = buildTestApi();
    await request(app)
      .get("/api/v1/galaxies")
      .set("Cookie", [`access_token=${IDS.userA}|User`])
      .expect(200);
  });

  test("uses refresh token from cookie in refresh endpoint", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .post("/api/v1/users/token/refresh")
      .set("Cookie", ["refresh_token=valid.refresh.token"])
      .expect(200);
    expect(mocks.authService.refresh).toHaveBeenCalledWith("valid.refresh.token");
  });

  test("uses refresh token cookie for logout and clears auth cookies", async () => {
    const { app, mocks } = buildTestApi();
    const response = await request(app)
      .post("/api/v1/users/logout")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .set("Cookie", ["refresh_token=valid.refresh.token"])
      .expect(204);
    expect(mocks.authService.logoutByRefreshToken).toHaveBeenCalledWith(
      "valid.refresh.token",
    );
    const rawSetCookie = response.headers["set-cookie"];
    const setCookie = Array.isArray(rawSetCookie)
      ? rawSetCookie
      : rawSetCookie
        ? [rawSetCookie]
        : [];
    expect(setCookie.some((value: string) => value.startsWith("access_token=;"))).toBe(true);
    expect(setCookie.some((value: string) => value.startsWith("refresh_token=;"))).toBe(true);
  });

  test("allows any authenticated user to create galaxies and injects ownerId from auth context", async () => {
    const { app, mocks } = buildTestApi();

    const response = await request(app)
      .post("/api/v1/galaxies")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ name: "NewGalaxy", shape: "spherical", systemCount: 3 })
      .expect(201);

    expect(mocks.createGalaxy.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        ownerId: IDS.userA,
        name: "NewGalaxy",
        systemCount: 3,
      }),
    );
    expect(response.body.ownerId).toBe(IDS.userA);
  });

  test("returns only own galaxy for non-admin list route", async () => {
    const { app, mocks } = buildTestApi();
    const response = await request(app)
      .get("/api/v1/galaxies")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .expect(200);

    expect(mocks.findGalaxy.byOwner).toHaveBeenCalled();
    expect(mocks.listGalaxies.execute).not.toHaveBeenCalled();
    expect(response.body.total).toBe(1);
    expect(response.body.rows[0].ownerId).toBe(IDS.userA);
  });

  test("allows admin to list all galaxies", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .get("/api/v1/galaxies?page=1&limit=20")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(200);

    expect(mocks.listGalaxies.execute).toHaveBeenCalled();
  });

  test("allows only admin to list users", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .get("/api/v1/users")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .expect(403);

    await request(app)
      .get("/api/v1/users?limit=20")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(200);

    expect(mocks.listUsers.execute).toHaveBeenCalled();
  });

  test("allows admin to change user role", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/users/${IDS.userA}/role`)
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .send({ newRole: "Admin" })
      .expect(204);

    expect(mocks.platformService.changeRole).toHaveBeenCalled();
  });

  test("allows admin to soft-delete and restore users", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .delete("/api/v1/users/soft-delete")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .send({ id: IDS.userA })
      .expect(204);

    await request(app)
      .post("/api/v1/users/restore")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .send({ id: IDS.userA })
      .expect(204);

    expect(mocks.lifecycleService.softDelete).toHaveBeenCalled();
    expect(mocks.lifecycleService.restore).toHaveBeenCalled();
  });

  test("forbids non-admin access to other user galaxy by id", async () => {
    const { app } = buildTestApi();
    await request(app)
      .get(`/api/v1/galaxies/${IDS.galaxyB}`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .expect(403);
  });

  test("allows admin access to any galaxy by id", async () => {
    const { app } = buildTestApi();
    const response = await request(app)
      .get(`/api/v1/galaxies/${IDS.galaxyB}`)
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(200);
    expect(response.body.id).toBe(IDS.galaxyB);
  });

  test("validates galaxy shape patch payload", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/galaxies/${IDS.galaxyA}/shape`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ shape: "unknown-shape" })
      .expect(400);
    expect(mocks.changeGalaxyShape.execute).not.toHaveBeenCalled();
  });

  test("forbids non-owner from mutating systems", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/systems/${IDS.systemB}/name`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ name: "ForbiddenSystem" })
      .expect(403);
    expect(mocks.changeSystemName.execute).not.toHaveBeenCalled();
  });

  test("validates system position payload", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/systems/${IDS.systemA}/position`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ x: "10", y: 20, z: 30 })
      .expect(400);
    expect(mocks.changeSystemPosition.execute).not.toHaveBeenCalled();
  });

  test("forbids non-owner from mutating stars", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/stars/${IDS.starB}/main`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ isMain: true })
      .expect(403);
    expect(mocks.changeStarMain.execute).not.toHaveBeenCalled();
  });

  test("validates star orbital payload", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/stars/${IDS.starA}/orbital`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ orbital: -1 })
      .expect(400);
    expect(mocks.changeStarOrbital.execute).not.toHaveBeenCalled();
  });

  test("allows admin to mutate any star", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/stars/${IDS.starB}/main`)
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .send({ isMain: false })
      .expect(204);
    expect(mocks.changeStarMain.execute).toHaveBeenCalled();
  });

  test("forbids non-owner from mutating planets", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/planets/${IDS.planetB}/biome`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ biome: "desert" })
      .expect(403);
    expect(mocks.changePlanetBiome.execute).not.toHaveBeenCalled();
  });

  test("validates planet orbital payload", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/planets/${IDS.planetA}/orbital`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ orbital: 0 })
      .expect(400);
    expect(mocks.changePlanetOrbital.execute).not.toHaveBeenCalled();
  });

  test("forbids non-owner from mutating moons", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/moons/${IDS.moonB}/size`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ size: "medium" })
      .expect(403);
    expect(mocks.changeMoonSize.execute).not.toHaveBeenCalled();
  });

  test("validates moon orbital payload", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/moons/${IDS.moonA}/orbital`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ orbital: 0 })
      .expect(400);
    expect(mocks.changeMoonOrbital.execute).not.toHaveBeenCalled();
  });

  test("forbids non-owner from mutating asteroids", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/asteroids/${IDS.asteroidB}/type`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ type: "single" })
      .expect(403);
    expect(mocks.changeAsteroidType.execute).not.toHaveBeenCalled();
  });

  test("validates asteroid size payload", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch(`/api/v1/asteroids/${IDS.asteroidA}/size`)
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({ size: "colossal" })
      .expect(400);
    expect(mocks.changeAsteroidSize.execute).not.toHaveBeenCalled();
  });

  test("allows only admin to list logs", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .get("/api/v1/logs")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .expect(403);

    await request(app)
      .get("/api/v1/logs?limit=20")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(200);

    expect(mocks.listLogs.execute).toHaveBeenCalled();
  });

  test("allows admin to resolve logs", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .patch("/api/v1/logs/10/resolve")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(204);
    expect(mocks.resolveLog.execute).toHaveBeenCalledWith("10", IDS.admin);
  });

  test("allows only admin to access performance metrics dashboard", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .get("/api/v1/metrics/performance/dashboard")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .expect(403);

    await request(app)
      .get("/api/v1/metrics/performance/dashboard?hours=24&topLimit=10")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(200);

    expect(mocks.dashboardMetrics.execute).toHaveBeenCalled();
  });

  test("allows admin to list performance metrics", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .get("/api/v1/metrics/performance?limit=20")
      .set("Authorization", makeAuthHeader(IDS.admin, "Admin"))
      .expect(200);
    expect(mocks.listMetrics.execute).toHaveBeenCalled();
  });

  test("allows authenticated users to create donation checkout sessions", async () => {
    const { app, mocks } = buildTestApi();
    const response = await request(app)
      .post("/api/v1/donations/checkout")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .send({
        donationType: "monthly",
        amountMinor: 999,
        currency: "USD",
        successUrl: "https://app.local/success",
        cancelUrl: "https://app.local/cancel",
      })
      .expect(201);

    expect(mocks.createDonationCheckout.execute).toHaveBeenCalled();
    expect(response.body.sessionId).toBeDefined();
  });

  test("forbids non-owner donation access", async () => {
    const { app } = buildTestApi();
    await request(app)
      .get("/api/v1/donations/dddddddd-dddd-4ddd-8ddd-dddddddddddd")
      .set("Authorization", makeAuthHeader(IDS.userB, "User"))
      .expect(403);
  });

  test("allows owner to confirm donation session", async () => {
    const { app, mocks } = buildTestApi();
    await request(app)
      .post("/api/v1/donations/checkout/cs_test_mock/confirm")
      .set("Authorization", makeAuthHeader(IDS.userA, "User"))
      .expect(204);

    expect(mocks.confirmDonationBySession.execute).toHaveBeenCalledWith(
      "cs_test_mock",
    );
  });
});
