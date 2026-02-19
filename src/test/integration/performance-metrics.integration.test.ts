import Express from "express";
import request from "supertest";
import { PerformanceMetricsMiddleware } from "../../presentation/middlewares/PerformanceMetrics.middleware";

describe("Integration - PerformanceMetricsMiddleware", () => {
  test("tracks request duration metric", async () => {
    const trackMetric = { execute: jest.fn(async () => ({ id: "1" })) } as any;
    const middleware = new PerformanceMetricsMiddleware(trackMetric);
    const app = Express();
    app.use(middleware.captureHttpDuration());
    app.get("/ok", (_req, res) => res.status(200).json({ ok: true }));

    await request(app).get("/ok").expect(200);

    expect(trackMetric.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        metricName: "http.request.duration",
        metricType: "http",
        source: "express",
        success: true,
      }),
    );
  });
});
