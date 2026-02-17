import { Galaxy, GalaxyName } from "../../../../domain/aggregates/Galaxy";
import { Uuid } from "../../../../domain/aggregates/User";
import { IGalaxy } from "../../../interfaces/Galaxy.port";

export class FindGalaxy {
  constructor(private readonly galaxyRepo: IGalaxy) {}

  byId(id: Uuid): Promise<Galaxy | null> {
    return this.galaxyRepo.findById(id);
  }

  byOwner(ownerId: Uuid): Promise<Galaxy | null> {
    return this.galaxyRepo.findByOwner(ownerId);
  }

  byName(name: GalaxyName): Promise<Galaxy | null> {
    return this.galaxyRepo.findByName(name);
  }
}
