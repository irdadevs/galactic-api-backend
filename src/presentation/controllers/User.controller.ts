import { Response, Request } from "express";
import { PlatformService } from "../../app/app-services/users/Platform.service";
import { LifecycleService } from "../../app/app-services/users/Lifecycle.service";
import { HealthQuery } from "../../app/use-cases/queries/Health.query";
import { AuthService } from "../../app/app-services/users/Auth.service";
import { LoginDTO } from "../security/Login.dto";
import FindUser from "../../app/use-cases/queries/users/FindUser.query";
import { ListUsers } from "../../app/use-cases/queries/users/ListUsers.query";

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
    const result = await this.healthCheck.execute("auth");
    return res.json(result);
  };

  async login(req: Request, res: Response) {
    try {
      const parsed = LoginDTO.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          ok: false,
          error: "INVALID_BODY",
          details: parsed.error,
        });
      }

      const result = await this.authService.login(req.body, {
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
    } catch (err: any) {}
  }

  async refresh(req: Request, res: Response) {
    const { refreshToken } = req.body;

    const tokens = await this.authService.refresh(refreshToken);

    return res.status(200).json(tokens);
  }

  async logout(req: Request, res: Response) {
    const { sessionId } = req.body;

    await this.authService.logout(sessionId);

    return res.status(204).send();
  }

  async logoutAll(req: Request, res: Response) {
    await this.authService.logoutAll(req.auth.userId);

    return res.status(204).send();
  }

  async signup(req: Request, res: Response) {
    const user = await this.platformService.signup(req.body);

    return res.status(201).json(user);
  }

  async changeEmail(req: Request, res: Response) {
    await this.platformService.changeEmail(req.body);
    return res.status(204).send();
  }

  async changePassword(req: Request, res: Response) {
    await this.platformService.changePassword(req.body);
    return res.status(204).send();
  }

  async changeUsername(req: Request, res: Response) {
    await this.platformService.changeUsername(req.body);
    return res.status(204).send();
  }

  async list(req: Request, res: Response) {
    await this.listUsers.execute(req.body);
    return res.status(200).send();
  }
  async verify(req: Request, res: Response) {
    await this.platformService.verify(req.body);
    return res.status(204).send();
  }

  async softDelete(req: Request, res: Response) {
    await this.lifecycleService.softDelete(req.body);
    return res.status(204).send();
  }

  async restore(req: Request, res: Response) {
    await this.lifecycleService.restore(req.body);
    return res.status(204).send();
  }

  async findUserById(req: Request, res: Response) {
    await this.findUser.byId(req.body);
    return res.status(200).send();
  }

  async findUserByEmail(req: Request, res: Response) {
    await this.findUser.byEmail(req.body);
    return res.status(200).send();
  }

  async findUserByUsername(req: Request, res: Response) {
    await this.findUser.byUsername(req.body);
    return res.status(200).send();
  }
}
