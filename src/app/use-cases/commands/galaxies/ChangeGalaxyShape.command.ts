import { Uuid } from "../../../../domain/aggregates/User";
import { UnitOfWorkFactory } from "../../../../config/db/UnitOfWork";
import { ChangeGalaxyShapeDTO } from "../../../../presentation/security/galaxies/ChangeGalaxyShape.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { GalaxyCacheService } from "../../../app-services/galaxies/GalaxyCache.service";
import { SystemCacheService } from "../../../app-services/systems/SystemCache.service";
import {
  GalaxyLifecycleService,
  ProceduralRepoFactories,
} from "../../../app-services/galaxies/GalaxyLifecycle.service";
import { TrackMetric } from "../metrics/TrackMetric.command";

export class ChangeGalaxyShape {
  constructor(
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly repoFactories: ProceduralRepoFactories,
    private readonly lifecycle: GalaxyLifecycleService,
    private readonly galaxyCache: GalaxyCacheService,
    private readonly systemCache: SystemCacheService,
    private readonly metrics?: TrackMetric,
  ) {}

  async execute(id: Uuid, dto: ChangeGalaxyShapeDTO): Promise<void> {
    const startedAt = Date.now();
    const uow = await this.uowFactory.start();
    try {
      const galaxyRepo = this.repoFactories.galaxy(uow.db);
      const systemRepo = this.repoFactories.system(uow.db);

      const galaxy = await galaxyRepo.findById(id);
      if (!galaxy) {
        throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
          sourceType: "galaxy",
          id: id.toString(),
        });
      }

      const systemsBefore = await systemRepo.findByGalaxy(id);
      const previousById = new Map(
        systemsBefore.rows.map((system) => [
          system.id,
          {
            name: system.name,
            position: system.position,
            galaxyId: system.galaxyId,
          },
        ]),
      );

      galaxy.changeShape(dto.shape);
      await galaxyRepo.save(galaxy);
      const updatedSystems = await this.lifecycle.recalculateSystemPositionsForShape(
        galaxy,
        systemRepo,
      );
      await uow.commit();

      await this.galaxyCache.invalidateForMutation(galaxy);
      for (const system of updatedSystems) {
        const previous = previousById.get(system.id);
        await this.systemCache.invalidateForMutation(system, previous);
      }
      await this.metrics?.execute({
        metricName: "use_case.galaxy.change_shape",
        metricType: "use_case",
        source: "ChangeGalaxyShape",
        durationMs: Date.now() - startedAt,
        success: true,
        context: { galaxyId: id.toString(), shape: dto.shape },
      });
    } catch (error) {
      await uow.rollback();
      await this.metrics?.execute({
        metricName: "use_case.galaxy.change_shape",
        metricType: "use_case",
        source: "ChangeGalaxyShape",
        durationMs: Date.now() - startedAt,
        success: false,
        context: { galaxyId: id.toString(), shape: dto.shape },
      });
      throw error;
    }
  }
}
