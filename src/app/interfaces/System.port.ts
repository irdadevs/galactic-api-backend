import {
  System,
  SystemName,
  SystemPosition,
} from "../../domain/aggregates/System";
import { Uuid } from "../../domain/aggregates/User";

export interface ISystem {
  create(system: System): Promise<System>;
  findById(id: Uuid): Promise<System | null>;
  findByGalaxy(galaxyId: Uuid): Promise<{ rows: System[]; total: number }>;
  findByName(name: SystemName): Promise<System | null>;
  findByPosition(position: SystemPosition): Promise<System | null>;
  changeName(name: SystemName): Promise<System>;
  changePosition(position: SystemPosition): Promise<System>;
  delete(id: Uuid): Promise<void>;
}
