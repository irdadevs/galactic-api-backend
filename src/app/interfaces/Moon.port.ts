import { Moon, MoonName, MoonSize } from "../../domain/aggregates/Moon";
import { Uuid } from "../../domain/aggregates/User";

export interface IMoon {
  create(moon: Moon): Promise<Moon>;
  save(moon: Moon): Promise<Moon>;
  findById(id: Uuid): Promise<Moon | null>;
  findByPlanet(planetId: Uuid): Promise<{ rows: Moon[]; total: number }>;
  findByName(name: MoonName): Promise<Moon | null>;
  changeName(id: Uuid, name: MoonName): Promise<Moon>;
  changeSize(id: Uuid, size: MoonSize): Promise<Moon>;
  changeOrbital(id: Uuid, orbital: number): Promise<Moon>;
  delete(id: Uuid): Promise<void>;
}
