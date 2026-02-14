import { Email } from "../../../domain/aggregates/User";
import { VerifyDTO } from "../../../presentation/security/Verify.dto";
import { ErrorFactory } from "../../../utils/errors/Error.map";
import { IHasher } from "../../interfaces/Hasher.port";
import { IUser } from "../../interfaces/User.port";

export class VerifyUser {
  constructor(
    private readonly userRepo: IUser,
    private readonly hasher: IHasher,
  ) {}

  async execute(dto: VerifyDTO) {
    const user = await this.userRepo.findByEmail(Email.create(dto.email));

    if (!user) {
      throw ErrorFactory.presentation("SHARED.NOT_FOUND", {
        email: dto.email,
      });
    }

    if (user.isVerified) {
      return true;
    }

    if (!user.verificationCode) {
      throw ErrorFactory.presentation("USERS.INVALID_VERIFICATION_CODE");
    }

    const isValidCode = await this.hasher.compare(dto.code, user.verificationCode);
    if (!isValidCode) {
      throw ErrorFactory.presentation("USERS.INVALID_VERIFICATION_CODE");
    }

    user.verifyEmail();

    await this.userRepo.save(user);

    return true;
  }
}
