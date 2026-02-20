import { randomUUID } from "crypto";
import { ErrorFactory } from "../../utils/errors/Error.map";
import { REGEXP } from "../../utils/Regexp";

export type UserRole = "User" | "Admin";

export type UserProps = {
  id: Uuid;
  email: Email;
  passwordHash: PasswordHash;
  username: Username;
  isVerified: boolean;
  verificationCode: string | null;
  verificationCodeExpiresAt: Date | null;
  verifiedAt: Date | null;
  isDeleted: boolean;
  isArchived: boolean;
  role: Role;
  deletedAt: Date | null;
  archivedAt: Date | null;
  lastActivityAt: Date;
  createdAt: Date;
};

export type UserCreateProps = {
  email: string;
  passwordHash: string;
  username: string;
  id?: string;
  isVerified?: boolean;
  verificationCode?: string | null;
  verificationCodeExpiresAt?: Date | null;
  verifiedAt?: Date | null;
  isDeleted?: boolean;
  isArchived?: boolean;
  deletedAt?: Date | null;
  archivedAt?: Date | null;
  lastActivityAt?: Date;
  role?: UserRole;
  createdAt?: Date;
};

export type UserDTO = {
  id: string;
  email: string;
  username: string;
  password: string;
  is_verified: boolean;
  verification_code: string | null;
  verification_code_expires_at: Date | null;
  verified_at: Date | null;
  is_deleted: boolean;
  is_archived: boolean;
  deleted_at: Date | null;
  archived_at: Date | null;
  last_activity_at: Date;
  created_at: Date;
  role: UserRole;
};

export class Uuid {
  private constructor(private readonly value: string) {}

  static create(value?: string): Uuid {
    const id = value ?? randomUUID();
    if (!Uuid.isValid(id)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_ID", {
        id,
      });
    }
    return new Uuid(id);
  }

  static isValid(value: string): boolean {
    return REGEXP.uuid.test(value);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Uuid): boolean {
    return this.value === other.value;
  }
}

export class Email {
  private constructor(private readonly value: string) {}

  static create(value: string): Email {
    const normalized = value.trim().toLowerCase();
    if (!REGEXP.email.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_EMAIL", {
        email: value,
      });
    }
    return new Email(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}

export class PasswordHash {
  private constructor(private readonly value: string) {}

  static create(value: string): PasswordHash {
    const normalized = value.trim();
    if (normalized.length < 10) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_PASSWORD", {
        password: value,
      });
    }
    return new PasswordHash(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class Username {
  private constructor(private readonly value: string) {}

  static create(value: string): Username {
    const normalized = value.trim();
    if (!REGEXP.username.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_USERNAME", {
        username: value,
      });
    }
    return new Username(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: Username): boolean {
    return this.value === other.value;
  }
}

export class Role {
  private constructor(private readonly value: UserRole) {}

  static create(value: UserRole): Role {
    if (value !== "User" && value !== "Admin") {
      throw ErrorFactory.domain("DOMAIN.INVALID_USER_ROLE", {
        role: value,
      });
    }
    return new Role(value);
  }

  toString(): UserRole {
    return this.value;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = { ...props };
  }

  static create(input: UserCreateProps): User {
    const now = new Date();
    const user = new User({
      id: Uuid.create(input.id),
      email: Email.create(input.email),
      passwordHash: PasswordHash.create(input.passwordHash),
      username: Username.create(input.username),
      isVerified: input.isVerified ?? false,
      verificationCode: input.verificationCode ?? null,
      verificationCodeExpiresAt: input.verificationCodeExpiresAt ?? null,
      verifiedAt: input.verifiedAt ?? null,
      isDeleted: input.isDeleted ?? false,
      isArchived: input.isArchived ?? false,
      createdAt: input.createdAt ?? now,
      deletedAt: input.deletedAt ?? null,
      archivedAt: input.archivedAt ?? null,
      lastActivityAt: input.lastActivityAt ?? now,
      role: Role.create(input.role ?? "User"),
    });

    return user;
  }

