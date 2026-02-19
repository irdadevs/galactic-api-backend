import { DashboardQuery, IMetric, MetricsDashboard } from "../../../interfaces/Metric.port";
import { MetricCacheService } from "../../../app-services/metrics/MetricCache.service";

export class MetricsDashboardQuery {
  constructor(
    private readonly repo: IMetric,
    private readonly cache: MetricCacheService,
  ) {}

  async execute(query: DashboardQuery): Promise<MetricsDashboard> {
    const cached = await this.cache.getDashboard(query);
    if (cached) return cached;
    const dashboard = await this.repo.dashboard(query);
    await this.cache.setDashboard(query, dashboard);
    return dashboard;
  }
}
