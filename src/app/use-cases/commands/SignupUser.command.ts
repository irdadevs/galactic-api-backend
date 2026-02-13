import { IUser } from "../../interfaces/User.port";
import { IHasher } from "../../interfaces/Hasher.port";
import { SignupDTO } from "../../../presentation/security/Signup.dto";
import { Email, User, Username } from "../../../domain/aggregates/User";
import { ErrorFactory } from "../../../utils/errors/Error.map";

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

    await this.userRepo.save(user);

    return user;
  }
}
