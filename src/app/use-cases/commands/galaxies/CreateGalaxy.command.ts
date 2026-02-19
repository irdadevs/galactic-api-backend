import { Galaxy, GalaxyName } from "../../../../domain/aggregates/Galaxy";
import { CreateGalaxyDTO } from "../../../../presentation/security/galaxies/CreateGalaxy.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { UnitOfWorkFactory } from "../../../../config/db/UnitOfWork";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { SystemCacheService } from "../../../app-services/systems/SystemCache.service";
import {
  GalaxyLifecycleService,
  ProceduralRepoFactories,
} from "../../../app-services/galaxies/GalaxyLifecycle.service";
import { TrackMetric } from "../metrics/TrackMetric.command";

export class CreateGalaxy {
  constructor(
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly repoFactories: ProceduralRepoFactories,
    private readonly lifecycle: GalaxyLifecycleService,
    private readonly galaxyCache: GalaxyCacheService,
    private readonly systemCache: SystemCacheService,
    private readonly metrics?: TrackMetric,
  ) {}

  async execute(dto: CreateGalaxyDTO & { ownerId: string }): Promise<Galaxy> {
    const startedAt = Date.now();
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

      const existingGalaxyName = await repos.galaxy.findByName(
        GalaxyName.create(dto.name),
      );

      if (existingGalaxyName) {
        throw ErrorFactory.presentation("GALAXY.NAME_ALREADY_EXIST", {
          name: dto.name,
        });
      }

      const galaxy = Galaxy.create({
        ownerId: dto.ownerId,
        name: dto.name,
        shape: dto.shape,
        systemCount: dto.systemCount,
      });
      const createdSystems = await this.lifecycle.createGalaxyTree(galaxy, repos);

      await uow.commit();
      await this.galaxyCache.setGalaxy(galaxy);
      await this.galaxyCache.invalidateList();
      for (const system of createdSystems) {
        await this.systemCache.setSystem(system);
      }
      await this.systemCache.invalidateListByGalaxy(galaxy.id);
      await this.metrics?.execute({
        metricName: "use_case.galaxy.create",
        metricType: "use_case",
        source: "CreateGalaxy",
        durationMs: Date.now() - startedAt,
        success: true,
        userId: dto.ownerId,
        context: { systemCount: dto.systemCount, galaxyId: galaxy.id },
      });
      return galaxy;
    } catch (error) {
      await uow.rollback();
      await this.metrics?.execute({
        metricName: "use_case.galaxy.create",
        metricType: "use_case",
        source: "CreateGalaxy",
        durationMs: Date.now() - startedAt,
        success: false,
        userId: dto.ownerId,
        context: { systemCount: dto.systemCount },
      });
      throw error;
    }
  }
}
