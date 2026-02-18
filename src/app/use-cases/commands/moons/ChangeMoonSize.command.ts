import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeMoonSizeDTO } from "../../../../presentation/security/moons/ChangeMoonSize.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IMoon } from "../../../interfaces/Moon.port";

export class ChangeMoonSize {
  constructor(private readonly moonRepo: IMoon) {}

  async execute(id: Uuid, dto: ChangeMoonSizeDTO): Promise<void> {
    const moon = await this.moonRepo.findById(id);
    if (!moon) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }

    await this.moonRepo.changeSize(id, dto.size);
  }
}
