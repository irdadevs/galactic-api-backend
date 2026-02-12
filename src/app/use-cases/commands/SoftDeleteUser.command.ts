import { IUser } from "../../interfaces/User.port";
import { Uuid } from "../../../domain/aggregates/User";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";

export class SoftDeleteUser {
  constructor(private readonly userRepo: IUser) {}

  async execute(id: Uuid): Promise<void> {
    try {
      await this.userRepo.softDelete(id);
    } catch (e) {
      throw SharedErrorFactory.presentation("AUTH.SOFT_DELETE_FAILED", {
        userId: id.toString(),
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
