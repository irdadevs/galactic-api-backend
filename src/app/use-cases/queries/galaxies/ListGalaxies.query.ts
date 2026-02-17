import { Galaxy } from "../../../../domain/aggregates/Galaxy";
import { IGalaxy, ListGalaxyQuery } from "../../../interfaces/Galaxy.port";

export class ListGalaxies {
  constructor(private readonly galaxyRepo: IGalaxy) {}

  execute(
    query: ListGalaxyQuery,
  ): Promise<{ rows: Galaxy[]; total: number }> {
    return this.galaxyRepo.list(query);
  }
}
