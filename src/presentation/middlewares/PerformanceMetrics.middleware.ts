import { NextFunction, Request, Response } from "express";
import { TrackMetric } from "../../app/use-cases/commands/metrics/TrackMetric.command";

export class PerformanceMetricsMiddleware {
  constructor(private readonly trackMetric: TrackMetric) {}

  captureHttpDuration() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startedAt = Date.now();
      res.on("finish", () => {
        const statusCode = res.statusCode;
        const durationMs = Math.max(0, Date.now() - startedAt);
        const success = statusCode < 500;
        void this.trackMetric.execute({
          metricName: "http.request.duration",
          metricType: "http",
          source: "express",
          durationMs,
          success,
          userId: req.auth?.userId ?? null,
          requestId: res.locals.requestId ?? null,
          tags: {
            method: req.method,
            path: req.path,
            statusCode,
          },
          context: {
            responseSize: res.getHeader("content-length"),
            userAgent:
              typeof req.headers["user-agent"] === "string"
                ? req.headers["user-agent"]
                : null,
          },
        }).catch(() => {});
      });

      next();
    };
  }
}
