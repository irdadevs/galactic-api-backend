import { Moon, MoonName, MoonSize } from "../../domain/aggregates/Moon";
import { Uuid } from "../../domain/aggregates/User";

export interface IMoon {
  create(moon: Moon): Promise<Moon>;
  findById(id: Uuid): Promise<Moon | null>;
  findByPlanet(planetId: Uuid): Promise<{ rows: Moon[]; total: number }>;
  findByName(name: MoonName): Promise<Moon | null>;
  changeName(name: MoonName): Promise<Moon>;
  changeSize(size: MoonSize): Promise<Moon>;
  changeOrbital(orbital: number): Promise<Moon>;
  changeMass(relative: number): Promise<Moon>;
  changeRadius(relative: number): Promise<Moon>;
  changeAbsolutes(relativeMass: number, relativeRadius: number): Promise<Moon>;
  changeGravity(gravity: number): Promise<Moon>;
  changeTemperature(temperature: number): Promise<Moon>;
  delete(id: Uuid): Promise<void>;
}
