import { Planet, PlanetName } from "../../../../domain/aggregates/Planet";
import { Uuid } from "../../../../domain/aggregates/User";
import { IPlanet } from "../../../interfaces/Planet.port";

export class FindPlanet {
  constructor(private readonly planetRepo: IPlanet) {}

  byId(id: Uuid): Promise<Planet | null> {
    return this.planetRepo.findById(id);
  }

  byName(name: PlanetName): Promise<Planet | null> {
    return this.planetRepo.findByName(name);
  }
}
