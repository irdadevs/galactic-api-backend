import { Planet } from "../../../../domain/aggregates/Planet";
import { Uuid } from "../../../../domain/aggregates/User";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ListPlanetsBySystem {
  constructor(private readonly planetRepo: IPlanet) {}

  execute(systemId: Uuid): Promise<{ rows: Planet[]; total: number }> {
    return this.planetRepo.findBySystem(systemId);
  }
}
