import { PlanetName } from "../../../../domain/aggregates/Planet";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangePlanetNameDTO } from "../../../../presentation/security/planets/ChangePlanetName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ChangePlanetName {
  constructor(private readonly planetRepo: IPlanet) {}

  async execute(id: Uuid, dto: ChangePlanetNameDTO): Promise<void> {
    const planet = await this.planetRepo.findById(id);
    if (!planet) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }

    const existing = await this.planetRepo.findByName(PlanetName.create(dto.name));
    if (existing && existing.id !== planet.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "name",
      });
    }

    planet.rename(dto.name);
    await this.planetRepo.save(planet);
  }
}
