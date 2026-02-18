import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeStarOrbitalDTO } from "../../../../presentation/security/stars/ChangeStarOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IStar } from "../../../interfaces/Star.port";

export class ChangeStarOrbital {
  constructor(private readonly starRepo: IStar) {}

  async execute(id: Uuid, dto: ChangeStarOrbitalDTO): Promise<void> {
    const star = await this.starRepo.findById(id);
    if (!star) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }

    star.changeOrbital(dto.orbital);
    await this.starRepo.save(star);
  }
}
