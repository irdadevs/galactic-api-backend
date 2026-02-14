import { Username, Uuid } from "../../../../domain/aggregates/User";
import { ChangeUsernameDTO } from "../../../../presentation/security/users/ChangeUsername.dto";
import { ErrorFactory } from "../../../../utils/errors/Error.map";
import { IUser } from "../../../interfaces/User.port";

export class ChangeUsername {
  constructor(private readonly userRepo: IUser) {}

  async execute(userId: Uuid, dto: ChangeUsernameDTO) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: userId,
      });
    }

    const existing = await this.userRepo.findByUsername(
      Username.create(dto.newUsername),
    );

    if (existing) {
      throw ErrorFactory.presentation("USERS.USERNAME_EXIST_CHANGE", {
        username: dto.newUsername,
      });
    }

    user.changeUsername(dto.newUsername);

    await this.userRepo.save(user);

    return true;
  }
}
