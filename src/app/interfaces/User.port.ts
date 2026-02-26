import { Email, PasswordHash, User, UserRole, Username, Uuid } from "../../domain/aggregates/User";

export type ListUsersQuery = {
  includeDeleted?: boolean; // default false
  search?: string; // name/email/username contains
  limit?: number; // pagination
  offset?: number;
  orderBy?: "createdAt" | "username" | "email";
  orderDir?: "asc" | "desc";
};

export type UserListItem = {
  id: string;
  email: string;
  username: string;
  role: string;
  verified: boolean;
  isDeleted: boolean;
  isArchived: boolean;
  isSupporter: boolean;
  createdAt: Date;
  lastActivityAt: Date;
  verifiedAt: Date | null;
  deletedAt: Date | null;
  archivedAt: Date | null;
  supporterFrom: Date | null;
};

export interface IUser {
  save(user: User): Promise<User>;
  findById(id: Uuid): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  list(query: ListUsersQuery): Promise<{ rows: UserListItem[]; total: number }>;
  changeEmail(id: Uuid, email: Email): Promise<User>;
  changePassword(id: Uuid, hash: PasswordHash): Promise<User>;
  changeUsername(id: Uuid, username: Username): Promise<User>;
  changeRole(id: Uuid, role: UserRole): Promise<User>;
  verify(email: Email): Promise<void>;
  softDelete(id: Uuid, at?: Date): Promise<void>;
  restore(id: Uuid, at?: Date): Promise<void>;
  touchActivity(id: Uuid, at?: Date): Promise<void>;
  archiveInactive(days?: number): Promise<Array<{ id: string; email: string; username: string }>>;
}
