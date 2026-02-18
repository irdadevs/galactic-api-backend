import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeAsteroidTypeDTO } from "../../../../presentation/security/asteroids/ChangeAsteroidType.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ChangeAsteroidType {
  constructor(private readonly asteroidRepo: IAsteroid) {}

  async execute(id: Uuid, dto: ChangeAsteroidTypeDTO): Promise<void> {
    const asteroid = await this.asteroidRepo.findById(id);
    if (!asteroid) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }

    asteroid.changeType(dto.type);
    await this.asteroidRepo.save(asteroid);
  }
}
