import { IUser } from "../../../interfaces/User.port";
import { Uuid } from "../../../../domain/aggregates/User";
import { ErrorFactory } from "../../../../utils/errors/Error.map";

export class SoftDeleteUser {
  constructor(private readonly userRepo: IUser) {}

  async execute(id: Uuid): Promise<void> {
    try {
      await this.userRepo.softDelete(id);
    } catch (e) {
      throw ErrorFactory.presentation("USERS.SOFT_DELETE_FAILED", {
        userId: id.toString(),
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
