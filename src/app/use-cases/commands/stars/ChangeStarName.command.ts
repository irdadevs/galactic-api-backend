import { StarName } from "../../../../domain/aggregates/Star";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeStarNameDTO } from "../../../../presentation/security/stars/ChangeStarName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IStar } from "../../../interfaces/Star.port";

export class ChangeStarName {
  constructor(private readonly starRepo: IStar) {}

  async execute(id: Uuid, dto: ChangeStarNameDTO): Promise<void> {
    const star = await this.starRepo.findById(id);
    if (!star) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }

    const existing = await this.starRepo.findByName(StarName.create(dto.name));
    if (existing && existing.id !== star.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "name",
      });
    }

    star.rename(dto.name);
    await this.starRepo.save(star);
  }
}
