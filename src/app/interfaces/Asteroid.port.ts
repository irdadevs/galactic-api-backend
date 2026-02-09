import {
  Asteroid,
  AsteroidName,
  AsteroidSize,
  AsteroidType,
} from "../../domain/aggregates/Asteroid";
import { Uuid } from "../../domain/aggregates/User";

export interface IAsteroid {
  create(asteroid: Asteroid): Promise<Asteroid>;
  findById(id: Uuid): Promise<Asteroid | null>;
  findBySystem(systemId: Uuid): Promise<{ rows: Asteroid[]; total: number }>;
  findByName(name: AsteroidName): Promise<Asteroid | null>;
  changeName(name: AsteroidName): Promise<Asteroid>;
  changeType(type: AsteroidType): Promise<Asteroid>;
  changeSize(size: AsteroidSize): Promise<Asteroid>;
  changeOrbital(orbital: number): Promise<Asteroid>;
  delete(id: Uuid): Promise<void>;
}
