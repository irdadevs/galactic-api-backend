import {
  Email,
  PasswordHash,
  User,
  Username,
  Uuid,
} from "../../domain/aggregates/User";

export type ListUsersQuery = {
  includeDeleted?: boolean; // default false
  search?: string; // name/email/username contains
  limit?: number; // pagination
  offset?: number;
  orderBy?: "createdAt" | "username" | "email";
  orderDir?: "asc" | "desc";
};

export interface IUser {
  create(user: User): Promise<User>;
  findById(id: Uuid): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByUsername(username: Username): Promise<User | null>;
  list(query: ListUsersQuery): Promise<{ rows: User[]; total: number }>;
  changeEmail(id: Uuid, email: Email): Promise<User>;
  changePassword(id: Uuid, hash: PasswordHash): Promise<User>;
  changeUsername(id: Uuid, username: Username): Promise<User>;
  verify(email: Email): Promise<void>;
  softDelete(email: Email, at?: Date): Promise<void>;
  restore(email: Email): Promise<void>;
}
