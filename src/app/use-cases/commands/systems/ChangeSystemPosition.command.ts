import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeSystemPositionDTO } from "../../../../presentation/security/systems/ChangeSystemPosition.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { ISystem } from "../../../interfaces/System.port";

export class ChangeSystemPosition {
  constructor(private readonly systemRepo: ISystem) {}

  async execute(id: Uuid, dto: ChangeSystemPositionDTO): Promise<void> {
    const system = await this.systemRepo.findById(id);
    if (!system) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "system",
        id: id.toString(),
      });
    }

    const existing = await this.systemRepo.findByPosition({
      x: dto.x,
      y: dto.y,
      z: dto.z,
    });
    if (existing && existing.id !== system.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "position",
      });
    }

    system.move({
      x: dto.x,
      y: dto.y,
      z: dto.z,
    });
    await this.systemRepo.save(system);
  }
}
