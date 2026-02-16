import { User, UserRole } from "../../domain/aggregates/User";
import { ListUsersQuery } from "../../app/interfaces/User.port";
import { TTL_MAP } from "../TTL.map";

export type CachedUser = {
  id: string;
  email: string;
  username: string;
  passwordHash: string;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresAt: string | null;
  verifiedAt: string | null;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  role: UserRole;
};

export type CachedListUsersResult = {
  rows: CachedUser[];
  total: number;
};

export const USER_CACHE_POLICY = {
  userTtl: TTL_MAP.oneDay,
  usersListTtl: TTL_MAP.oneWeek,
} as const;

const USERS_PREFIX = "users";
const USERS_LIST_PREFIX = `${USERS_PREFIX}:list`;

export const UserCacheKeys = {
  byId: (id: string): string => `${USERS_PREFIX}:by-id:${id}`,
  byEmail: (email: string): string =>
    `${USERS_PREFIX}:by-email:${email.trim().toLowerCase()}`,
  byUsername: (username: string): string =>
    `${USERS_PREFIX}:by-username:${username.trim()}`,
  listPrefix: (): string => USERS_LIST_PREFIX,
  list: (query: ListUsersQuery): string =>
    `${USERS_LIST_PREFIX}:${JSON.stringify(normalizeListQuery(query))}`,
};

function normalizeListQuery(query: ListUsersQuery): ListUsersQuery {
  return {
    includeDeleted: Boolean(query.includeDeleted),
    search: query.search?.trim() || undefined,
    limit: query.limit,
    offset: query.offset,
    orderBy: query.orderBy,
    orderDir: query.orderDir,
  };
}

export function serializeUserForCache(user: User): CachedUser {
  const json = user.toJSON();
  return {
    ...json,
    verificationCodeExpiresAt: json.verificationCodeExpiresAt
      ? json.verificationCodeExpiresAt.toISOString()
      : null,
    verifiedAt: json.verifiedAt ? json.verifiedAt.toISOString() : null,
    deletedAt: json.deletedAt ? json.deletedAt.toISOString() : null,
    createdAt: json.createdAt.toISOString(),
  };
}

export function deserializeUserFromCache(cached: CachedUser): User {
  return User.rehydrate({
    id: cached.id,
    email: cached.email,
    passwordHash: cached.passwordHash,
    username: cached.username,
    isVerified: cached.isVerified,
    verificationCode: cached.verificationCode,
    verificationCodeExpiresAt: cached.verificationCodeExpiresAt
      ? new Date(cached.verificationCodeExpiresAt)
      : null,
    verifiedAt: cached.verifiedAt ? new Date(cached.verifiedAt) : null,
    isDeleted: cached.isDeleted,
    deletedAt: cached.deletedAt ? new Date(cached.deletedAt) : null,
    createdAt: new Date(cached.createdAt),
    role: cached.role,
  });
}
