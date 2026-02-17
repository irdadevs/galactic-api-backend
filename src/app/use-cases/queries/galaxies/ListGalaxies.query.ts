import { Galaxy } from "../../../../domain/aggregates/Galaxy";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { IGalaxy, ListGalaxyQuery } from "../../../interfaces/Galaxy.port";

export class ListGalaxies {
  constructor(
    private readonly galaxyRepo: IGalaxy,
    private readonly galaxyCache: GalaxyCacheService,
  ) {}

  async execute(
    query: ListGalaxyQuery,
  ): Promise<{ rows: Galaxy[]; total: number }> {
    const cached = await this.galaxyCache.getList(query);
    if (cached) return cached;

    const result = await this.galaxyRepo.list(query);
    await this.galaxyCache.setList(query, result);
    return result;
  }
}
