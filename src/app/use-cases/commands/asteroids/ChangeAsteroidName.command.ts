import { AsteroidName } from "../../../../domain/aggregates/Asteroid";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeAsteroidNameDTO } from "../../../../presentation/security/asteroids/ChangeAsteroidName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { AsteroidCacheService } from "../../../app-services/asteroids/AsteroidCache.service";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { ISystem } from "../../../interfaces/System.port";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ChangeAsteroidName {
  constructor(
    private readonly asteroidRepo: IAsteroid,
    private readonly systemRepo: ISystem,
    private readonly asteroidCache: AsteroidCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeAsteroidNameDTO): Promise<void> {
    const asteroid = await this.asteroidRepo.findById(id);
    if (!asteroid) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }

    const existing = await this.asteroidRepo.findByName(
      AsteroidName.create(dto.name),
    );
    if (existing && existing.id !== asteroid.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "name",
      });
    }

    const previous = { name: asteroid.name, systemId: asteroid.systemId };
    asteroid.rename(dto.name);
    await this.asteroidRepo.save(asteroid);
    await this.asteroidCache.invalidateForMutation(asteroid, previous);
    const system = await this.systemRepo.findById(Uuid.create(asteroid.systemId));
    if (system) {
      await this.galaxyCache.invalidatePopulate(system.galaxyId);
    }
  }
}
