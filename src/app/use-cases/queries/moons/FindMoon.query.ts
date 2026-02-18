import { Moon, MoonName } from "../../../../domain/aggregates/Moon";
import { Uuid } from "../../../../domain/aggregates/User";
import { IMoon } from "../../../interfaces/Moon.port";

export class FindMoon {
  constructor(private readonly moonRepo: IMoon) {}

  byId(id: Uuid): Promise<Moon | null> {
    return this.moonRepo.findById(id);
  }

  byName(name: MoonName): Promise<Moon | null> {
    return this.moonRepo.findByName(name);
  }
}
