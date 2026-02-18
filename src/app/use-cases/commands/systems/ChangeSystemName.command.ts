import { SystemName } from "../../../../domain/aggregates/System";
import { Uuid } from "../../../../domain/aggregates/User";
import { ChangeSystemNameDTO } from "../../../../presentation/security/systems/ChangeSystemName.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { ISystem } from "../../../interfaces/System.port";

export class ChangeSystemName {
  constructor(private readonly systemRepo: ISystem) {}

  async execute(id: Uuid, dto: ChangeSystemNameDTO): Promise<void> {
    const system = await this.systemRepo.findById(id);
    if (!system) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        sourceType: "system",
        id: id.toString(),
      });
    }

    const existing = await this.systemRepo.findByName(SystemName.create(dto.name));
    if (existing && existing.id !== system.id) {
      throw ErrorFactory.presentation("PRESENTATION.INVALID_FIELD", {
        field: "name",
      });
    }

    system.rename(dto.name);
    await this.systemRepo.save(system);
  }
}
