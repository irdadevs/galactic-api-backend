import { Log } from "../../../../domain/aggregates/Log";
import { LogCacheService } from "../../../app-services/logs/LogCache.service";
import { ILog, ListLogsQuery } from "../../../interfaces/Log.port";

export class ListLogs {
  constructor(
    private readonly repo: ILog,
    private readonly cache: LogCacheService,
  ) {}

  async execute(query: ListLogsQuery): Promise<{ rows: Log[]; total: number }> {
    const cached = await this.cache.getList(query);
    if (cached) return cached;
    const result = await this.repo.list(query);
    await this.cache.setList(query, result);
    return result;
  }
}
