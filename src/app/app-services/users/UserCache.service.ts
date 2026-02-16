import { User } from "../../../domain/aggregates/User";
import { ICache } from "../../interfaces/Cache.port";
import { ListUsersQuery } from "../../interfaces/User.port";
import {
  CachedUser,
  CachedListUsersResult,
  UserCacheKeys,
  USER_CACHE_POLICY,
  deserializeUserFromCache,
  serializeUserForCache,
} from "../../../utils/cache/UserCache";

type UserIdentitySnapshot = {
  email: string;
  username: string;
};

export class UserCacheService {
  constructor(private readonly cache: ICache) {}

  async getById(id: string): Promise<User | null> {
    try {
      const key = UserCacheKeys.byId(id);
      const cached = await this.cache.get<CachedUser>(key);
      return cached ? deserializeUserFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    try {
      const key = UserCacheKeys.byEmail(email);
      const cached = await this.cache.get<CachedUser>(key);
      return cached ? deserializeUserFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async getByUsername(username: string): Promise<User | null> {
    try {
      const key = UserCacheKeys.byUsername(username);
      const cached = await this.cache.get<CachedUser>(key);
      return cached ? deserializeUserFromCache(cached) : null;
    } catch {
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    const payload = serializeUserForCache(user);
    const ttl = USER_CACHE_POLICY.userTtl;

    try {
      await this.cache.set(UserCacheKeys.byId(user.id), payload, ttl);
      await this.cache.set(UserCacheKeys.byEmail(user.email), payload, ttl);
      await this.cache.set(UserCacheKeys.byUsername(user.username), payload, ttl);
    } catch {
      return;
    }
  }

  async getList(
    query: ListUsersQuery,
  ): Promise<{ rows: User[]; total: number } | null> {
    try {
      const key = UserCacheKeys.list(query);
      const cached = await this.cache.get<CachedListUsersResult>(key);
      if (!cached) return null;
      return {
        rows: cached.rows.map((row) => deserializeUserFromCache(row)),
        total: cached.total,
      };
    } catch {
      return null;
    }
  }

  async setList(
    query: ListUsersQuery,
    result: { rows: User[]; total: number },
  ): Promise<void> {
    const payload: CachedListUsersResult = {
      rows: result.rows.map((row) => serializeUserForCache(row)),
      total: result.total,
    };

    try {
      await this.cache.set(
        UserCacheKeys.list(query),
        payload,
        USER_CACHE_POLICY.usersListTtl,
      );
    } catch {
      return;
    }
  }

  async invalidateForMutation(
    current: User,
    previous?: UserIdentitySnapshot,
    options?: { invalidateList?: boolean },
  ): Promise<void> {
    const keys = [
      UserCacheKeys.byId(current.id),
      UserCacheKeys.byEmail(current.email),
      UserCacheKeys.byUsername(current.username),
    ];

    if (previous?.email) {
      keys.push(UserCacheKeys.byEmail(previous.email));
    }

    if (previous?.username) {
      keys.push(UserCacheKeys.byUsername(previous.username));
    }

    const uniqueKeys = Array.from(new Set(keys));
    const invalidateList = options?.invalidateList ?? true;

    try {
      await this.cache.delMany(uniqueKeys);
      if (invalidateList) {
        await this.cache.delByPrefix(UserCacheKeys.listPrefix());
      }
    } catch {
      return;
    }
  }

  async invalidateList(): Promise<void> {
    try {
      await this.cache.delByPrefix(UserCacheKeys.listPrefix());
    } catch {
      return;
    }
  }
}
