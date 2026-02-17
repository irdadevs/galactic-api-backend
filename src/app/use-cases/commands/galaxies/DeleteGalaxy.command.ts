import { Uuid } from "../../../../domain/aggregates/User";
import { UnitOfWorkFactory } from "../../../../config/db/UnitOfWork";
import {
  GalaxyLifecycleService,
  ProceduralRepoFactories,
} from "../../../app-services/galaxies/GalaxyLifecycle.service";

export class DeleteGalaxy {
  constructor(
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly repoFactories: ProceduralRepoFactories,
    private readonly lifecycle: GalaxyLifecycleService,
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

      await this.lifecycle.deleteGalaxyTree(id, repos);
      await uow.commit();
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
