import { Metric } from "../../../../domain/aggregates/Metric";
import { MetricCacheService } from "../../../app-services/metrics/MetricCache.service";
import { IMetric, TrackMetricInput } from "../../../interfaces/Metric.port";

const REDACTED = "[redacted]";
const SENSITIVE_KEYS = ["password", "token", "authorization", "cookie", "secret"] as const;

function sanitizeObject(input?: Record<string, unknown>): Record<string, unknown> {
  if (!input) return {};

  const recurse = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map((x) => recurse(x));
    if (value && typeof value === "object") {
      const out: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(value)) {
        const lower = key.toLowerCase();
        if (SENSITIVE_KEYS.some((k) => lower.includes(k))) {
          out[key] = REDACTED;
          continue;
        }
        out[key] = recurse(val);
      }
      return out;
    }
    return value;
  };

  const sanitized = recurse(input) as Record<string, unknown>;
  const asString = JSON.stringify(sanitized);
  if (asString.length <= 25_000) return sanitized;
  return { truncated: true, preview: asString.slice(0, 25_000) };
}

export class TrackMetric {
  constructor(
    private readonly repo: IMetric,
    private readonly cache: MetricCacheService,
  ) {}

  async execute(input: TrackMetricInput): Promise<Metric> {
    const metric = Metric.create({
      ...input,
      context: sanitizeObject(input.context),
      tags: sanitizeObject(input.tags),
    });
    const saved = await this.repo.save(metric);
    await this.cache.invalidateForMutation(saved.id);
    return saved;
  }
}
