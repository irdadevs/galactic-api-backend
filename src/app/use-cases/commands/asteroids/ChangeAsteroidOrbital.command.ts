import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeAsteroidOrbitalDTO } from "../../../../presentation/security/asteroids/ChangeAsteroidOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ChangeAsteroidOrbital {
  constructor(private readonly asteroidRepo: IAsteroid) {}

  async execute(id: Uuid, dto: ChangeAsteroidOrbitalDTO): Promise<void> {
    const asteroid = await this.asteroidRepo.findById(id);
    if (!asteroid) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }

    asteroid.changeOrbital(dto.orbital);
    await this.asteroidRepo.save(asteroid);
  }
}
