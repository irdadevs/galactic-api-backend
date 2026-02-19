import { Metric } from "../../../../domain/aggregates/Metric";
import { MetricCacheService } from "../../../app-services/metrics/MetricCache.service";
import { IMetric } from "../../../interfaces/Metric.port";

export class FindMetric {
  constructor(
    private readonly repo: IMetric,
    private readonly cache: MetricCacheService,
  ) {}

  async byId(id: string): Promise<Metric | null> {
    const cached = await this.cache.getById(id);
    if (cached) return cached;
    const metric = await this.repo.findById(id);
    if (metric) await this.cache.setMetric(metric);
    return metric;
  }
}
