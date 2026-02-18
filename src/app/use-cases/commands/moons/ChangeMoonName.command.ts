import { MoonName } from "../../../../domain/aggregates/Moon";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeMoonNameDTO } from "../../../../presentation/security/moons/ChangeMoonName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IMoon } from "../../../interfaces/Moon.port";

export class ChangeMoonName {
  constructor(private readonly moonRepo: IMoon) {}

  async execute(id: Uuid, dto: ChangeMoonNameDTO): Promise<void> {
    const moon = await this.moonRepo.findById(id);
    if (!moon) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }

    const existing = await this.moonRepo.findByName(MoonName.create(dto.name));
    if (existing && existing.id !== moon.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "name",
      });
    }

    moon.rename(dto.name);
    await this.moonRepo.save(moon);
  }
}
