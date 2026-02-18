import { Planet, PlanetName } from "../../../../domain/aggregates/Planet";
import { Uuid } from "../../../../domain/aggregates/User";
import { PlanetCacheService } from "../../../app-services/planets/PlanetCache.service";
import { IPlanet } from "../../../interfaces/Planet.port";

export class FindPlanet {
  constructor(
    private readonly planetRepo: IPlanet,
    private readonly planetCache: PlanetCacheService,
  ) {}

  async byId(id: Uuid): Promise<Planet | null> {
    const cached = await this.planetCache.getById(id.toString());
    if (cached) return cached;
    const planet = await this.planetRepo.findById(id);
    if (planet) await this.planetCache.setPlanet(planet);
    return planet;
  }

  async byName(name: PlanetName): Promise<Planet | null> {
    const cached = await this.planetCache.getByName(name.toString());
    if (cached) return cached;
    const planet = await this.planetRepo.findByName(name);
    if (planet) await this.planetCache.setPlanet(planet);
    return planet;
  }
}
