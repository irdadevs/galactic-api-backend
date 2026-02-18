import { Moon, MoonName } from "../../../../domain/aggregates/Moon";
import { Uuid } from "../../../../domain/aggregates/User";
import { MoonCacheService } from "../../../app-services/moons/MoonCache.service";
import { IMoon } from "../../../interfaces/Moon.port";

export class FindMoon {
  constructor(
    private readonly moonRepo: IMoon,
    private readonly moonCache: MoonCacheService,
  ) {}

  async byId(id: Uuid): Promise<Moon | null> {
    const cached = await this.moonCache.getById(id.toString());
    if (cached) return cached;
    const moon = await this.moonRepo.findById(id);
    if (moon) await this.moonCache.setMoon(moon);
    return moon;
  }

  async byName(name: MoonName): Promise<Moon | null> {
    const cached = await this.moonCache.getByName(name.toString());
    if (cached) return cached;
    const moon = await this.moonRepo.findByName(name);
    if (moon) await this.moonCache.setMoon(moon);
    return moon;
  }
}
