import { Email, Uuid } from "../../../domain/aggregates/User";
import { ChangeEmailDTO } from "../../../presentation/security/ChangeEmail.dto";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";
import { IUser } from "../../interfaces/User.port";

export class ChangeEmail {
  constructor(private readonly userRepo: IUser) {}

  async execute(dto: ChangeEmailDTO) {
    const user = await this.userRepo.findById(Uuid.create(dto.userId));
    if (!user) {
      throw SharedErrorFactory.presentation("SHARED.NOT_FOUND", {
        id: dto.userId,
      });
    }

    const existing = await this.userRepo.findByEmail(
      Email.create(dto.newEmail),
    );
    if (existing) {
      throw SharedErrorFactory.presentation("SHARED.EMAIL_EXIST", {
        email: dto.newEmail,
      });
    }

    user.changeEmail(dto.newEmail);

    await this.userRepo.save(user);

    return true;
  }
}
