import { Star } from "../../../../domain/aggregates/Star";
import { Uuid } from "../../../../domain/aggregates/User";
import { IStar } from "../../../interfaces/Star.port";

export class ListStarsBySystem {
  constructor(private readonly starRepo: IStar) {}

  execute(systemId: Uuid): Promise<{ rows: Star[]; total: number }> {
    return this.starRepo.findBySystem(systemId);
  }
}
