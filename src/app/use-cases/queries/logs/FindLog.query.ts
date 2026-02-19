import { LogCacheService } from "../../../app-services/logs/LogCache.service";
import { ILog } from "../../../interfaces/Log.port";
import { Log } from "../../../../domain/aggregates/Log";

export class FindLog {
  constructor(
    private readonly repo: ILog,
    private readonly cache: LogCacheService,
  ) {}

  async byId(id: string): Promise<Log | null> {
    const cached = await this.cache.getById(id);
    if (cached) return cached;
    const log = await this.repo.findById(id);
    if (log) await this.cache.setLog(log);
    return log;
  }
}
