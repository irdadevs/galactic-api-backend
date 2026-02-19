import { ErrorFactory } from "../../utils/errors/Error.map";
import { Uuid } from "./User";

const ALLOWED_METRIC_TYPES = ["http", "db", "use_case", "cache", "infra"] as const;

export type MetricType = (typeof ALLOWED_METRIC_TYPES)[number];

export type MetricCreateProps = {
  id?: string;
  metricName: string;
  metricType: MetricType;
  source: string;
  durationMs: number;
  success?: boolean;
  userId?: string | null;
  requestId?: string | null;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
  occurredAt?: Date;
};

export class Metric {
  private constructor(
    private props: {
      id: string;
      metricName: string;
      metricType: MetricType;
      source: string;
      durationMs: number;
      success: boolean;
      userId: string | null;
      requestId: string | null;
      tags: Record<string, unknown>;
      context: Record<string, unknown>;
      occurredAt: Date;
    },
  ) {}

  static create(input: MetricCreateProps): Metric {
    const metricName = input.metricName.trim();
    const source = input.source.trim();
    if (!metricName || metricName.length > 120) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "metricName" });
    }
    if (!source || source.length > 120) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "source" });
    }
    if (!ALLOWED_METRIC_TYPES.includes(input.metricType)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "metricType" });
    }
    if (!Number.isFinite(input.durationMs) || input.durationMs < 0) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", { field: "durationMs" });
    }

    const userId = input.userId ? Uuid.create(input.userId).toString() : null;

    return new Metric({
      id: input.id ?? "0",
      metricName,
      metricType: input.metricType,
      source,
      durationMs: Number(input.durationMs),
      success: input.success ?? true,
      userId,
      requestId: input.requestId?.trim() || null,
      tags: input.tags ?? {},
      context: input.context ?? {},
      occurredAt: input.occurredAt ?? new Date(),
    });
  }

  static rehydrate(input: Required<MetricCreateProps> & { id: string }): Metric {
    return Metric.create(input);
  }

  get id(): string { return this.props.id; }
  get metricName(): string { return this.props.metricName; }
  get metricType(): MetricType { return this.props.metricType; }
  get source(): string { return this.props.source; }
  get durationMs(): number { return this.props.durationMs; }
  get success(): boolean { return this.props.success; }
  get userId(): string | null { return this.props.userId; }
  get requestId(): string | null { return this.props.requestId; }
  get tags(): Record<string, unknown> { return { ...this.props.tags }; }
  get context(): Record<string, unknown> { return { ...this.props.context }; }
  get occurredAt(): Date { return this.props.occurredAt; }

  toJSON(): {
    id: string;
    metricName: string;
    metricType: MetricType;
    source: string;
    durationMs: number;
    success: boolean;
    userId: string | null;
    requestId: string | null;
    tags: Record<string, unknown>;
    context: Record<string, unknown>;
    occurredAt: Date;
  } {
    return {
      id: this.id,
      metricName: this.metricName,
      metricType: this.metricType,
      source: this.source,
      durationMs: this.durationMs,
      success: this.success,
      userId: this.userId,
      requestId: this.requestId,
      tags: this.tags,
      context: this.context,
      occurredAt: this.occurredAt,
    };
  }
}
