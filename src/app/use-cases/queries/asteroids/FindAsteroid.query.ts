import { Asteroid, AsteroidName } from "../../../../domain/aggregates/Asteroid";
import { Uuid } from "../../../../domain/aggregates/User";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class FindAsteroid {
  constructor(private readonly asteroidRepo: IAsteroid) {}

  byId(id: Uuid): Promise<Asteroid | null> {
    return this.asteroidRepo.findById(id);
  }

  byName(name: AsteroidName): Promise<Asteroid | null> {
    return this.asteroidRepo.findByName(name);
  }
}
