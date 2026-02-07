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
];

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
  private constructor(private readonly value: string) {}

  static create(value: string): GalaxyShape {
    const valid = ALLOWED_GALAXY_SHAPES.includes(value);
    if (!valid) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_GALAXY_SHAPE", {
        shape: value,
      });
    }

    return new GalaxyShape(value);
  }

  toString(): string {
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
}
