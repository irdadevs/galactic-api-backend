import { createClient, RedisClientType } from "redis";
import { ICache, DEFAULT_TTL } from "../../app/interfaces/Cache.port";
import { CONSOLE_COLORS } from "../../utils/Chalk";

export type RedisOptions = {
  url?: string; // e.g. redis://localhost:6379
  username?: string;
  password?: string;
  keyPrefix?: string; // multi-tenant, env, etc.
};

export class RedisRepo implements ICache {
  private client: RedisClientType;
  private prefix: string;

  constructor(opts: RedisOptions = {}) {
    this.client = createClient({
      url: opts.url || process.env.REDIS_URL,
      username: opts.username || process.env.REDIS_USERNAME,
      password: opts.password || process.env.REDIS_PASSWORD,
    });
    this.prefix = opts.keyPrefix ? `${opts.keyPrefix}:` : "";
    this.client.on("error", (e) => {
      console.log(
        `${CONSOLE_COLORS.labelColor("[❌redis]")} ${CONSOLE_COLORS.errorColor(`error. ${e}`)}`,
      );
    });
  }

  async connect() {
    if (!this.client.isOpen) {
      console.log(
        `🛜 ${CONSOLE_COLORS.labelColor("[⚙️redis]")} ${CONSOLE_COLORS.successColor(`cache client ready.`)}`,
      );
      await this.client.connect();
    }
  }

  private k(key: string) {
    return this.prefix + key;
  }

  async get<T = unknown>(key: string): Promise<T | null> {
    await this.connect();
    const raw = await this.client.get(this.k(key));
    if (!raw) return null;
    try {
      return JSON.parse(raw as string) as T;
    } catch {
      return null;
    }
  }

  async set<T = unknown>(
    key: string,
    value: T,
    ttlSec = DEFAULT_TTL,
  ): Promise<void> {
    await this.connect();
    await this.client.set(this.k(key), JSON.stringify(value), { EX: ttlSec });
  }

  async del(key: string): Promise<void> {
    await this.connect();
    await this.client.del(this.k(key));
  }

  async close(): Promise<void> {
    if (this.client.isOpen) {
      console.log(
        `🛜 ${CONSOLE_COLORS.labelColor(
          "[⚙️redis]",
        )} ${CONSOLE_COLORS.warningColor(`cache client connection closed.`)}`,
      );
      await this.client.quit();
    }
  }
}
