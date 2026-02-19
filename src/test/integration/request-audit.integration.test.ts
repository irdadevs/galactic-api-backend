import Express from "express";
import request from "supertest";
import { RequestAuditMiddleware } from "../../presentation/middlewares/RequestAudit.middleware";

describe("Integration - RequestAuditMiddleware", () => {
  test("adds request id and logs security responses", async () => {
    const createLog = { execute: jest.fn(async () => ({ id: "1" })) } as any;
    const middleware = new RequestAuditMiddleware(createLog);
    const app = Express();
    app.use(middleware.bindRequestId());
    app.use(middleware.logResponse());
    app.get("/forbidden", (_req, res) => {
      res.status(403).json({ ok: false });
    });

    const response = await request(app).get("/forbidden").expect(403);
    expect(response.headers["x-request-id"]).toBeDefined();
    expect(createLog.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "http",
        category: "security",
        level: "warn",
        statusCode: 403,
        path: "/forbidden",
      }),
    );
  });

  test("logs successful mutating requests as audit entries", async () => {
    const createLog = { execute: jest.fn(async () => ({ id: "2" })) } as any;
    const middleware = new RequestAuditMiddleware(createLog);
    const app = Express();
    app.use(Express.json());
    app.use(middleware.bindRequestId());
    app.use(middleware.logResponse());
    app.patch("/resource", (_req, res) => res.status(204).send());

    await request(app).patch("/resource").send({ x: 1 }).expect(204);
    expect(createLog.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        category: "audit",
        level: "info",
        statusCode: 204,
      }),
    );
  });
});
