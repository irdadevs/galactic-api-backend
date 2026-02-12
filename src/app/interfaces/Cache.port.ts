export interface ICache {
  get<T = unknown>(key: string): Promise<T | null>;
  set<T = unknown>(key: string, value: T, ttlSec?: number): Promise<void>;
  del(key: string): Promise<void>;
  close(): Promise<void>;
}

export const DEFAULT_TTL = 60 * 10; // 10 min
