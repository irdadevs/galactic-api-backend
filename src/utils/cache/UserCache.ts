import { User, UserRole } from "../../domain/aggregates/User";
import { ListUsersQuery, UserListItem } from "../../app/interfaces/User.port";
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
  isArchived: boolean;
  isSupporter: boolean;
  supporterFrom: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
  lastActivityAt: string;
  createdAt: string;
  role: UserRole;
};

export type CachedUserListItem = {
  id: string;
  email: string;
  username: string;
  role: string;
  verified: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isSupporter: boolean;
  createdAt: string;
  lastActivityAt: string;
  verifiedAt: string | null;
  deletedAt: string | null;
  archivedAt: string | null;
  supporterFrom: string | null;
};

export type CachedListUsersResult = {
  rows: CachedUserListItem[];
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
  byEmail: (email: string): string => `${USERS_PREFIX}:by-email:${email.trim().toLowerCase()}`,
  byUsername: (username: string): string => `${USERS_PREFIX}:by-username:${username.trim()}`,
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
    supporterFrom: json.supporterFrom ? json.supporterFrom.toISOString() : null,
    verificationCodeExpiresAt: json.verificationCodeExpiresAt
      ? json.verificationCodeExpiresAt.toISOString()
      : null,
    verifiedAt: json.verifiedAt ? json.verifiedAt.toISOString() : null,
    deletedAt: json.deletedAt ? json.deletedAt.toISOString() : null,
    archivedAt: json.archivedAt ? json.archivedAt.toISOString() : null,
    lastActivityAt: json.lastActivityAt.toISOString(),
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
    isArchived: cached.isArchived,
    isSupporter: cached.isSupporter,
    supporterFrom: cached.supporterFrom ? new Date(cached.supporterFrom) : null,
    deletedAt: cached.deletedAt ? new Date(cached.deletedAt) : null,
    archivedAt: cached.archivedAt ? new Date(cached.archivedAt) : null,
    lastActivityAt: new Date(cached.lastActivityAt),
    createdAt: new Date(cached.createdAt),
    role: cached.role,
  });
}

export function serializeUserListItemForCache(user: UserListItem): CachedUserListItem {
  return {
    ...user,
    createdAt: user.createdAt.toISOString(),
    lastActivityAt: user.lastActivityAt.toISOString(),
    verifiedAt: user.verifiedAt ? user.verifiedAt.toISOString() : null,
    deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
    archivedAt: user.archivedAt ? user.archivedAt.toISOString() : null,
    supporterFrom: user.supporterFrom ? user.supporterFrom.toISOString() : null,
  };
}

export function deserializeUserListItemFromCache(cached: CachedUserListItem): UserListItem {
  return {
    ...cached,
    createdAt: new Date(cached.createdAt),
    lastActivityAt: new Date(cached.lastActivityAt),
    verifiedAt: cached.verifiedAt ? new Date(cached.verifiedAt) : null,
    deletedAt: cached.deletedAt ? new Date(cached.deletedAt) : null,
    archivedAt: cached.archivedAt ? new Date(cached.archivedAt) : null,
    supporterFrom: cached.supporterFrom ? new Date(cached.supporterFrom) : null,
  };
}
