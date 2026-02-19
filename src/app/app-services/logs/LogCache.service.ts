import { Log } from "../../../domain/aggregates/Log";
import { ICache } from "../../interfaces/Cache.port";
import { ListLogsQuery } from "../../interfaces/Log.port";
import {
  CachedListLogsResult,
  CachedLog,
  LOG_CACHE_POLICY,
  LogCacheKeys,
  deserializeLogFromCache,
  serializeLogForCache,
} from "../../../utils/cache/LogCache";

export class LogCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<Log | null> {
    try {
      const cached = await this.cache.get<CachedLog>(LogCacheKeys.byId(id));
      return cached ? deserializeLogFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setLog(log: Log): Promise<void> {
    const payload = serializeLogForCache(log);
    try {
      await this.cache.set(LogCacheKeys.byId(log.id), payload, LOG_CACHE_POLICY.logTtl);
    } catch {
      return;
    }
  }

  async getList(query: ListLogsQuery): Promise<{ rows: Log[]; total: number } | null> {
    try {
      const cached = await this.cache.get<CachedListLogsResult>(LogCacheKeys.list(query));
      if (!cached) return null;
      return { rows: cached.rows.map(deserializeLogFromCache), total: cached.total };
    } catch {
      return null;
    }
  }

  async setList(query: ListLogsQuery, result: { rows: Log[]; total: number }): Promise<void> {
    const payload: CachedListLogsResult = {
      rows: result.rows.map((row) => serializeLogForCache(row)),
      total: result.total,
    };
    try {
      await this.cache.set(LogCacheKeys.list(query), payload, LOG_CACHE_POLICY.logsListTtl);
    } catch {
      return;
    }
  }

  async invalidateForMutation(id: string): Promise<void> {
    try {
      await this.cache.del(LogCacheKeys.byId(id));
      await this.cache.delByPrefix(LogCacheKeys.listPrefix());
    } catch {
      return;
    }
  }
}
