import { Star, StarName } from "../../domain/aggregates/Star";
import { Uuid } from "../../domain/aggregates/User";

export interface IStar {
  create(star: Star): Promise<Star>;
  save(star: Star): Promise<Star>;
  findById(id: Uuid): Promise<Star | null>;
  findBySystem(systemId: Uuid): Promise<{ rows: Star[]; total: number }>;
  findByName(name: StarName): Promise<Star | null>;
  changeName(id: Uuid, name: StarName): Promise<Star>;
  changeIsMain(id: Uuid, isMain: boolean): Promise<Star>;
  changeOrbital(id: Uuid, orbital: number): Promise<Star>;
  changeStarterOrbital(id: Uuid, starterOrbital: number): Promise<Star>;
  delete(id: Uuid): Promise<void>;
}
