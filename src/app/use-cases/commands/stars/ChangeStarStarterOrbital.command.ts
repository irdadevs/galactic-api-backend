import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeStarStarterOrbitalDTO } from "../../../../presentation/security/stars/ChangeStarStarterOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IStar } from "../../../interfaces/Star.port";

export class ChangeStarStarterOrbital {
  constructor(private readonly starRepo: IStar) {}

  async execute(id: Uuid, dto: ChangeStarStarterOrbitalDTO): Promise<void> {
    const star = await this.starRepo.findById(id);
    if (!star) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }

    star.changeOrbitalStarter(dto.orbitalStarter);
    await this.starRepo.save(star);
  }
}
