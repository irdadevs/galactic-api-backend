import { Moon } from "../../../../domain/aggregates/Moon";
import { Uuid } from "../../../../domain/aggregates/User";
import { IMoon } from "../../../interfaces/Moon.port";

export class ListMoonsByPlanet {
  constructor(private readonly moonRepo: IMoon) {}

  execute(planetId: Uuid): Promise<{ rows: Moon[]; total: number }> {
    return this.moonRepo.findByPlanet(planetId);
  }
}
