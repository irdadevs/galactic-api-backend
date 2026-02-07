import { Dice } from "../../utils/Dice.class";
import { DomainErrorFactory } from "../../utils/errors/Error.map";
import { generateCelestialName } from "../../utils/nameGenerator";
import { REGEXP } from "../../utils/Regexp";
import { Uuid } from "./User";

const ALLOWED_MOON_SIZES = ["dwarf", "medium", "giant"] as const;
const MOON_MASS = 7.342e22 as const; // kg
const MOON_RADIUS = 1.7374e6 as const; // meters
const MOON_GRAVITY = 1.62 as const; // m/s^2

const MOON_SIZE_MASS = {
  dwarf: [0.05, 0.4],
  medium: [0.4, 1.2],
  giant: [1.2, 4],
} as const;

const MOON_SIZE_RADIUS = {
  dwarf: [0.3, 0.7],
  medium: [0.7, 1.3],
  giant: [1.3, 2.5],
} as const;

const MOON_TEMPERATURE = [50, 350] as const;

export type MoonSize = (typeof ALLOWED_MOON_SIZES)[number];

export type MoonProps = {
  id: Uuid;
  systemId: Uuid;
  name: MoonName;
  size: MoonSize;
  orbital: number;
  relativeMass: number;
  absoluteMass: number;
  relativeRadius: number;
  absoluteRadius: number;
  gravity: number;
  temperature: number;
};

export type MoonCreateProps = {
  id?: string;
  systemId: string;
  name?: string;
  size?: MoonSize;
  orbital: number;
  relativeMass?: number;
  relativeRadius?: number;
  temperature?: number;
};

export type MoonDTO = {
  id: string;
  system_id: string;
  name: string;
  size: MoonSize;
  orbital: number;
  relative_mass: number;
  absolute_mass: number;
  relative_radius: number;
  absolute_radius: number;
  gravity: number;
  temperature: number;
};

export class MoonName {
  private constructor(private readonly value: string) {}

  static create(value: string): MoonName {
    const normalized = value.trim();
    if (!REGEXP.planetName.test(normalized)) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_MOON_NAME", {
        name: value,
      });
    }

    return new MoonName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: MoonName): boolean {
    return this.value === other.value;
  }
}

export class MoonSizeValue {
  private constructor(private readonly value: MoonSize) {}

  static create(value: string): MoonSizeValue {
    const valid = ALLOWED_MOON_SIZES.includes(value as MoonSize);
    if (!valid) {
      throw DomainErrorFactory.domain("DOMAIN.INVALID_MOON_SIZE", {
        size: value,
      });
    }
    return new MoonSizeValue(value as MoonSize);
  }

  toString(): MoonSize {
    return this.value;
  }

  equals(other: MoonSizeValue): boolean {
    return this.value === other.value;
  }
}

const randomBetween = (min: number, max: number): number => {
  if (min === max) return min;
  return min + Dice.roll(1) * (max - min);
};

const ensurePositive = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw DomainErrorFactory.domain("DOMAIN.INVALID_MOON_VALUE", { field });
  }
};

const ensureNonNegative = (field: string, value: number): void => {
  if (!Number.isFinite(value) || value < 0) {
    throw DomainErrorFactory.domain("DOMAIN.INVALID_MOON_VALUE", { field });
  }
};

const ensureOrbital = (value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw DomainErrorFactory.domain("DOMAIN.INVALID_MOON_ORBITAL", {
      orbital: value,
    });
  }
};

export class Moon {
  private props: MoonProps;

  private constructor(props: MoonProps) {
    this.props = { ...props };
  }

