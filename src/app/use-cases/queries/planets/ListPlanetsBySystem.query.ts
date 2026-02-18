import { Planet } from "../../../../domain/aggregates/Planet";
import { Uuid } from "../../../../domain/aggregates/User";
import { PlanetCacheService } from "../../../app-services/planets/PlanetCache.service";
import { IPlanet } from "../../../interfaces/Planet.port";

export class ListPlanetsBySystem {
  constructor(
    private readonly planetRepo: IPlanet,
    private readonly planetCache: PlanetCacheService,
  ) {}

  async execute(systemId: Uuid): Promise<{ rows: Planet[]; total: number }> {
    const cached = await this.planetCache.getListBySystem(systemId.toString());
    if (cached) return cached;
    const result = await this.planetRepo.findBySystem(systemId);
    await this.planetCache.setListBySystem(systemId.toString(), result);
    return result;
  }
}
