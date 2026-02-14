import { IUser } from "../../interfaces/User.port";
import { IHasher } from "../../interfaces/Hasher.port";
import { SignupDTO } from "../../../presentation/security/Signup.dto";
import { Email, User, Username } from "../../../domain/aggregates/User";
import { ErrorFactory } from "../../../utils/errors/Error.map";
import { IMailer } from "../../interfaces/Mailer.port";

export class SignupUser {
  constructor(
    private readonly userRepo: IUser,
    private readonly hasher: IHasher,
    private readonly mailer: IMailer,
  ) {}

  async execute(dto: SignupDTO) {
    const existingByEmail = await this.userRepo.findByEmail(
      Email.create(dto.email),
    );
    if (existingByEmail) {
      throw ErrorFactory.presentation("USERS.EMAIL_EXIST_SIGNUP", {
        email: dto.email,
      });
    }

    const existingByUsername = await this.userRepo.findByUsername(
      Username.create(dto.username),
    );
    if (existingByUsername) {
      throw ErrorFactory.presentation("USERS.USERNAME_EXIST_SIGNUP", {
        username: dto.username,
      });
    }

    const passwordHash = await this.hasher.hash(dto.rawPassword);

    const user = User.create({
      email: dto.email,
      username: dto.username,
      passwordHash,
      role: "User",
      isVerified: false,
    });
    const code = this.mailer.genCode(8);
    const verificationCodeHash = await this.hasher.hash(code);
    user.setVerificationCode(verificationCodeHash);

    await this.userRepo.save(user);

    await this.mailer.send(
      Email.create(dto.email),
      "Galactic API - Verification code",
      `Your Galactic API verification code is: ${code}`,
    );

    return user;
  }
}
