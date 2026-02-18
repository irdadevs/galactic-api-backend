import { Star, StarName } from "../../../../domain/aggregates/Star";
import { Uuid } from "../../../../domain/aggregates/User";
import { IStar } from "../../../interfaces/Star.port";

export class FindStar {
  constructor(private readonly starRepo: IStar) {}

  byId(id: Uuid): Promise<Star | null> {
    return this.starRepo.findById(id);
  }

  byName(name: StarName): Promise<Star | null> {
    return this.starRepo.findByName(name);
  }
}
