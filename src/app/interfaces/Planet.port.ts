import {
  Planet,
  PlanetBiome,
  PlanetName,
  PlanetSize,
  PlanetType,
} from "../../domain/aggregates/Planet";
import { Uuid } from "../../domain/aggregates/User";

export interface IPlanet {
  create(planet: Planet): Promise<Planet>;
  findById(id: Uuid): Promise<Planet>;
  findBySystem(systemId: Uuid): Promise<{ rows: Planet[]; total: number }>;
  findByName(name: PlanetName): Promise<Planet | null>;
  changeName(name: PlanetName): Promise<Planet>;
  changeType(type: PlanetType): Promise<Planet>;
  changeSize(size: PlanetSize): Promise<Planet>;
  changeOrbital(orbital: number): Promise<Planet>;
  changeBiome(biome: PlanetBiome): Promise<Planet>;
  changeMass(relative: number): Promise<Planet>;
  changeRadius(relative: number): Promise<Planet>;
  changeAbsolutes(
    relativeMass: number,
    relativeRadius: number,
  ): Promise<Planet>;
  changeGravity(gravity: number): Promise<Planet>;
  changeTemperature(temperature: number): Promise<Planet>;
  delete(id: Uuid): Promise<void>;
}
