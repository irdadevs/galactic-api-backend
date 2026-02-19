import { Metric } from "../../../../domain/aggregates/Metric";
import { MetricCacheService } from "../../../app-services/metrics/MetricCache.service";
import { IMetric, ListMetricsQuery } from "../../../interfaces/Metric.port";

export class ListMetrics {
  constructor(
    private readonly repo: IMetric,
    private readonly cache: MetricCacheService,
  ) {}

  async execute(query: ListMetricsQuery): Promise<{ rows: Metric[]; total: number }> {
    const cached = await this.cache.getList(query);
    if (cached) return cached;
    const result = await this.repo.list(query);
    await this.cache.setList(query, result);
    return result;
  }
}
