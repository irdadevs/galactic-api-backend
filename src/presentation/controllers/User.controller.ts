import { Response, Request } from "express";
import { AuthService } from "../../app/app-services/users/Auth.service";
import { LifecycleService } from "../../app/app-services/users/Lifecycle.service";
import { HealthQuery } from "../../app/use-cases/queries/Health.query";

export class UserController {
  constructor(
    private readonly healthCheck: HealthQuery,
    private readonly authService: AuthService,
    private readonly lifecycleService: LifecycleService,
  ) {}

  public health = async (_req: Request, res: Response) => {
    const result = await this.healthCheck.execute("auth");
    return res.json(result);
  };
  /*
  Follow this structure when implemented. Do not delete, just for remembering

  async signupUser(input: UserSignupDTO) {
    const userSignup = await this.authService.signup;
    return userSignup.execute(input);
  }
  */
}
