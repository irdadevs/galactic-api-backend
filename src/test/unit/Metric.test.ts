import { MetricCacheService } from "../../app/app-services/metrics/MetricCache.service";
import { IMetric } from "../../app/interfaces/Metric.port";
import { TrackMetric } from "../../app/use-cases/commands/metrics/TrackMetric.command";
import { Metric } from "../../domain/aggregates/Metric";

const assertDomainErrorCode = (fn: () => void, code: string) => {
  let thrown: unknown;
  try {
    fn();
  } catch (err) {
    thrown = err;
  }

  expect(thrown).toBeDefined();
  const error = thrown as { code?: string };
  expect(error.code).toBe(code);
};

describe("Metric aggregate", () => {
  it("creates a metric", () => {
    const metric = Metric.create({
      metricName: "use_case.galaxy.create",
      metricType: "use_case",
      source: "CreateGalaxy",
      durationMs: 120,
      success: true,
      userId: "11111111-1111-4111-8111-111111111111",
      requestId: "req-xyz",
      tags: { op: "create" },
      context: { systems: 20 },
    });

    expect(metric.metricName).toBe("use_case.galaxy.create");
    expect(metric.metricType).toBe("use_case");
    expect(metric.source).toBe("CreateGalaxy");
    expect(metric.durationMs).toBe(120);
    expect(metric.success).toBe(true);
    expect(metric.userId).toBe("11111111-1111-4111-8111-111111111111");
    expect(metric.tags).toEqual({ op: "create" });
  });

  it("throws on negative duration", () => {
    assertDomainErrorCode(
      () =>
        Metric.create({
          metricName: "db.query.duration",
          metricType: "db",
          source: "PgPoolQueryable",
          durationMs: -1,
        }),
      "PRESENTATION.INVALID_FIELD",
    );
  });

  it("throws on invalid metric name", () => {
    assertDomainErrorCode(
      () =>
        Metric.create({
          metricName: " ",
          metricType: "db",
          source: "PgPoolQueryable",
          durationMs: 1,
        }),
      "PRESENTATION.INVALID_FIELD",
    );
  });
});

describe("TrackMetric command", () => {
  it("sanitizes sensitive fields and invalidates cache", async () => {
    const saved = Metric.create({
      id: "1",
      metricName: "http.request.duration",
      metricType: "http",
      source: "express",
      durationMs: 25,
      success: true,
      context: { ok: true },
    });

    const repo: Pick<IMetric, "save"> = {
      save: jest.fn(async () => saved),
    };
    const cache = {
      invalidateForMutation: jest.fn(async (): Promise<void> => undefined),
    } as unknown as MetricCacheService;

    const command = new TrackMetric(repo as IMetric, cache);
    const result = await command.execute({
      metricName: "http.request.duration",
      metricType: "http",
      source: "express",
      durationMs: 25,
      success: true,
      tags: { authorization: "Bearer x" },
      context: { password: "123", nested: { token: "abc" } },
    });

    expect(result.id).toBe(saved.id);
    expect(repo.save).toHaveBeenCalledTimes(1);
    const payload = (repo.save as jest.Mock).mock.calls[0][0] as Metric;
    expect(payload.tags).toEqual({ authorization: "[redacted]" });
    expect(payload.context).toEqual({
      password: "[redacted]",
      nested: { token: "[redacted]" },
    });
    expect(cache.invalidateForMutation).toHaveBeenCalledWith(saved.id);
  });
});
