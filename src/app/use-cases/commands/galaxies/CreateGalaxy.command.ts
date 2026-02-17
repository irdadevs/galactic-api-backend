import { GalaxyName } from "../../../../domain/aggregates/Galaxy";
import { CreateGalaxyDTO } from "../../../../presentation/security/galaxies/CreateGalaxy.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IGalaxy } from "../../../interfaces/Galaxy.port";

export class CreateGalaxy {
  constructor(private readonly galaxyRepo: IGalaxy) {}

  async execute(dto: CreateGalaxyDTO) {
    const existingGalaxyName = await this.galaxyRepo.findByName(
      GalaxyName.create(dto.name),
    );

    if (existingGalaxyName) {
      throw ErrorFactory.presentation("GALAXY.NAME_ALREADY_EXIST", {
        name: dto.name,
      });
    }
  }
}
