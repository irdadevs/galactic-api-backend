import { Asteroid, AsteroidName } from "../../../../domain/aggregates/Asteroid";
import { Uuid } from "../../../../domain/aggregates/User";
import { AsteroidCacheService } from "../../../app-services/asteroids/AsteroidCache.service";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class FindAsteroid {
  constructor(
    private readonly asteroidRepo: IAsteroid,
    private readonly asteroidCache: AsteroidCacheService,
  ) {}

  async byId(id: Uuid): Promise<Asteroid | null> {
    const cached = await this.asteroidCache.getById(id.toString());
    if (cached) return cached;
    const asteroid = await this.asteroidRepo.findById(id);
    if (asteroid) await this.asteroidCache.setAsteroid(asteroid);
    return asteroid;
  }

  async byName(name: AsteroidName): Promise<Asteroid | null> {
    const cached = await this.asteroidCache.getByName(name.toString());
    if (cached) return cached;
    const asteroid = await this.asteroidRepo.findByName(name);
    if (asteroid) await this.asteroidCache.setAsteroid(asteroid);
    return asteroid;
  }
}
