import { Email } from "../../../domain/aggregates/User";
import { VerifyDTO } from "../../../presentation/security/Verify.dto";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";
import { IUser } from "../../interfaces/User.port";

export class VerifyUser {
  constructor(private readonly userRepo: IUser) {}

  async execute(dto: VerifyDTO) {
    const user = await this.userRepo.findByEmail(Email.create(dto.email));

    if (!user) {
      throw SharedErrorFactory.presentation("SHARED.NOT_FOUND", {
        email: dto.email,
      });
    }

    user.verifyEmail();

    await this.userRepo.save(user);

    return true;
  }
}
