import { Email, Uuid } from "../../../../domain/aggregates/User";
import { ChangeEmailDTO } from "../../../../presentation/security/users/ChangeEmail.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IUser } from "../../../interfaces/User.port";
import { UserCacheService } from "../../../app-services/users/UserCache.service";

export class ChangeEmail {
  constructor(
    private readonly userRepo: IUser,
    private readonly userCache: UserCacheService,
  ) {}

  async execute(userId: Uuid, dto: ChangeEmailDTO) {
    const user = await this.userRepo.findById(userId);
    if (!user) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: userId,
      });
    }

    const existing = await this.userRepo.findByEmail(
      Email.create(dto.newEmail),
    );
    if (existing) {
      throw ErrorFactory.presentation("USERS.EMAIL_EXIST_CHANGE", {
        email: dto.newEmail,
      });
    }

    const previous = { email: user.email, username: user.username };
    user.changeEmail(dto.newEmail);

    await this.userRepo.save(user);
    await this.userCache.invalidateForMutation(user, previous);

    return true;
  }
}
