import {
  System,
  SystemName,
  SystemPositionProps,
} from "../../../../domain/aggregates/System";
import { Uuid } from "../../../../domain/aggregates/User";
import { ISystem } from "../../../interfaces/System.port";

export class FindSystem {
  constructor(private readonly systemRepo: ISystem) {}

  byId(id: Uuid): Promise<System | null> {
    return this.systemRepo.findById(id);
  }

  byName(name: SystemName): Promise<System | null> {
    return this.systemRepo.findByName(name);
  }

  byPosition(position: SystemPositionProps): Promise<System | null> {
    return this.systemRepo.findByPosition(position);
  }
}
