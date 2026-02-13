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
  isDeleted: boolean;
  role: Role;
  deletedAt: Date | null;
  createdAt: Date;
};

export type UserCreateProps = {
  email: string;
  passwordHash: string;
  username: string;
  id?: string;
  isVerified?: boolean;
  isDeleted?: boolean;
  deletedAt?: Date | null;
  role?: UserRole;
  createdAt?: Date;
};

export type UserDTO = {
  id: string;
  email: string;
  username: string;
  password: string;
  is_verified: boolean;
  is_deleted: boolean;
  deleted_at: Date | null;
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
      isDeleted: input.isDeleted ?? false,
      createdAt: input.createdAt ?? now,
      deletedAt: input.deletedAt ?? null,
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
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    role: UserRole;
  }): User {
    return new User({
      id: Uuid.create(props.id),
      email: Email.create(props.email),
      passwordHash: PasswordHash.create(props.passwordHash),
      username: Username.create(props.username),
      isVerified: props.isVerified,
      isDeleted: props.isDeleted,
      createdAt: props.createdAt,
      deletedAt: props.deletedAt,
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

  get isDeleted(): boolean {
    return this.props.isDeleted;
  }

  get deletedAt(): Date | null {
    return this.props.deletedAt;
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

  softDelete(at?: Date): void {
    if (this.props.isDeleted) {
      return;
    }
    this.props.isDeleted = true;
    this.props.deletedAt = at ?? new Date();
  }

  restore(): void {
    if (!this.props.isDeleted) {
      return;
    }
    this.props.isDeleted = false;
    this.props.deletedAt = null;
  }

  toJSON(): {
    id: string;
    email: string;
    username: string;
    passwordHash: string;
    isVerified: boolean;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    role: UserRole;
  } {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      passwordHash: this.passwordHash,
      isVerified: this.isVerified,
      isDeleted: this.isDeleted,
      deletedAt: this.deletedAt,
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
      is_deleted: this.isDeleted,
      deleted_at: this.deletedAt,
      created_at: this.createdAt,
      role: this.role,
    };
  }
}
