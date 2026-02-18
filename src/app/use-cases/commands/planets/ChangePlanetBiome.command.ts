import { Uuid } from "../../../../domain/aggregates/User";
import { ChangePlanetBiomeDTO } from "../../../../presentation/security/planets/ChangePlanetBiome.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { PlanetCacheService } from "../../../app-services/planets/PlanetCache.service";
import { ISystem } from "../../../interfaces/System.port";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ChangePlanetBiome {
  constructor(
    private readonly planetRepo: IPlanet,
    private readonly systemRepo: ISystem,
    private readonly planetCache: PlanetCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangePlanetBiomeDTO): Promise<void> {
    const planet = await this.planetRepo.findById(id);
    if (!planet) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }

    const previous = { name: planet.name, systemId: planet.systemId };
    planet.changeBiome(dto.biome);
    await this.planetRepo.save(planet);
    await this.planetCache.invalidateForMutation(planet, previous);
    const system = await this.systemRepo.findById(Uuid.create(planet.systemId));
    if (system) {
      await this.galaxyCache.invalidatePopulate(system.galaxyId);
    }
  }
}
