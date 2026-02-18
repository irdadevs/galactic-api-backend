import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeMoonOrbitalDTO } from "../../../../presentation/security/moons/ChangeMoonOrbital.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IMoon } from "../../../interfaces/Moon.port";

export class ChangeMoonOrbital {
  constructor(private readonly moonRepo: IMoon) {}

  async execute(id: Uuid, dto: ChangeMoonOrbitalDTO): Promise<void> {
    const moon = await this.moonRepo.findById(id);
    if (!moon) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }

    moon.changeOrbital(dto.orbital);
    await this.moonRepo.save(moon);
  }
}
