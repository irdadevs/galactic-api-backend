import { ErrorFactory } from "../../utils/errors/Error.map";
import { REGEXP } from "../../utils/Regexp";
import { Uuid } from "./User";

export type SystemPositionProps = { x: number; y: number; z: number };

export type SystemProps = {
  id: Uuid;
  galaxyId: Uuid;
  name: SystemName;
  position: SystemPosition;
};

export type SystemCreateProps = {
  id?: string;
  galaxyId: string;
  name: string;
  position: SystemPositionProps;
};

export type SystemDTO = {
  id: string;
  galaxy_id: string;
  name: string;
  position_x: number;
  position_y: number;
  position_z: number;
};

export class SystemName {
  private constructor(private readonly value: string) {}

  static create(value: string): SystemName {
    const normalized = value.trim();
    if (!REGEXP.systemName.test(normalized)) {
      throw ErrorFactory.domain("DOMAIN.INVALID_SYSTEM_NAME", {
        name: value,
      });
    }

    return new SystemName(normalized);
  }

  toString(): string {
    return this.value;
  }

  equals(other: SystemName): boolean {
    return this.value === other.value;
  }
}

export class SystemPosition {
  private constructor(private readonly value: SystemPositionProps) {}

  static create(value: SystemPositionProps): SystemPosition {
    const { x, y, z } = value;
    const isValid =
      Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z);

    if (!isValid) {
      throw ErrorFactory.domain("DOMAIN.INVALID_SYSTEM_POSITION", {
        position: `${x},${y},${z}`,
      });
    }

    return new SystemPosition({ x, y, z });
  }

  toJSON(): SystemPositionProps {
    return { ...this.value };
  }

  equals(other: SystemPosition): boolean {
    return (
      this.value.x === other.value.x &&
      this.value.y === other.value.y &&
      this.value.z === other.value.z
    );
  }
}

export class System {
  private props: SystemProps;

  private constructor(props: SystemProps) {
    this.props = { ...props };
  }

  static create(input: SystemCreateProps): System {
    return new System({
      id: Uuid.create(input.id),
      galaxyId: Uuid.create(input.galaxyId),
      name: SystemName.create(input.name),
      position: SystemPosition.create(input.position),
    });
  }

  static rehydrate(props: {
    id: string;
    galaxyId: string;
    name: string;
    position: SystemPositionProps;
  }): System {
    return new System({
      id: Uuid.create(props.id),
      galaxyId: Uuid.create(props.galaxyId),
      name: SystemName.create(props.name),
      position: SystemPosition.create(props.position),
    });
  }

  get id(): string {
    return this.props.id.toString();
  }

  get galaxyId(): string {
    return this.props.galaxyId.toString();
  }

  get name(): string {
    return this.props.name.toString();
  }

  get position(): SystemPositionProps {
    return this.props.position.toJSON();
  }

  rename(value: string): void {
    const next = SystemName.create(value);
    if (next.equals(this.props.name)) {
      return;
    }
    this.props.name = next;
  }

  move(position: SystemPositionProps): void {
    const next = SystemPosition.create(position);
    if (next.equals(this.props.position)) {
      return;
    }
    this.props.position = next;
  }

  toJSON(): {
    id: string;
    galaxyId: string;
    name: string;
    position: SystemPositionProps;
  } {
    return {
      id: this.id,
      galaxyId: this.galaxyId,
      name: this.name,
      position: this.position,
    };
  }

  toDB(): SystemDTO {
    return {
      id: this.id,
      galaxy_id: this.galaxyId,
      name: this.name,
      position_x: this.position.x,
      position_y: this.position.y,
      position_z: this.position.z,
    };
  }
}
