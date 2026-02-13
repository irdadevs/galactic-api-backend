import { Email, Uuid } from "../../../domain/aggregates/User";
import { ChangeEmailDTO } from "../../../presentation/security/ChangeEmail.dto";
import { ErrorFactory } from "../../../utils/errors/Error.map";
import { IUser } from "../../interfaces/User.port";

export class ChangeEmail {
  constructor(private readonly userRepo: IUser) {}

  async execute(dto: ChangeEmailDTO) {
    const user = await this.userRepo.findById(Uuid.create(dto.userId));
    if (!user) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: dto.userId,
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

    user.changeEmail(dto.newEmail);

    await this.userRepo.save(user);

    return true;
  }
}
