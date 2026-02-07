import { randomUUID } from "crypto";
import { UserRole } from "../../../types/User.types";
import { DomainErrorFactory } from "../../utils/errors/Error.map";
import { REGEXP } from "../../utils/Regexp";

export type UserProps = {
  id: Uuid;
  email: Email;
  passwordHash: PasswordHash;
  isVerified: boolean;
  createdAt: Date;
  role: Role;
};

export type UserCreateProps = {
  email: string;
  passwordHash: string;
  id?: string;
  isVerified?: boolean;
  role?: UserRole;
  createdAt?: Date;
};

export type UserDTO = {
  id: string;
  email: string;
  password: string;
  is_verified: boolean;
  created_at: Date;
  role: UserRole;
};

export class Uuid {
  private constructor(private readonly value: string) {}

  static create(value?: string): Uuid {
    const id = value ?? randomUUID();
    if (!Uuid.isValid(id)) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_USER_ID", {
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
      throw DomainErrorFactory.domain("DOMAIN.INVALID_USER_EMAIL", {
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
      throw DomainErrorFactory.domain("DOMAIN.INVALID_USER_PASSWORD", {
        password: value,
      });
    }
    return new PasswordHash(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class Role {
  private constructor(private readonly value: UserRole) {}

  static create(value: UserRole): Role {
    if (value !== "User" && value !== "Admin") {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_USER_ROLE", {
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
      isVerified: input.isVerified ?? false,
      createdAt: input.createdAt ?? now,
      role: Role.create(input.role ?? "User"),
    });

    return user;
  }

  static rehydrate(props: {
    id: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    createdAt: Date;
    role: UserRole;
  }): User {
    return new User({
      id: Uuid.create(props.id),
      email: Email.create(props.email),
      passwordHash: PasswordHash.create(props.passwordHash),
      isVerified: props.isVerified,
      createdAt: props.createdAt,
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

  get isVerified(): boolean {
    return this.props.isVerified;
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

  toJSON(): {
    id: string;
    email: string;
    passwordHash: string;
    isVerified: boolean;
    createdAt: Date;
    role: UserRole;
  } {
    return {
      id: this.id,
      email: this.email,
      passwordHash: this.passwordHash,
      isVerified: this.isVerified,
      createdAt: this.createdAt,
      role: this.role,
    };
  }

  toDB(): UserDTO {
    return {
      id: this.id,
      email: this.email,
      password: this.passwordHash,
      is_verified: this.isVerified,
      created_at: this.createdAt,
      role: this.role,
    };
  }
}
