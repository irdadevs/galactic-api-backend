import {
  Galaxy,
  GalaxyName,
  GalaxyShape,
} from "../../domain/aggregates/Galaxy";
import { Uuid } from "../../domain/aggregates/User";

export type ListGalaxyQuery = {
  search?: string; // name/shape/owner contains
  limit?: number; // pagination
  offset?: number;
  orderBy?: "createdAt" | "name" | "shape" | "owner";
  orderDir?: "asc" | "desc";
};

export interface IGalaxy {
  create(galaxy: Galaxy): Promise<Galaxy>;
  findById(id: Uuid): Promise<Galaxy | null>;
  findByOwner(ownerId: Uuid): Promise<Galaxy | null>;
  findByName(name: GalaxyName): Promise<Galaxy | null>;
  findByShape(shape: GalaxyShape): Promise<Galaxy | null>;
  list(query: ListGalaxyQuery): Promise<{ rows: Galaxy[]; total: number }>;
  changeName(name: GalaxyName): Promise<Galaxy>;
  changeShape(shape: GalaxyShape): Promise<Galaxy>;
  delete(id: Uuid): Promise<void>;
}
