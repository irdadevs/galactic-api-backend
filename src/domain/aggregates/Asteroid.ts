import { DomainErrorFactory } from "../../utils/errors/Error.map";
import { generateSpecialName, isSpecialName } from "../../utils/nameGenerator";
import { Uuid } from "./User";

const ALLOWED_ASTEROID_TYPES = ["single", "cluster"] as const;
const ALLOWED_ASTEROID_SIZE = ["small", "medium", "big", "massive"] as const;

export type AsteroidType = (typeof ALLOWED_ASTEROID_TYPES)[number];
export type AsteroidSize = (typeof ALLOWED_ASTEROID_SIZE)[number];

export type AsteroidProps = {
  id: Uuid;
  systemId: Uuid;
  name: AsteroidName;
  type: AsteroidType;
  size: AsteroidSize;
  orbital: number;
};

export type AsteroidCreateProps = {
  id?: string;
  systemId: string;
  name?: string;
  type?: AsteroidType;
  size?: AsteroidSize;
  orbital: number;
};

export type AsteroidDTO = {
  id: string;
  system_id: string;
  name: string;
  type: AsteroidType;
  size: AsteroidSize;
  orbital: number;
};

export class AsteroidName {
  private constructor(private readonly value: string) {}

  static create(value: string): AsteroidName {
    const normalized = value.trim();
    if (!isSpecialName(normalized)) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_ASTEROID_NAME", {
        name: value,
      });
    }
    return new AsteroidName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: AsteroidName): boolean {
    return this.value === other.value;
  }
}

export class AsteroidTypeValue {
  private constructor(private readonly value: AsteroidType) {}

  static create(value: string): AsteroidTypeValue {
    const valid = ALLOWED_ASTEROID_TYPES.includes(value as AsteroidType);
    if (!valid) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_ASTEROID_TYPE", {
        type: value,
      });
    }
    return new AsteroidTypeValue(value as AsteroidType);
  }

  toString(): AsteroidType {
    return this.value;
  }

  equals(other: AsteroidTypeValue): boolean {
    return this.value === other.value;
  }
}

export class AsteroidSizeValue {
  private constructor(private readonly value: AsteroidSize) {}

  static create(value: string): AsteroidSizeValue {
    const valid = ALLOWED_ASTEROID_SIZE.includes(value as AsteroidSize);
    if (!valid) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_ASTEROID_SIZE", {
        size: value,
      });
    }
    return new AsteroidSizeValue(value as AsteroidSize);
  }

  toString(): AsteroidSize {
    return this.value;
  }

  equals(other: AsteroidSizeValue): boolean {
    return this.value === other.value;
  }
}

const ensureOrbital = (value: number): void => {
  const isValid =
    Number.isFinite(value) && value > 0 && Math.abs((value % 1) - 0.5) < 1e-9;

  if (!isValid) {
    throw DomainErrorFactory.domain("DOMAIN.INVALID_ASTEROID_ORBITAL", {
      orbital: value,
    });
  }
};

export class Asteroid {
  private props: AsteroidProps;

  private constructor(props: AsteroidProps) {
    this.props = { ...props };
  }

  static create(input: AsteroidCreateProps): Asteroid {
    ensureOrbital(input.orbital);

    return new Asteroid({
      id: Uuid.create(input.id),
      systemId: Uuid.create(input.systemId),
      name: AsteroidName.create(input.name ?? generateSpecialName()),
      type: AsteroidTypeValue.create(input.type ?? "single").toString(),
      size: AsteroidSizeValue.create(input.size ?? "small").toString(),
      orbital: input.orbital,
    });
  }

  static rehydrate(props: {
    id: string;
    systemId: string;
    name: string;
    type: AsteroidType;
    size: AsteroidSize;
    orbital: number;
  }): Asteroid {
    ensureOrbital(props.orbital);

    return new Asteroid({
      id: Uuid.create(props.id),
      systemId: Uuid.create(props.systemId),
      name: AsteroidName.create(props.name),
      type: AsteroidTypeValue.create(props.type).toString(),
      size: AsteroidSizeValue.create(props.size).toString(),
      orbital: props.orbital,
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get systemId(): string {
    return this.props.systemId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get type(): AsteroidType {
    return this.props.type;
  }

  get size(): AsteroidSize {
    return this.props.size;
  }

  get orbital(): number {
    return this.props.orbital;
  }

  rename(value: string): void {
    const next = AsteroidName.create(value);
    if (next.equals(this.props.name)) {
      return;
    }
    this.props.name = next;
  }

  changeType(value: AsteroidType): void {
    const next = AsteroidTypeValue.create(value);
    if (next.toString() === this.props.type) {
      return;
    }
    this.props.type = next.toString();
  }

  changeSize(value: AsteroidSize): void {
    const next = AsteroidSizeValue.create(value);
    if (next.toString() === this.props.size) {
      return;
    }
    this.props.size = next.toString();
  }

  changeOrbital(value: number): void {
    ensureOrbital(value);
    if (value === this.props.orbital) {
      return;
    }
    this.props.orbital = value;
  }

  toJSON(): {
    id: string;
    systemId: string;
    name: string;
    type: AsteroidType;
    size: AsteroidSize;
    orbital: number;
  } {
    return {
      id: this.id,
      systemId: this.systemId,
      name: this.name,
      type: this.type,
      size: this.size,
      orbital: this.orbital,
    };
  }

  toDB(): AsteroidDTO {
    return {
      id: this.id,
      system_id: this.systemId,
      name: this.name,
      type: this.type,
      size: this.size,
      orbital: this.orbital,
    };
  }
}
