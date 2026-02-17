import { Galaxy, GalaxyName } from "../../../../domain/aggregates/Galaxy";
import { Uuid } from "../../../../domain/aggregates/User";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { IGalaxy } from "../../../interfaces/Galaxy.port";

export class FindGalaxy {
  constructor(
    private readonly galaxyRepo: IGalaxy,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async byId(id: Uuid): Promise<Galaxy | null> {
    const cached = await this.galaxyCache.getById(id.toString());
    if (cached) return cached;

    const galaxy = await this.galaxyRepo.findById(id);
    if (galaxy) {
      await this.galaxyCache.setGalaxy(galaxy);
    }
    return galaxy;
  }

  async byOwner(ownerId: Uuid): Promise<Galaxy | null> {
    const cached = await this.galaxyCache.getByOwner(ownerId.toString());
    if (cached) return cached;

    const galaxy = await this.galaxyRepo.findByOwner(ownerId);
    if (galaxy) {
      await this.galaxyCache.setGalaxy(galaxy);
    }
    return galaxy;
  }

  async byName(name: GalaxyName): Promise<Galaxy | null> {
    const cached = await this.galaxyCache.getByName(name.toString());
    if (cached) return cached;

    const galaxy = await this.galaxyRepo.findByName(name);
    if (galaxy) {
      await this.galaxyCache.setGalaxy(galaxy);
    }
    return galaxy;
  }
}
