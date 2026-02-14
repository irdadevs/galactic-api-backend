import { Response, Request } from "express";
import { PlatformService } from "../../app/app-services/users/Platform.service";
import { LifecycleService } from "../../app/app-services/users/Lifecycle.service";
import { HealthQuery } from "../../app/use-cases/queries/Health.query";
import { AuthService } from "../../app/app-services/users/Auth.service";
import { ChangeEmailDTO } from "../security/users/ChangeEmail.dto";
import { ChangePasswordDTO } from "../security/users/ChangePassword.dto";
import { ChangeUsernameDTO } from "../security/users/ChangeUsername.dto";
import { FindUserByEmailDTO } from "../security/users/FindUserByEmail.dto";
import { FindUserByIdDTO } from "../security/users/FindUserById.dto";
import { FindUserByUsernameDTO } from "../security/users/FindUserByUsername.dto";
import { LoginDTO } from "../security/users/Login.dto";
import { LogoutDTO } from "../security/users/Logout.dto";
import { RefreshDTO } from "../security/users/Refresh.dto";
import { ResendVerificationDTO } from "../security/users/ResendVerification.dto";
import { RestoreDTO } from "../security/users/Restore.dto";
import { SignupDTO } from "../security/users/Signup.dto";
import { SoftDeleteDTO } from "../security/users/SoftDelete.dto";
import { VerifyDTO } from "../security/users/Verify.dto";
import FindUser from "../../app/use-cases/queries/users/FindUser.query";
import { ListUsers } from "../../app/use-cases/queries/users/ListUsers.query";
import errorHandler from "../../utils/errors/Errors.handler";
import invalidBody from "../../utils/invalidBody";
import { ListUsersDTO } from "../security/users/ListUsers.dto";
import { Email, Username, Uuid } from "../../domain/aggregates/User";

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
      return res.status(200).json(result);
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
          verified: result.user.isVerified,
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
      const parsed = RefreshDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const tokens = await this.authService.refresh(parsed.data.refreshToken);

      return res.status(200).json(tokens);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public logout = async (req: Request, res: Response) => {
    try {
      const parsed = LogoutDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.authService.logout(parsed.data.sessionId);

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

      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          verified: user.isVerified,
        },
      });
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

      await this.platformService.changeEmail(
        Uuid.create(req.auth.userId),
        parsed.data,
      );
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

      await this.platformService.changePassword(
        Uuid.create(req.auth.userId),
        parsed.data,
      );
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

      await this.platformService.changeUsername(
        Uuid.create(req.auth.userId),
        parsed.data,
      );
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public list = async (req: Request, res: Response) => {
    try {
      const parsed = ListUsersDTO.safeParse(req.query);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const result = await this.listUsers.execute(parsed.data);
      return res.status(200).json(result);
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

  public resendVerification = async (req: Request, res: Response) => {
    try {
      const parsed = ResendVerificationDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.platformService.resendVerification(parsed.data);
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public softDelete = async (req: Request, res: Response) => {
    try {
      const parsed = SoftDeleteDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.lifecycleService.softDelete(Uuid.create(parsed.data.id));
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public selfSoftDelete = async (req: Request, res: Response) => {
    try {
      await this.lifecycleService.softDelete(Uuid.create(req.auth.userId));
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public restore = async (req: Request, res: Response) => {
    try {
      const parsed = RestoreDTO.safeParse(req.body);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      await this.lifecycleService.restore(Uuid.create(parsed.data.id));
      return res.status(204).send();
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public findUserById = async (req: Request, res: Response) => {
    try {
      const parsed = FindUserByIdDTO.safeParse(req.params);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const user = await this.findUser.byId(Uuid.create(parsed.data.id));
      return res.status(200).json(user);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public me = async (req: Request, res: Response) => {
    try {
      const user = await this.findUser.byId(Uuid.create(req.auth.userId));
      return res.status(200).json(user);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public findUserByEmail = async (req: Request, res: Response) => {
    try {
      const parsed = FindUserByEmailDTO.safeParse(req.params);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const user = await this.findUser.byEmail(Email.create(parsed.data.email));
      return res.status(200).json(user);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };

  public findUserByUsername = async (req: Request, res: Response) => {
    try {
      const parsed = FindUserByUsernameDTO.safeParse(req.params);
      if (!parsed.success) {
        return invalidBody(res, parsed.error);
      }

      const user = await this.findUser.byUsername(
        Username.create(parsed.data.username),
      );
      return res.status(200).json(user);
    } catch (err: unknown) {
      return errorHandler(err, res);
    }
  };
}