  static rehydrate(props: {
    id: string;
    email: string;
    passwordHash: string;
    username: string;
    isVerified: boolean;
    verificationCode: string | null;
    verificationCodeExpiresAt: Date | null;
    verifiedAt: Date | null;
    isDeleted: boolean;
    isArchived: boolean;
    deletedAt: Date | null;
    archivedAt: Date | null;
    lastActivityAt: Date;
    createdAt: Date;
    role: UserRole;
  }): User {
    return new User({
      id: Uuid.create(props.id),
      email: Email.create(props.email),
      passwordHash: PasswordHash.create(props.passwordHash),
      username: Username.create(props.username),
      isVerified: props.isVerified,
      verificationCode: props.verificationCode,
      verificationCodeExpiresAt: props.verificationCodeExpiresAt,
      verifiedAt: props.verifiedAt,
      isDeleted: props.isDeleted,
      isArchived: props.isArchived,
      createdAt: props.createdAt,
      deletedAt: props.deletedAt,
      archivedAt: props.archivedAt,
      lastActivityAt: props.lastActivityAt,
      role: Role.create(props.role),
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get email(): string {
    return this.props.email.toString();
  }

  get passwordHash(): string {
    return this.props.passwordHash.toString();
  }

  get username(): string {
    return this.props.username.toString();
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get verificationCode(): string | null {
    return this.props.verificationCode;
  }

  get verificationCodeExpiresAt(): Date | null {
    return this.props.verificationCodeExpiresAt;
  }

  get verifiedAt(): Date | null {
    return this.props.verifiedAt;
  }

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
  }

  get isArchived(): boolean {
    return this.props.isArchived;
  }

  get archivedAt(): Date | null {
    return this.props.archivedAt;
  }

  get lastActivityAt(): Date {
    return this.props.lastActivityAt;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get role(): UserRole {
    return this.props.role.toString();
  }

  verifyEmail(): void {
    if (this.props.isVerified) {
      return;
    }

    this.props.isVerified = true;
    this.props.verifiedAt = new Date();
    this.props.verificationCode = null;
    this.props.verificationCodeExpiresAt = null;
  }

  setVerificationCode(code: string, expiresAt: Date): void {
    this.props.verificationCode = code.trim();
    this.props.verificationCodeExpiresAt = expiresAt;
    this.props.verifiedAt = null;
    this.props.isVerified = false;
  }

  changeEmail(value: string): void {
    const next = Email.create(value);
    if (next.equals(this.props.email)) {
      return;
    }
    this.props.email = next;
  }

  changePasswordHash(value: string): void {
    const next = PasswordHash.create(value);
    if (next.toString() === this.props.passwordHash.toString()) {
      return;
    }
    this.props.passwordHash = next;
  }

  changeUsername(value: string): void {
    const next = Username.create(value);
    if (next.equals(this.props.username)) {
      return;
    }
    this.props.username = next;
  }

  changeRole(value: UserRole): void {
    const next = Role.create(value);
    if (next.equals(this.props.role)) {
      return;
    }
    this.props.role = next;
  }

  softDelete(at?: Date): void {
    if (this.props.isDeleted) {
      return;
    }
    this.props.isDeleted = true;
    this.props.deletedAt = at ?? new Date();
  }

  archive(at?: Date): void {
    if (this.props.isArchived) {
      return;
    }
    const when = at ?? new Date();
    this.props.isArchived = true;
    this.props.archivedAt = when;
    this.props.isDeleted = true;
    this.props.deletedAt = this.props.deletedAt ?? when;
  }

  restore(): void {
    if (this.props.isArchived) {
      throw ErrorFactory.domain("USERS.RESTORE_FAILED", {
        cause: "Archived users can not be restored",
        userId: this.id,
      });
    }
    if (!this.props.isDeleted) {
      return;
    }
    this.props.isDeleted = false;
    this.props.deletedAt = null;
  }

  touchActivity(at?: Date): void {
    this.props.lastActivityAt = at ?? new Date();
  }

  toJSON(): {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    isVerified: boolean;
    verificationCode: string | null;
    verificationCodeExpiresAt: Date | null;
    verifiedAt: Date | null;
    isDeleted: boolean;
    isArchived: boolean;
    deletedAt: Date | null;
    archivedAt: Date | null;
    lastActivityAt: Date;
    createdAt: Date;
    role: UserRole;
  } {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      passwordHash: this.passwordHash,
      isVerified: this.isVerified,
      verificationCode: this.verificationCode,
      verificationCodeExpiresAt: this.verificationCodeExpiresAt,
      verifiedAt: this.verifiedAt,
      isDeleted: this.isDeleted,
      isArchived: this.isArchived,
      deletedAt: this.deletedAt,
      archivedAt: this.archivedAt,
      lastActivityAt: this.lastActivityAt,
      createdAt: this.createdAt,
      role: this.role,
    };
  }

  toDB(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      password: this.passwordHash,
      is_verified: this.isVerified,
      verification_code: this.verificationCode,
      verification_code_expires_at: this.verificationCodeExpiresAt,
      verified_at: this.verifiedAt,
      is_deleted: this.isDeleted,
      is_archived: this.isArchived,
      deleted_at: this.deletedAt,
      archived_at: this.archivedAt,
      last_activity_at: this.lastActivityAt,
      created_at: this.createdAt,
      role: this.role,
    };
  }
}
