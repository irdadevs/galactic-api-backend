import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeStarOrbitalDTO } from "../../../../presentation/security/stars/ChangeStarOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { StarCacheService } from "../../../app-services/stars/StarCache.service";
import { ISystem } from "../../../interfaces/System.port";
import { IStar } from "../../../interfaces/Star.port";

export class ChangeStarOrbital {
  constructor(
    private readonly starRepo: IStar,
    private readonly systemRepo: ISystem,
    private readonly starCache: StarCacheService,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(id: Uuid, dto: ChangeStarOrbitalDTO): Promise<void> {
    const star = await this.starRepo.findById(id);
    if (!star) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }

    const previous = { name: star.name, systemId: star.systemId };
    star.changeOrbital(dto.orbital);
    await this.starRepo.save(star);
    await this.starCache.invalidateForMutation(star, previous);
    const system = await this.systemRepo.findById(Uuid.create(star.systemId));
    if (system) {
      await this.galaxyCache.invalidatePopulate(system.galaxyId);
    }
  }
}
