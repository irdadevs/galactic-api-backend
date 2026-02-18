import { Asteroid } from "../../../../domain/aggregates/Asteroid";
import { Uuid } from "../../../../domain/aggregates/User";
import { AsteroidCacheService } from "../../../app-services/asteroids/AsteroidCache.service";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ListAsteroidsBySystem {
  constructor(
    private readonly asteroidRepo: IAsteroid,
    private readonly asteroidCache: AsteroidCacheService,
  ) {}

  async execute(systemId: Uuid): Promise<{ rows: Asteroid[]; total: number }> {
    const cached = await this.asteroidCache.getListBySystem(systemId.toString());
    if (cached) return cached;
    const result = await this.asteroidRepo.findBySystem(systemId);
    await this.asteroidCache.setListBySystem(systemId.toString(), result);
    return result;
  }
}
