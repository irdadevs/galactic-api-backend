import { Asteroid } from "../../../../domain/aggregates/Asteroid";
import { Uuid } from "../../../../domain/aggregates/User";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ListAsteroidsBySystem {
  constructor(private readonly asteroidRepo: IAsteroid) {}

  execute(systemId: Uuid): Promise<{ rows: Asteroid[]; total: number }> {
    return this.asteroidRepo.findBySystem(systemId);
  }
}
