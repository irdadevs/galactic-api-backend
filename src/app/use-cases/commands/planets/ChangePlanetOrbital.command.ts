import { Uuid } from "../../../../domain/aggregates/User";
import { ChangePlanetOrbitalDTO } from "../../../../presentation/security/planets/ChangePlanetOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ChangePlanetOrbital {
  constructor(private readonly planetRepo: IPlanet) {}

  async execute(id: Uuid, dto: ChangePlanetOrbitalDTO): Promise<void> {
    const planet = await this.planetRepo.findById(id);
    if (!planet) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }

    planet.changeOrbital(dto.orbital);
    await this.planetRepo.save(planet);
  }
}
