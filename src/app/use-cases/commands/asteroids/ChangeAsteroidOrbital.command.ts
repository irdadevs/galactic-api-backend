import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeAsteroidOrbitalDTO } from "../../../../presentation/security/asteroids/ChangeAsteroidOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { AsteroidCacheService } from "../../../app-services/asteroids/AsteroidCache.service";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { ISystem } from "../../../interfaces/System.port";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ChangeAsteroidOrbital {
  constructor(
    private readonly asteroidRepo: IAsteroid,
    private readonly systemRepo: ISystem,
    private readonly asteroidCache: AsteroidCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeAsteroidOrbitalDTO): Promise<void> {
    const asteroid = await this.asteroidRepo.findById(id);
    if (!asteroid) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }

    const previous = { name: asteroid.name, systemId: asteroid.systemId };
    asteroid.changeOrbital(dto.orbital);
    await this.asteroidRepo.save(asteroid);
    await this.asteroidCache.invalidateForMutation(asteroid, previous);
    const system = await this.systemRepo.findById(Uuid.create(asteroid.systemId));
    if (system) {
      await this.galaxyCache.invalidatePopulate(system.galaxyId);
    }
  }
}
