import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeAsteroidSizeDTO } from "../../../../presentation/security/asteroids/ChangeAsteroidSize.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IAsteroid } from "../../../interfaces/Asteroid.port";

export class ChangeAsteroidSize {
  constructor(private readonly asteroidRepo: IAsteroid) {}

  async execute(id: Uuid, dto: ChangeAsteroidSizeDTO): Promise<void> {
    const asteroid = await this.asteroidRepo.findById(id);
    if (!asteroid) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }

    asteroid.changeSize(dto.size);
    await this.asteroidRepo.save(asteroid);
  }
}
