import { AsteroidName } from "../../../../domain/aggregates/Asteroid";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeAsteroidNameDTO } from "../../../../presentation/security/asteroids/ChangeAsteroidName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ChangeAsteroidName {
  constructor(private readonly asteroidRepo: IAsteroid) {}

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

    asteroid.rename(dto.name);
    await this.asteroidRepo.save(asteroid);
  }
}
