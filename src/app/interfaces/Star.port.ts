import {
  Star,
  StarClass,
  StarColor,
  StarName,
  StarType,
} from "../../domain/aggregates/Star";
import { Uuid } from "../../domain/aggregates/User";

export interface IStar {
  create(star: Star): Promise<Star>;
  findById(id: Uuid): Promise<Star | null>;
  findBySystem(systemId: Uuid): Promise<{ rows: Star[]; total: number }>;
  findByName(name: StarName): Promise<Star | null>;
  changeName(name: StarName): Promise<Star>;
  changeType(type: StarType): Promise<Star>;
  changeClass(starClass: StarClass): Promise<Star>;
  changeTemperature(temperature: number): Promise<Star>;
  changeColor(color: StarColor): Promise<Star>;
  changeMass(relative: number): Promise<Star>;
  changeRadius(relative: number): Promise<Star>;
  changeAbsolutes(relativeMass: number, relativeRadius: number): Promise<Star>;
  changeGravity(gravity: number): Promise<Star>;
  changeIsMain(isMain: boolean): Promise<Star>;
  changeOrbital(orbital: number): Promise<Star>;
  changeStarterOrbital(starterOrbital: number): Promise<Star>;
  delete(id: Uuid): Promise<void>;
}
