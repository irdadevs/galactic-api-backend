import { PlanetName } from "../../../../domain/aggregates/Planet";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangePlanetNameDTO } from "../../../../presentation/security/planets/ChangePlanetName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { PlanetCacheService } from "../../../app-services/planets/PlanetCache.service";
import { ISystem } from "../../../interfaces/System.port";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ChangePlanetName {
  constructor(
    private readonly planetRepo: IPlanet,
    private readonly systemRepo: ISystem,
    private readonly planetCache: PlanetCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

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

    const previous = { name: planet.name, systemId: planet.systemId };
    planet.rename(dto.name);
    await this.planetRepo.save(planet);
    await this.planetCache.invalidateForMutation(planet, previous);
    const system = await this.systemRepo.findById(Uuid.create(planet.systemId));
    if (system) {
      await this.galaxyCache.invalidatePopulate(system.galaxyId);
    }
  }
}
