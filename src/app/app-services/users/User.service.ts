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
    return this.signup.execute(dto);
  }

  verify(dto: VerifyDTO) {
    return this.verify.execute(dto);
  }

  changeEmail(dto: ChangeEmailDTO) {
    return this.changeEmail.execute(dto);
  }

  changePassword(dto: ChangePasswordDTO) {
    return this.changePassword.execute(dto);
  }

  changeUsername(dto: ChangeUsernameDTO) {
    return this.changeUsername.execute(dto);
  }
}
