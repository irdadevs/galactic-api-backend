import { StarName } from "../../../../domain/aggregates/Star";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeStarNameDTO } from "../../../../presentation/security/stars/ChangeStarName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { StarCacheService } from "../../../app-services/stars/StarCache.service";
import { ISystem } from "../../../interfaces/System.port";
import { IStar } from "../../../interfaces/Star.port";

export class ChangeStarName {
  constructor(
    private readonly starRepo: IStar,
    private readonly systemRepo: ISystem,
    private readonly starCache: StarCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeStarNameDTO): Promise<void> {
    const star = await this.starRepo.findById(id);
    if (!star) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }

    const existing = await this.starRepo.findByName(StarName.create(dto.name));
    if (existing && existing.id !== star.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "name",
      });
    }

    const previous = { name: star.name, systemId: star.systemId };
    star.rename(dto.name);
    await this.starRepo.save(star);
    await this.starCache.invalidateForMutation(star, previous);
    const system = await this.systemRepo.findById(Uuid.create(star.systemId));
    if (system) {
      await this.galaxyCache.invalidatePopulate(system.galaxyId);
    }
  }
}
