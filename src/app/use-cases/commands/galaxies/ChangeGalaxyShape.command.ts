import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeGalaxyShapeDTO } from "../../../../presentation/security/galaxies/ChangeGalaxyShape.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { IGalaxy } from "../../../interfaces/Galaxy.port";

export class ChangeGalaxyShape {
  constructor(
    private readonly galaxyRepo: IGalaxy,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeGalaxyShapeDTO): Promise<void> {
    const galaxy = await this.galaxyRepo.findById(id);
    if (!galaxy) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "galaxy",
        id: id.toString(),
      });
    }

    galaxy.changeShape(dto.shape);
    await this.galaxyRepo.save(galaxy);
    await this.galaxyCache.invalidateForMutation(galaxy);
  }
}
