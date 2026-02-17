import {
  Planet,
  PlanetBiome,
  PlanetName,
} from "../../domain/aggregates/Planet";
import { Uuid } from "../../domain/aggregates/User";

export interface IPlanet {
  create(planet: Planet): Promise<Planet>;
  save(planet: Planet): Promise<Planet>;
  findById(id: Uuid): Promise<Planet | null>;
  findBySystem(systemId: Uuid): Promise<{ rows: Planet[]; total: number }>;
  findByName(name: PlanetName): Promise<Planet | null>;
  changeName(id: Uuid, name: PlanetName): Promise<Planet>;
  changeOrbital(id: Uuid, orbital: number): Promise<Planet>;
  changeBiome(id: Uuid, biome: PlanetBiome): Promise<Planet>;
  delete(id: Uuid): Promise<void>;
}