  static create(input: MoonCreateProps): Moon {
    const size = MoonSizeValue.create(input.size ?? "medium");

    ensureOrbital(input.orbital);

    const massRange = MOON_SIZE_MASS[size.toString()];
    const radiusRange = MOON_SIZE_RADIUS[size.toString()];

    const relativeMass =
      input.relativeMass ?? randomBetween(massRange[0], massRange[1]);
    const relativeRadius =
      input.relativeRadius ?? randomBetween(radiusRange[0], radiusRange[1]);
    const temperature =
      input.temperature ?? randomBetween(MOON_TEMPERATURE[0], MOON_TEMPERATURE[1]);

    ensurePositive("relativeMass", relativeMass);
    ensurePositive("relativeRadius", relativeRadius);
    ensurePositive("temperature", temperature);

    const absoluteMass = relativeMass * MOON_MASS;
    const absoluteRadius = relativeRadius * MOON_RADIUS;
    const gravity =
      MOON_GRAVITY * (relativeMass / (relativeRadius * relativeRadius));

    return new Moon({
      id: Uuid.create(input.id),
      systemId: Uuid.create(input.systemId),
      name: MoonName.create(input.name ?? generateCelestialName()),
      size: size.toString(),
      orbital: input.orbital,
      relativeMass,
      absoluteMass,
      relativeRadius,
      absoluteRadius,
      gravity,
      temperature,
    });
  }

  static rehydrate(props: {
    id: string;
    systemId: string;
    name: string;
    size: MoonSize;
    orbital: number;
    relativeMass: number;
    absoluteMass: number;
    relativeRadius: number;
    absoluteRadius: number;
    gravity: number;
    temperature: number;
  }): Moon {
    ensureOrbital(props.orbital);
    ensurePositive("relativeMass", props.relativeMass);
    ensurePositive("relativeRadius", props.relativeRadius);
    ensurePositive("temperature", props.temperature);
    ensureNonNegative("gravity", props.gravity);

    return new Moon({
      id: Uuid.create(props.id),
      systemId: Uuid.create(props.systemId),
      name: MoonName.create(props.name),
      size: MoonSizeValue.create(props.size).toString(),
      orbital: props.orbital,
      relativeMass: props.relativeMass,
      absoluteMass: props.absoluteMass,
      relativeRadius: props.relativeRadius,
      absoluteRadius: props.absoluteRadius,
      gravity: props.gravity,
      temperature: props.temperature,
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

  get size(): MoonSize {
    return this.props.size;
  }

  get orbital(): number {
    return this.props.orbital;
  }

  get relativeMass(): number {
    return this.props.relativeMass;
  }

  get absoluteMass(): number {
    return this.props.absoluteMass;
  }

  get relativeRadius(): number {
    return this.props.relativeRadius;
  }

  get absoluteRadius(): number {
    return this.props.absoluteRadius;
  }

  get gravity(): number {
    return this.props.gravity;
  }

  get temperature(): number {
    return this.props.temperature;
  }

  rename(value: string): void {
    const next = MoonName.create(value);
    if (next.equals(this.props.name)) {
      return;
    }
    this.props.name = next;
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
    size: MoonSize;
    orbital: number;
    relativeMass: number;
    absoluteMass: number;
    relativeRadius: number;
    absoluteRadius: number;
    gravity: number;
    temperature: number;
  } {
    return {
      id: this.id,
      systemId: this.systemId,
      name: this.name,
      size: this.size,
      orbital: this.orbital,
      relativeMass: this.relativeMass,
      absoluteMass: this.absoluteMass,
      relativeRadius: this.relativeRadius,
      absoluteRadius: this.absoluteRadius,
      gravity: this.gravity,
      temperature: this.temperature,
    };
  }

  toDB(): MoonDTO {
    return {
      id: this.id,
      system_id: this.systemId,
      name: this.name,
      size: this.size,
      orbital: this.orbital,
      relative_mass: this.relativeMass,
      absolute_mass: this.absoluteMass,
      relative_radius: this.relativeRadius,
      absolute_radius: this.absoluteRadius,
      gravity: this.gravity,
      temperature: this.temperature,
    };
  }
}
