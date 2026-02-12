import { IUser } from "../../interfaces/User.port";
import { IHasher } from "../../interfaces/Hasher.port";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";
import { ISession } from "../../interfaces/Session.port";
import { ChangePasswordDTO } from "../../../presentation/security/ChangePassword.dto";
import { Uuid } from "../../../domain/aggregates/User";

export class ChangePassword {
  constructor(
    private readonly userRepo: IUser,
    private readonly hasher: IHasher,
    private readonly sessionRepo: ISession,
  ) {}

  async execute(dto: ChangePasswordDTO) {
    const user = await this.userRepo.findById(Uuid.create(dto.userId));

    if (!user) {
      throw SharedErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: dto.userId,
      });
    }

    const newHash = await this.hasher.hash(dto.newPassword);

    user.changePasswordHash(newHash);

    await this.userRepo.save(user);

    await this.sessionRepo.revokeAllForUser(dto.userId);

    return true;
  }
}
