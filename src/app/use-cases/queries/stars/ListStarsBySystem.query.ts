import { Star } from "../../../../domain/aggregates/Star";
import { Uuid } from "../../../../domain/aggregates/User";
import { StarCacheService } from "../../../app-services/stars/StarCache.service";
import { IStar } from "../../../interfaces/Star.port";

export class ListStarsBySystem {
  constructor(
    private readonly starRepo: IStar,
    private readonly starCache: StarCacheService,
  ) {}

  async execute(systemId: Uuid): Promise<{ rows: Star[]; total: number }> {
    const cached = await this.starCache.getListBySystem(systemId.toString());
    if (cached) return cached;
    const result = await this.starRepo.findBySystem(systemId);
    await this.starCache.setListBySystem(systemId.toString(), result);
    return result;
  }
}
