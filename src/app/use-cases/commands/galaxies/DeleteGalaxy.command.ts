import { Uuid } from "../../../../domain/aggregates/User";
import { Queryable } from "../../../../config/db/Queryable";
import { UnitOfWorkFactory } from "../../../../config/db/UnitOfWork";
import { IAsteroid } from "../../../interfaces/Asteroid.port";
import { IGalaxy } from "../../../interfaces/Galaxy.port";
import { IMoon } from "../../../interfaces/Moon.port";
import { IPlanet } from "../../../interfaces/Planet.port";
import { IStar } from "../../../interfaces/Star.port";
import { ISystem } from "../../../interfaces/System.port";

type RepoFactories = {
  galaxy: (db: Queryable) => IGalaxy;
  system: (db: Queryable) => ISystem;
  star: (db: Queryable) => IStar;
  planet: (db: Queryable) => IPlanet;
  moon: (db: Queryable) => IMoon;
  asteroid: (db: Queryable) => IAsteroid;
};

export class DeleteGalaxy {
  constructor(
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly repoFactories: RepoFactories,
  ) {}

  async execute(id: Uuid): Promise<void> {
    const uow = await this.uowFactory.start();
    try {
      const galaxyRepo = this.repoFactories.galaxy(uow.db);
      const systemRepo = this.repoFactories.system(uow.db);
      const starRepo = this.repoFactories.star(uow.db);
      const planetRepo = this.repoFactories.planet(uow.db);
      const moonRepo = this.repoFactories.moon(uow.db);
      const asteroidRepo = this.repoFactories.asteroid(uow.db);

      const systemsResult = await systemRepo.findByGalaxy(id);

      for (const system of systemsResult.rows) {
        const [starsResult, planetsResult, asteroidsResult] = await Promise.all([
          starRepo.findBySystem(Uuid.create(system.id)),
          planetRepo.findBySystem(Uuid.create(system.id)),
          asteroidRepo.findBySystem(Uuid.create(system.id)),
        ]);

        for (const planet of planetsResult.rows) {
          const moonsResult = await moonRepo.findByPlanet(Uuid.create(planet.id));
          for (const moon of moonsResult.rows) {
            await moonRepo.delete(Uuid.create(moon.id));
          }
          await planetRepo.delete(Uuid.create(planet.id));
        }

        for (const asteroid of asteroidsResult.rows) {
          await asteroidRepo.delete(Uuid.create(asteroid.id));
        }

        for (const star of starsResult.rows) {
          await starRepo.delete(Uuid.create(star.id));
        }

        await systemRepo.delete(Uuid.create(system.id));
      }

      await galaxyRepo.delete(id);
      await uow.commit();
    } catch (error) {
      await uow.rollback();
      throw error;
    }
  }
}
