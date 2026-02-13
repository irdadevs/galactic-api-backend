import { Response, Request } from "express";
import { PlatformService } from "../../app/app-services/users/Platform.service";
import { LifecycleService } from "../../app/app-services/users/Lifecycle.service";
import { HealthQuery } from "../../app/use-cases/queries/Health.query";
import { AuthService } from "../../app/app-services/users/Auth.service";
import { ChangeEmailDTO } from "../security/ChangeEmail.dto";
import { ChangePasswordDTO } from "../security/ChangePassword.dto";
import { ChangeUsernameDTO } from "../security/ChangeUsername.dto";
import { LoginDTO } from "../security/Login.dto";
import { SignupDTO } from "../security/Signup.dto";
import { VerifyDTO } from "../security/Verify.dto";
import FindUser from "../../app/use-cases/queries/users/FindUser.query";
import { ListUsers } from "../../app/use-cases/queries/users/ListUsers.query";
import errorHandler from "../../utils/errors/Errors.handler";

function invalidBody(res: Response, details: unknown) {
  return res.status(400).json({
    ok: false,
    error: "INVALID_BODY",
    details,
  });
}

export class UserController {
  constructor(
    private readonly healthCheck: HealthQuery,
    private readonly findUser: FindUser,
    private readonly listUsers: ListUsers,
    private readonly authService: AuthService,
    private readonly platformService: PlatformService,
    private readonly lifecycleService: LifecycleService,
  ) {}

  public health = async (_req: Request, res: Response) => {
    try {
      const result = await this.healthCheck.execute("auth");
      return res.json(result);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public login = async (req: Request, res: Response) => {
    try {
      const parsed = LoginDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const result = await this.authService.login(parsed.data, {
        userAgent: req.headers["user-agent"],
        ip: req.ip,
      });

      return res.status(200).json({
        user: {
          id: result.user.id,
          email: result.user.email,
          role: result.user.role,
        },
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public refresh = async (req: Request, res: Response) => {
    try {
      const { refreshToken } = req.body;
      const tokens = await this.authService.refresh(refreshToken);

      return res.status(200).json(tokens);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public logout = async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.body;
      await this.authService.logout(sessionId);

      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public logoutAll = async (req: Request, res: Response) => {
    try {
      await this.authService.logoutAll(req.auth.userId);

      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public signup = async (req: Request, res: Response) => {
    try {
      const parsed = SignupDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const user = await this.platformService.signup(parsed.data);

      return res.status(201).json(user);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public changeEmail = async (req: Request, res: Response) => {
    try {
      const parsed = ChangeEmailDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.platformService.changeEmail(parsed.data);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public changePassword = async (req: Request, res: Response) => {
    try {
      const parsed = ChangePasswordDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.platformService.changePassword(parsed.data);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public changeUsername = async (req: Request, res: Response) => {
    try {
      const parsed = ChangeUsernameDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.platformService.changeUsername(parsed.data);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public list = async (req: Request, res: Response) => {
    try {
      await this.listUsers.execute(req.body);
      return res.status(200).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };
  public verify = async (req: Request, res: Response) => {
    try {
      const parsed = VerifyDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.platformService.verify(parsed.data);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public softDelete = async (req: Request, res: Response) => {
    try {
      await this.lifecycleService.softDelete(req.body);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public restore = async (req: Request, res: Response) => {
    try {
      await this.lifecycleService.restore(req.body);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public findUserById = async (req: Request, res: Response) => {
    try {
      await this.findUser.byId(req.body);
      return res.status(200).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public findUserByEmail = async (req: Request, res: Response) => {
    try {
      await this.findUser.byEmail(req.body);
      return res.status(200).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public findUserByUsername = async (req: Request, res: Response) => {
    try {
      await this.findUser.byUsername(req.body);
      return res.status(200).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };
}
