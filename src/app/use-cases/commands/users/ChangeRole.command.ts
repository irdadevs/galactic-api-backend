import { UserRole, Uuid } from "../../../../domain/aggregates/User";
import { ChangeRoleDTO } from "../../../../presentation/security/users/ChangeRole.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { UserCacheService } from "../../../app-services/users/UserCache.service";
import { ISession } from "../../../interfaces/Session.port";
import { IUser } from "../../../interfaces/User.port";

export class ChangeRole {
  constructor(
    private readonly userRepo: IUser,
    private readonly sessionRepo: ISession,
    private readonly userCache: UserCacheService,
  ) {}

  async execute(userId: Uuid, dto: ChangeRoleDTO) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: userId.toString(),
      });
    }

    const previous = { email: user.email, username: user.username };
    user.changeRole(dto.newRole as UserRole);

    await this.userRepo.save(user);
    await this.userCache.invalidateForMutation(user, previous);
    await this.sessionRepo.revokeAllForUser(user.id);

    return true;
  }
}
