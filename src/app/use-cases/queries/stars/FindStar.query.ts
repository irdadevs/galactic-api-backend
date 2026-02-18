import { Star, StarName } from "../../../../domain/aggregates/Star";
import { Uuid } from "../../../../domain/aggregates/User";
import { StarCacheService } from "../../../app-services/stars/StarCache.service";
import { IStar } from "../../../interfaces/Star.port";

export class FindStar {
  constructor(
    private readonly starRepo: IStar,
    private readonly starCache: StarCacheService,
  ) {}

  async byId(id: Uuid): Promise<Star | null> {
    const cached = await this.starCache.getById(id.toString());
    if (cached) return cached;
    const star = await this.starRepo.findById(id);
    if (star) await this.starCache.setStar(star);
    return star;
  }

  async byName(name: StarName): Promise<Star | null> {
    const cached = await this.starCache.getByName(name.toString());
    if (cached) return cached;
    const star = await this.starRepo.findByName(name);
    if (star) await this.starCache.setStar(star);
    return star;
  }
}
