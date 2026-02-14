import { Email } from "../../../domain/aggregates/User";
import { ResendVerificationDTO } from "../../../presentation/security/ResendVerification.dto";
import { IHasher } from "../../interfaces/Hasher.port";
import { IMailer } from "../../interfaces/Mailer.port";
import { IUser } from "../../interfaces/User.port";

export class ResendVerificationCode {
  constructor(
    private readonly userRepo: IUser,
    private readonly hasher: IHasher,
    private readonly mailer: IMailer,
  ) {}

  async execute(dto: ResendVerificationDTO): Promise<void> {
    const email = Email.create(dto.email);
    const user = await this.userRepo.findByEmail(email);

    // Prevent user enumeration.
    if (!user || user.isVerified) {
      return;
    }

    const code = this.mailer.genCode(8);
    const verificationCodeHash = await this.hasher.hash(code);
    user.setVerificationCode(verificationCodeHash);
    await this.userRepo.save(user);

    await this.mailer.send(
      email,
      "Galactic API - Verification code",
      `Your Galactic API verification code is: ${code}`,
    );
  }
}
