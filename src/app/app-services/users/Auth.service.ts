export class AuthService {
  constructor(
    private readonly loginUser: LoginUser,
    private readonly signupUser: SignupUser,
    private readonly verifyUser: VerifyUser,
    private readonly changeEmailUser: ChangeEmail,
    private readonly changePasswordUser: ChangePassword,
    private readonly changeUsernameUser: ChangeUsername,
  ) {}

  login(dto: LoginDTO) {
    return this.loginUser.execute(dto);
  }

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
