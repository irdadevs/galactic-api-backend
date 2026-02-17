import {
  System,
  SystemName,
  SystemPositionProps,
} from "../../domain/aggregates/System";
import { Uuid } from "../../domain/aggregates/User";

export interface ISystem {
  create(system: System): Promise<System>;
  save(system: System): Promise<System>;
  findById(id: Uuid): Promise<System | null>;
  findByGalaxy(galaxyId: Uuid): Promise<{ rows: System[]; total: number }>;
  findByName(name: SystemName): Promise<System | null>;
  findByPosition(position: SystemPositionProps): Promise<System | null>;
  changeName(id: Uuid, name: SystemName): Promise<System>;
  changePosition(id: Uuid, position: SystemPositionProps): Promise<System>;
  delete(id: Uuid): Promise<void>;
}
