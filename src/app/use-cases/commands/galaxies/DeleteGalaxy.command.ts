import { Uuid } from "../../../../domain/aggregates/User";
import { UnitOfWorkFactory } from "../../../../config/db/UnitOfWork";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { SystemCacheService } from "../../../app-services/systems/SystemCache.service";
import {
  GalaxyLifecycleService,
  ProceduralRepoFactories,
} from "../../../app-services/galaxies/GalaxyLifecycle.service";

export class DeleteGalaxy {
  constructor(
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly repoFactories: ProceduralRepoFactories,
    private readonly lifecycle: GalaxyLifecycleService,
    private readonly galaxyCache: GalaxyCacheService,
    private readonly systemCache: SystemCacheService,
  ) {}

  async execute(id: Uuid): Promise<void> {
    const uow = await this.uowFactory.start();
    try {
      const repos = {
        galaxy: this.repoFactories.galaxy(uow.db),
        system: this.repoFactories.system(uow.db),
        star: this.repoFactories.star(uow.db),
        planet: this.repoFactories.planet(uow.db),
        moon: this.repoFactories.moon(uow.db),
        asteroid: this.repoFactories.asteroid(uow.db),
      };
      const existing = await repos.galaxy.findById(id);

      const deletedSystems = await this.lifecycle.deleteGalaxyTree(id, repos);
      await uow.commit();
      if (existing) {
        await this.galaxyCache.invalidateForDelete({
          id: existing.id,
          ownerId: existing.ownerId,
          name: existing.name,
        });
      }
      for (const system of deletedSystems) {
        await this.systemCache.invalidateForDelete({
          id: system.id,
          galaxyId: system.galaxyId,
          name: system.name,
          position: system.position,
        });
      }
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
