import { System } from "../../../../domain/aggregates/System";
import { Uuid } from "../../../../domain/aggregates/User";
import { SystemCacheService } from "../../../app-services/systems/SystemCache.service";
import { ISystem } from "../../../interfaces/System.port";

export class ListSystemsByGalaxy {
  constructor(
    private readonly systemRepo: ISystem,
    private readonly systemCache: SystemCacheService,
  ) {}

  async execute(galaxyId: Uuid): Promise<{ rows: System[]; total: number }> {
    const cached = await this.systemCache.getListByGalaxy(galaxyId.toString());
    if (cached) return cached;

    const result = await this.systemRepo.findByGalaxy(galaxyId);
    await this.systemCache.setListByGalaxy(galaxyId.toString(), result);
    return result;
  }
}
