import {
  System,
  SystemName,
  SystemPositionProps,
} from "../../domain/aggregates/System";
import { Uuid } from "../../domain/aggregates/User";

export interface ISystem {
  create(system: System): Promise<System>;
  findById(id: Uuid): Promise<System | null>;
  findByGalaxy(galaxyId: Uuid): Promise<{ rows: System[]; total: number }>;
  findByName(name: SystemName): Promise<System | null>;
  findByPosition(position: SystemPositionProps): Promise<System | null>;
  changeName(name: SystemName): Promise<System>;
  changePosition(position: SystemPositionProps): Promise<System>;
  delete(id: Uuid): Promise<void>;
}
