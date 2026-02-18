import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeMoonOrbitalDTO } from "../../../../presentation/security/moons/ChangeMoonOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { MoonCacheService } from "../../../app-services/moons/MoonCache.service";
import { IPlanet } from "../../../interfaces/Planet.port";
import { ISystem } from "../../../interfaces/System.port";
import { IMoon } from "../../../interfaces/Moon.port";

export class ChangeMoonOrbital {
  constructor(
    private readonly moonRepo: IMoon,
    private readonly planetRepo: IPlanet,
    private readonly systemRepo: ISystem,
    private readonly moonCache: MoonCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeMoonOrbitalDTO): Promise<void> {
    const moon = await this.moonRepo.findById(id);
    if (!moon) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }

    const previous = { name: moon.name, planetId: moon.planetId };
    moon.changeOrbital(dto.orbital);
    await this.moonRepo.save(moon);
    await this.moonCache.invalidateForMutation(moon, previous);
    const planet = await this.planetRepo.findById(Uuid.create(moon.planetId));
    if (planet) {
      const system = await this.systemRepo.findById(Uuid.create(planet.systemId));
      if (system) {
        await this.galaxyCache.invalidatePopulate(system.galaxyId);
      }
    }
  }
}
