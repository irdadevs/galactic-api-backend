import { IUser } from "../../../interfaces/User.port";
import { IHasher } from "../../../interfaces/Hasher.port";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { ISession } from "../../../interfaces/Session.port";
import { ChangePasswordDTO } from "../../../../presentation/security/users/ChangePassword.dto";
import { Uuid } from "../../../../domain/aggregates/User";

export class ChangePassword {
  constructor(
    private readonly userRepo: IUser,
    private readonly hasher: IHasher,
    private readonly sessionRepo: ISession,
  ) {}

  async execute(userId: Uuid, dto: ChangePasswordDTO) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: userId,
      });
    }

    const newHash = await this.hasher.hash(dto.newPassword);

    user.changePasswordHash(newHash);

    await this.userRepo.save(user);

    await this.sessionRepo.revokeAllForUser(userId.toString());

    return true;
  }
}
