import { GalaxyName } from "../../../../domain/aggregates/Galaxy";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeGalaxyNameDTO } from "../../../../presentation/security/galaxies/ChangeGalaxyName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { IGalaxy } from "../../../interfaces/Galaxy.port";

export class ChangeGalaxyName {
  constructor(
    private readonly galaxyRepo: IGalaxy,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeGalaxyNameDTO): Promise<void> {
    const galaxy = await this.galaxyRepo.findById(id);
    if (!galaxy) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "galaxy",
        id: id.toString(),
      });
    }

    const existingByName = await this.galaxyRepo.findByName(
      GalaxyName.create(dto.name),
    );
    if (existingByName && existingByName.id !== galaxy.id) {
      throw ErrorFactory.presentation("GALAXY.NAME_ALREADY_EXIST", {
        name: dto.name,
      });
    }

    const previous = { name: galaxy.name };
    galaxy.rename(dto.name);
    await this.galaxyRepo.save(galaxy);
    await this.galaxyCache.invalidateForMutation(galaxy, previous);
  }
}
