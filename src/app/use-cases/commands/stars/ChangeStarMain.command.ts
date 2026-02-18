import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeStarMainDTO } from "../../../../presentation/security/stars/ChangeStarMain.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IStar } from "../../../interfaces/Star.port";

export class ChangeStarMain {
  constructor(private readonly starRepo: IStar) {}

  async execute(id: Uuid, dto: ChangeStarMainDTO): Promise<void> {
    const star = await this.starRepo.findById(id);
    if (!star) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }

    star.changeMainStatus(dto.isMain);
    await this.starRepo.save(star);
  }
}
