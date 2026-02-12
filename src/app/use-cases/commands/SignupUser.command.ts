import { IUser } from "../../interfaces/User.port";
import { IHasher } from "../../interfaces/Hasher.port";
import { SignupDTO } from "../../../presentation/security/Signup.dto";
import { Email, User, Username } from "../../../domain/aggregates/User";
import { SharedErrorFactory } from "../../../utils/errors/Error.map";

export class SignupUser {
  constructor(
    private readonly userRepo: IUser,
    private readonly hasher: IHasher,
  ) {}

  async execute(dto: SignupDTO) {
    const existingByEmail = await this.userRepo.findByEmail(
      Email.create(dto.email),
    );
    if (existingByEmail) {
      throw SharedErrorFactory.presentation("SHARED.EMAIL_EXIST", {
        email: dto.email,
      });
    }

    const existingByUsername = await this.userRepo.findByUsername(
      Username.create(dto.username),
    );
    if (existingByUsername) {
      throw SharedErrorFactory.presentation("SHARED.USERNAME_EXIST", {
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

    await this.userRepo.save(user);

    return user;
  }
}
