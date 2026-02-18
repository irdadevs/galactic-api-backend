import { Uuid } from "../../../../domain/aggregates/User";
import { ChangePlanetBiomeDTO } from "../../../../presentation/security/planets/ChangePlanetBiome.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ChangePlanetBiome {
  constructor(private readonly planetRepo: IPlanet) {}

  async execute(id: Uuid, dto: ChangePlanetBiomeDTO): Promise<void> {
    const planet = await this.planetRepo.findById(id);
    if (!planet) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }

    planet.changeBiome(dto.biome);
    await this.planetRepo.save(planet);
  }
}
