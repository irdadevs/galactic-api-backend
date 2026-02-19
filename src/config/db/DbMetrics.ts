export type DbMetricInput = {
  metricName: string;
  source: string;
  durationMs: number;
  success: boolean;
  tags?: Record<string, unknown>;
  context?: Record<string, unknown>;
};

export interface DbMetricTracker {
  track(input: DbMetricInput): Promise<void>;
}
