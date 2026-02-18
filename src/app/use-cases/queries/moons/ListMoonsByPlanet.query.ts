import { Moon } from "../../../../domain/aggregates/Moon";
import { Uuid } from "../../../../domain/aggregates/User";
import { MoonCacheService } from "../../../app-services/moons/MoonCache.service";
import { IMoon } from "../../../interfaces/Moon.port";

export class ListMoonsByPlanet {
  constructor(
    private readonly moonRepo: IMoon,
    private readonly moonCache: MoonCacheService,
  ) {}

  async execute(planetId: Uuid): Promise<{ rows: Moon[]; total: number }> {
    const cached = await this.moonCache.getListByPlanet(planetId.toString());
    if (cached) return cached;
    const result = await this.moonRepo.findByPlanet(planetId);
    await this.moonCache.setListByPlanet(planetId.toString(), result);
    return result;
  }
}
