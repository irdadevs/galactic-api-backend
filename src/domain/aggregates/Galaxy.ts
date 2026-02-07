import { Dice } from "../../utils/Dice.class";
import { DomainErrorFactory } from "../../utils/errors/Error.map";
import { REGEXP } from "../../utils/Regexp";
import { Uuid } from "./User";

export type GalaxyProps = {
  id: Uuid;
  ownerId: Uuid;
  name: GalaxyName;
  shape: GalaxyShape;
  systemCount: number;
  createdAt: Date;
};

export type GalaxyCreateProps = {
  id?: string;
  ownerId: string;
  name: string;
  shape?: string;
  systemCount: number;
  createdAt?: Date;
};

export type GalaxyDTO = {
  id: string;
  owner_id: string;
  name: string;
  shape: string;
  system_count: number;
  created_at: Date;
};

const ALLOWED_GALAXY_SHAPES = [
  "spherical",
  "3-arm spiral",
  "5-arm spiral",
  "irregular",
] as const;

export type GalaxyShapeValue = (typeof ALLOWED_GALAXY_SHAPES)[number];

export class GalaxyName {
  private constructor(private readonly value: string) {}

  static create(value: string): GalaxyName {
    const normalized = value.trim();
    if (!REGEXP.galaxyName.test(normalized)) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_GALAXY_NAME", {
        name: value,
      });
    }

    return new GalaxyName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: GalaxyName): boolean {
    return this.value === other.value;
  }
}

export class GalaxyShape {
  private constructor(private readonly value: GalaxyShapeValue) {}

  static create(value: string): GalaxyShape {
    const valid = ALLOWED_GALAXY_SHAPES.includes(value as GalaxyShapeValue);
    if (!valid) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_GALAXY_SHAPE", {
        shape: value,
      });
    }

    return new GalaxyShape(value as GalaxyShapeValue);
  }

  toString(): GalaxyShapeValue {
    return this.value;
  }

  equals(other: GalaxyShape): boolean {
    return this.value === other.value;
  }
}

export class Galaxy {
  private props: GalaxyProps;

  private constructor(props: GalaxyProps) {
    this.props = { ...props };
  }

  static create(input: GalaxyCreateProps): Galaxy {
    const now = new Date();

    const galaxy = new Galaxy({
      id: Uuid.create(input.id),
      ownerId: Uuid.create(input.ownerId),
      name: GalaxyName.create(input.name),
      shape: input.shape
        ? GalaxyShape.create(input.shape)
        : GalaxyShape.create(
            ALLOWED_GALAXY_SHAPES[
              Dice.roll(ALLOWED_GALAXY_SHAPES.length, true)
            ],
          ),
      systemCount: input.systemCount < 1 ? 1 : input.systemCount,
      createdAt: input.createdAt ?? now,
    });

    return galaxy;
  }

  static rehydrate(props: {
    id: string;
    ownerId: string;
    name: string;
    shape: string;
    systemCount: number;
    createdAt: Date;
  }): Galaxy {
    return new Galaxy({
      id: Uuid.create(props.id),
      ownerId: Uuid.create(props.ownerId),
      name: GalaxyName.create(props.name),
      shape: GalaxyShape.create(props.shape),
      systemCount: props.systemCount,
      createdAt: props.createdAt,
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get ownerId(): string {
    return this.props.ownerId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get shape(): GalaxyShapeValue {
    return this.props.shape.toString();
  }

  get systemCount(): number {
    return this.props.systemCount;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  rename(value: string): void {
    const next = GalaxyName.create(value);
    if (next.equals(this.props.name)) {
      return;
    }
    this.props.name = next;
  }

  changeShape(value: string): void {
    const next = GalaxyShape.create(value);
    if (next.equals(this.props.shape)) {
      return;
    }
    this.props.shape = next;
  }

  changeSystemCount(value: number): void {
    const normalized = value < 1 ? 1 : value;
    if (normalized === this.props.systemCount) {
      return;
    }
    this.props.systemCount = normalized;
  }

  toJSON(): {
    id: string;
    ownerId: string;
    name: string;
    shape: GalaxyShapeValue;
    systemCount: number;
    createdAt: Date;
  } {
    return {
      id: this.id,
      ownerId: this.ownerId,
      name: this.name,
      shape: this.shape,
      systemCount: this.systemCount,
      createdAt: this.createdAt,
    };
  }

  toDB(): GalaxyDTO {
    return {
      id: this.id,
      owner_id: this.ownerId,
      name: this.name,
      shape: this.shape,
      system_count: this.systemCount,
      created_at: this.createdAt,
    };
  }
}
