import { Uuid } from "../../../../domain/aggregates/User";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IAsteroid } from "../../../interfaces/Asteroid.port";
import { IGalaxy } from "../../../interfaces/Galaxy.port";
import { IMoon } from "../../../interfaces/Moon.port";
import { IPlanet } from "../../../interfaces/Planet.port";
import { IStar } from "../../../interfaces/Star.port";
import { ISystem } from "../../../interfaces/System.port";

export type PopulatedGalaxy = {
  galaxy: Record<string, unknown>;
  systems: Array<{
    system: Record<string, unknown>;
    stars: Array<Record<string, unknown>>;
    planets: Array<{
      planet: Record<string, unknown>;
      moons: Array<Record<string, unknown>>;
    }>;
    asteroids: Array<Record<string, unknown>>;
  }>;
};

export class PopulateGalaxy {
  constructor(
    private readonly galaxyRepo: IGalaxy,
    private readonly systemRepo: ISystem,
    private readonly starRepo: IStar,
    private readonly planetRepo: IPlanet,
    private readonly moonRepo: IMoon,
    private readonly asteroidRepo: IAsteroid,
  ) {}

  async execute(galaxyId: Uuid): Promise<PopulatedGalaxy> {
    const galaxy = await this.galaxyRepo.findById(galaxyId);
    if (!galaxy) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "galaxy",
        id: galaxyId.toString(),
      });
    }

    const systemsResult = await this.systemRepo.findByGalaxy(galaxyId);

    const systems = await Promise.all(
      systemsResult.rows.map(async (system) => {
        const [starsResult, planetsResult, asteroidsResult] = await Promise.all([
          this.starRepo.findBySystem(Uuid.create(system.id)),
          this.planetRepo.findBySystem(Uuid.create(system.id)),
          this.asteroidRepo.findBySystem(Uuid.create(system.id)),
        ]);

        const planets = await Promise.all(
          planetsResult.rows.map(async (planet) => {
            const moonsResult = await this.moonRepo.findByPlanet(
              Uuid.create(planet.id),
            );

            return {
              planet: planet.toJSON(),
              moons: moonsResult.rows.map((moon) => moon.toJSON()),
            };
          }),
        );

        return {
          system: system.toJSON(),
          stars: starsResult.rows.map((star) => star.toJSON()),
          planets,
          asteroids: asteroidsResult.rows.map((asteroid) => asteroid.toJSON()),
        };
      }),
    );

    return {
      galaxy: galaxy.toJSON(),
      systems,
    };
  }
}
