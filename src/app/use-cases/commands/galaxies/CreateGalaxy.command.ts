import { Galaxy, GalaxyName } from "../../../../domain/aggregates/Galaxy";
import { System } from "../../../../domain/aggregates/System";
import { Star, StarType } from "../../../../domain/aggregates/Star";
import { Planet, PlanetSize, PlanetType } from "../../../../domain/aggregates/Planet";
import { Moon } from "../../../../domain/aggregates/Moon";
import { Asteroid } from "../../../../domain/aggregates/Asteroid";
import { CreateGalaxyDTO } from "../../../../presentation/security/galaxies/CreateGalaxy.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { Queryable } from "../../../../config/db/Queryable";
import { UnitOfWorkFactory } from "../../../../config/db/UnitOfWork";
import { Dice } from "../../../../utils/Dice.class";
import { generateCelestialName } from "../../../../utils/nameGenerator";
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

const PLANET_MAX_BY_STAR_TYPE: Record<StarType, number> = {
  "Blue supergiant": 6,
  "Blue giant": 8,
  "White dwarf": 5,
  "Brown dwarf": 4,
  "Yellow dwarf": 10,
  Subdwarf: 7,
  "Red dwarf": 7,
  "Black hole": 2,
  "Neutron star": 3,
};

const ASTEROID_MAX_BY_STAR_TYPE: Record<StarType, number> = {
  "Blue supergiant": 2,
  "Blue giant": 3,
  "White dwarf": 4,
  "Brown dwarf": 5,
  "Yellow dwarf": 6,
  Subdwarf: 5,
  "Red dwarf": 4,
  "Black hole": 2,
  "Neutron star": 3,
};

const MOON_MAX_BY_PLANET_SIZE: Record<PlanetSize, number> = {
  proto: 0,
  dwarf: 2,
  medium: 4,
  giant: 8,
  supergiant: 12,
};

const SOLID_PLANET_SIZES: PlanetSize[] = ["proto", "dwarf", "medium"];
const GAS_PLANET_SIZES: PlanetSize[] = ["giant", "supergiant"];

export class CreateGalaxy {
  constructor(
    private readonly uowFactory: UnitOfWorkFactory,
    private readonly repoFactories: RepoFactories,
  ) {}

  private randomInt(min: number, max: number): number {
    if (max <= min) return min;
    return min + Dice.roll(max - min + 1, true);
  }

  private pickOne<T>(values: T[]): T {
    return values[Dice.roll(values.length, true)];
  }

  private randomSystemPosition(systemIdx: number, totalSystems: number) {
    const radius = 5000 + systemIdx * 10;
    const angle = (2 * Math.PI * systemIdx) / Math.max(1, totalSystems);
    const jitter = () => Dice.roll(200) - 100;

    return {
      x: Math.cos(angle) * radius + jitter(),
      y: Math.sin(angle) * radius + jitter(),
      z: Dice.roll(2000) - 1000,
    };
  }

  private companionStarCount(mainStarType: StarType): number {
    if (mainStarType === "Black hole" || mainStarType === "Neutron star") {
      return this.randomInt(0, 1);
    }
    return this.randomInt(0, 2);
  }

  private choosePlanetType(mainStarType: StarType, orbital: number): PlanetType {
    if (mainStarType === "Black hole" || mainStarType === "Neutron star") {
      return orbital <= 1 ? "solid" : this.pickOne<PlanetType>(["solid", "gas"]);
    }
    return this.pickOne<PlanetType>(["solid", "solid", "gas"]);
  }

  private choosePlanetSize(type: PlanetType): PlanetSize {
    return type === "solid"
      ? this.pickOne(SOLID_PLANET_SIZES)
      : this.pickOne(GAS_PLANET_SIZES);
  }

  private async createSystemTree(
    systemRepo: ISystem,
    starRepo: IStar,
    planetRepo: IPlanet,
    moonRepo: IMoon,
    asteroidRepo: IAsteroid,
    galaxyId: string,
    systemIdx: number,
    totalSystems: number,
  ): Promise<void> {
    const system = System.create({
      galaxyId,
      name: generateCelestialName(),
      position: this.randomSystemPosition(systemIdx, totalSystems),
    });
    await systemRepo.save(system);

    const mainStar = Star.create({
      systemId: system.id,
      isMain: true,
      orbital: 0,
      orbitalStarter: 0,
    });
    await starRepo.save(mainStar);

    const companionCount = this.companionStarCount(mainStar.starType);
    for (let i = 1; i <= companionCount; i += 1) {
      const companion = Star.create({
        systemId: system.id,
        isMain: false,
        orbital: i,
        orbitalStarter: i,
      });
      await starRepo.save(companion);
    }

    const maxPlanets = PLANET_MAX_BY_STAR_TYPE[mainStar.starType];
    const planetCount = this.randomInt(1, maxPlanets);

    for (let orbital = 1; orbital <= planetCount; orbital += 1) {
      const planetType = this.choosePlanetType(mainStar.starType, orbital);
      const planet = Planet.create({
        systemId: system.id,
        orbital,
        type: planetType,
        size: this.choosePlanetSize(planetType),
      });
      await planetRepo.save(planet);

      const maxMoons = MOON_MAX_BY_PLANET_SIZE[planet.size];
      const moonCount = this.randomInt(0, maxMoons);

      for (let moonOrbital = 1; moonOrbital <= moonCount; moonOrbital += 1) {
        const moon = Moon.create({
          planetId: planet.id,
          orbital: moonOrbital,
        });
        await moonRepo.save(moon);
      }
    }

    const asteroidCount = this.randomInt(0, ASTEROID_MAX_BY_STAR_TYPE[mainStar.starType]);
    for (let i = 0; i < asteroidCount; i += 1) {
      const asteroid = Asteroid.create({
        systemId: system.id,
        orbital: planetCount + (i + 1) + 0.5,
      });
      await asteroidRepo.save(asteroid);
    }
  }

  async execute(dto: CreateGalaxyDTO & { ownerId: string }): Promise<Galaxy> {
    const uow = await this.uowFactory.start();
    try {
      const galaxyRepo = this.repoFactories.galaxy(uow.db);
      const systemRepo = this.repoFactories.system(uow.db);
      const starRepo = this.repoFactories.star(uow.db);
      const planetRepo = this.repoFactories.planet(uow.db);
      const moonRepo = this.repoFactories.moon(uow.db);
      const asteroidRepo = this.repoFactories.asteroid(uow.db);
      const existingGalaxyName = await galaxyRepo.findByName(
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

      const saved = await galaxyRepo.save(galaxy);

      for (let i = 0; i < saved.systemCount; i += 1) {
        await this.createSystemTree(
          systemRepo,
          starRepo,
          planetRepo,
          moonRepo,
          asteroidRepo,
          saved.id,
          i,
          saved.systemCount,
        );
      }

      await uow.commit();
      return saved;
    } catch (error) {
      await uow.rollback();
      throw error;
    }

  }
}
