import { ChangeEmailDTO } from "../../../presentation/security/ChangeEmail.dto";
import { ChangePasswordDTO } from "../../../presentation/security/ChangePassword.dto";
import { ChangeUsernameDTO } from "../../../presentation/security/ChangeUsername.dto";
import { SignupDTO } from "../../../presentation/security/Signup.dto";
import { VerifyDTO } from "../../../presentation/security/Verify.dto";
import { ChangeEmail } from "../../use-cases/commands/ChangeEmail.command";
import { ChangePassword } from "../../use-cases/commands/ChangePassword.command";
import { ChangeUsername } from "../../use-cases/commands/ChangeUsername.command";
import { SignupUser } from "../../use-cases/commands/SignupUser.command";
import { VerifyUser } from "../../use-cases/commands/VerifyUser.command";

export class PlatformService {
  constructor(
    private readonly signupUser: SignupUser,
    private readonly verifyUser: VerifyUser,
    private readonly changeEmailUser: ChangeEmail,
    private readonly changePasswordUser: ChangePassword,
    private readonly changeUsernameUser: ChangeUsername,
  ) {}

  signup(dto: SignupDTO) {
    return this.signupUser.execute(dto);
  }

  verify(dto: VerifyDTO) {
    return this.verifyUser.execute(dto);
  }

  changeEmail(dto: ChangeEmailDTO) {
    return this.changeEmailUser.execute(dto);
  }

  changePassword(dto: ChangePasswordDTO) {
    return this.changePasswordUser.execute(dto);
  }

  changeUsername(dto: ChangeUsernameDTO) {
    return this.changeUsernameUser.execute(dto);
  }
}
