import { IUser } from "../../../interfaces/User.port";
import { Uuid } from "../../../../domain/aggregates/User";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { UserCacheService } from "../../../app-services/users/UserCache.service";

export class RestoreUser {
  constructor(
    private readonly userRepo: IUser,
    private readonly userCache: UserCacheService,
  ) {}

  async execute(id: Uuid): Promise<void> {
    try {
      const before = await this.userRepo.findById(id);
      await this.userRepo.restore(id);
      const after = await this.userRepo.findById(id);
      if (after) {
        await this.userCache.invalidateForMutation(after, {
          email: before?.email ?? after.email,
          username: before?.username ?? after.username,
        });
      }
    } catch (e) {
      throw ErrorFactory.presentation("USERS.RESTORE_FAILED", {
        userId: id.toString(),
        cause: e instanceof Error ? e.message : String(e),
      });
    }
  }
}
