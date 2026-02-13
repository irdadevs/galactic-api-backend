import { IUser } from "../../interfaces/User.port";
import { Uuid } from "../../../domain/aggregates/User";
import { ErrorFactory } from "../../../utils/errors/Error.map";

export class RestoreUser {
  constructor(private readonly userRepo: IUser) {}

  async execute(id: Uuid): Promise<void> {
    try {
      await this.userRepo.restore(id);
    } catch (e) {
      throw ErrorFactory.presentation("USERS.RESTORE_FAILED", {
        userId: id.toString(),
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
