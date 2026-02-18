import { System } from "../../../../domain/aggregates/System";
import { Uuid } from "../../../../domain/aggregates/User";
import { ISystem } from "../../../interfaces/System.port";

export class ListSystemsByGalaxy {
  constructor(private readonly systemRepo: ISystem) {}

  execute(galaxyId: Uuid): Promise<{ rows: System[]; total: number }> {
    return this.systemRepo.findByGalaxy(galaxyId);
  }
}
