import { Username, Uuid } from "../../../domain/aggregates/User";
import { ChangeUsernameDTO } from "../../../presentation/security/ChangeUsername.dto";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";
import { IUser } from "../../interfaces/User.port";

export class ChangeUsername {
  constructor(private readonly userRepo: IUser) {}

  async execute(dto: ChangeUsernameDTO) {
    const user = await this.userRepo.findById(Uuid.create(dto.userId));

    if (!user) {
      throw SharedErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: dto.userId,
      });
    }

    const existing = await this.userRepo.findByUsername(
      Username.create(dto.newUsername),
    );

    if (existing) {
      throw SharedErrorFactory.presentation("SHARED.USERNAME_EXIST", {
        username: dto.newUsername,
      });
    }

    user.changeUsername(dto.newUsername);

    await this.userRepo.save(user);

    return true;
  }
}
