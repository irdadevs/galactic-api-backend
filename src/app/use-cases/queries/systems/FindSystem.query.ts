import {
  System,
  SystemName,
  SystemPositionProps,
} from "../../../../domain/aggregates/System";
import { Uuid } from "../../../../domain/aggregates/User";
import { SystemCacheService } from "../../../app-services/systems/SystemCache.service";
import { ISystem } from "../../../interfaces/System.port";

export class FindSystem {
  constructor(
    private readonly systemRepo: ISystem,
    private readonly systemCache: SystemCacheService,
  ) {}

  async byId(id: Uuid): Promise<System | null> {
    const cached = await this.systemCache.getById(id.toString());
    if (cached) return cached;

    const system = await this.systemRepo.findById(id);
    if (system) await this.systemCache.setSystem(system);
    return system;
  }

  async byName(name: SystemName): Promise<System | null> {
    const cached = await this.systemCache.getByName(name.toString());
    if (cached) return cached;

    const system = await this.systemRepo.findByName(name);
    if (system) await this.systemCache.setSystem(system);
    return system;
  }

  async byPosition(position: SystemPositionProps): Promise<System | null> {
    const cached = await this.systemCache.getByPosition(position);
    if (cached) return cached;

    const system = await this.systemRepo.findByPosition(position);
    if (system) await this.systemCache.setSystem(system);
    return system;
  }
}
