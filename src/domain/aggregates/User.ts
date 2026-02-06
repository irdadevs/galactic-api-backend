import { UUID } from "crypto";
import { UserRole } from "../../../types/users.types";

export interface UserProps {
  id: UUID;
  email: string;
  password: string;
  isVerified: boolean;
  createdAt: Date;
  role: UserRole;
}

export interface UserDTO {
  id: string;
  email: string;
  password: string;
  is_verified: boolean;
  created_at: Date;
  role: string;
}

export class User {
  private props: UserProps;

  private constructor(props: UserProps) {
    this.props = props;
  }

  // GETTERS
  get id(): UUID {
    return this.props.id;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get isVerified(): boolean {
    return this.props.isVerified;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get role(): UserRole {
    return this.props.role;
  }

  // METHODS
  verifyEmail(): void {
    if (this.props.isVerified) return; // idempotency

    this.props.isVerified = true;
  }

  toJSON(): UserProps {
    return this.props;
  }

  toDB(): UserDTO {
    return {
      id: this.props.id.toString(),
      email: this.props.email,
      password: this.props.password,
      is_verified: this.props.isVerified,
      created_at: this.props.createdAt,
      role: this.props.role,
    };
  }
}
