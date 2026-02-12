export class AuthService {
  constructor(
    private readonly listUsers: LoginUser,
    private readonly signupUser: SignupUser,
    private readonly verifyUser: VerifyUser,
    private readonly changeEmailUser: ChangeEmail,
    private readonly changePasswordUser: ChangePassword,
    private readonly changeUsernameUser: ChangeUsername,
  ) {}

  list() {
    return this.listUsers.execute();
  }

  signup(dto: SignupDTO) {
    return this.signupUser.execute(dto);
  }

  verify(dto: VerifyDTO) {
    return this.verify.execute(dto);
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
