import dotenv from "dotenv";
dotenv.config();

import Express from "express";
import cors from "cors";
import morgan from "morgan";
import compression from "compression";
import hpp from "hpp";
import rateLimit from "express-rate-limit";

import { PgPoolQueryable } from "./infra/db/Postgres";
import { PgUnitOfWorkFactory } from "./infra/db/PostgresUoW";
import { RedisRepo } from "./infra/repos/Redis.repository";
import { CONSOLE_COLORS } from "./utils/Chalk";
import { buildApiRouter } from "./presentation/routes";
import UserRepo from "./infra/repos/User.repository";
import JwtService from "./infra/repos/Jwt.repository";
import { AuthMiddleware } from "./presentation/middlewares/Auth.middleware";
import { ScopeMiddleware } from "./presentation/middlewares/Scope.middleware.ts";
import { SessionRepo } from "./infra/repos/Session.repository";
import { LoginUser } from "./app/use-cases/commands/users/LoginUser.command";
import { HasherRepo } from "./infra/repos/Hasher.repository";
import { SignupUser } from "./app/use-cases/commands/users/SignupUser.command";
import { VerifyUser } from "./app/use-cases/commands/users/VerifyUser.command";
import { ChangeEmail } from "./app/use-cases/commands/users/ChangeEmail.command";
import { ChangePassword } from "./app/use-cases/commands/users/ChangePassword.command";
import { ChangeRole } from "./app/use-cases/commands/users/ChangeRole.command";
import { ChangeUsername } from "./app/use-cases/commands/users/ChangeUsername.command";
import { ResendVerificationCode } from "./app/use-cases/commands/users/ResendVerificationCode.command";
import { ListUsers } from "./app/use-cases/queries/users/ListUsers.query";
import { SoftDeleteUser } from "./app/use-cases/commands/users/SoftDeleteUser.command";
import { RestoreUser } from "./app/use-cases/commands/users/RestoreUser.command";
import { AuthService } from "./app/app-services/users/Auth.service";
import { RefreshSession } from "./app/use-cases/commands/users/RefreshSession.command";
import { LogoutSession } from "./app/use-cases/commands/users/LogoutSession.command";
import { LogoutAllSessions } from "./app/use-cases/commands/users/LogoutAllSessions.command";
import { PlatformService } from "./app/app-services/users/Platform.service";
import { LifecycleService } from "./app/app-services/users/Lifecycle.service";
import { UserCacheService } from "./app/app-services/users/UserCache.service";
import { GalaxyCacheService } from "./app/app-services/galaxies/GalaxyCache.service";
import { SystemCacheService } from "./app/app-services/systems/SystemCache.service";
import { UserController } from "./presentation/controllers/User.controller";
import { GalaxyController } from "./presentation/controllers/Galaxy.controller";
import { SystemController } from "./presentation/controllers/System.controller";
import FindUser from "./app/use-cases/queries/users/FindUser.query";
import { HealthQuery } from "./app/use-cases/queries/Health.query";
import { MailerRepo } from "./infra/repos/Mailer.repository";
import GalaxyRepo from "./infra/repos/Galaxy.repository";
import SystemRepo from "./infra/repos/System.repository";
import StarRepo from "./infra/repos/Star.repository";
import PlanetRepo from "./infra/repos/Planet.repository";
import MoonRepo from "./infra/repos/Moon.repository";
import AsteroidRepo from "./infra/repos/Asteroid.repository";
import { CreateGalaxy } from "./app/use-cases/commands/galaxies/CreateGalaxy.command";
import { ChangeGalaxyName } from "./app/use-cases/commands/galaxies/ChangeGalaxyName.command";
import { ChangeGalaxyShape } from "./app/use-cases/commands/galaxies/ChangeGalaxyShape.command";
import { DeleteGalaxy } from "./app/use-cases/commands/galaxies/DeleteGalaxy.command";
import { GalaxyLifecycleService } from "./app/app-services/galaxies/GalaxyLifecycle.service";
import { FindGalaxy } from "./app/use-cases/queries/galaxies/FindGalaxy.query";
import { ListGalaxies } from "./app/use-cases/queries/galaxies/ListGalaxies.query";
import { PopulateGalaxy } from "./app/use-cases/queries/galaxies/PopulateGalaxy.query";
import { FindSystem } from "./app/use-cases/queries/systems/FindSystem.query";
import { ListSystemsByGalaxy } from "./app/use-cases/queries/systems/ListSystemsByGalaxy.query";
import { ChangeSystemName } from "./app/use-cases/commands/systems/ChangeSystemName.command";
import { ChangeSystemPosition } from "./app/use-cases/commands/systems/ChangeSystemPosition.command";

// --------------------
// Server config
// --------------------
const app = Express();
const PORT = Number(process.env.PORT ?? 8080);
const ENVIRONMENT = process.env.NODE_ENV ?? "dev";
const IS_PROD = ENVIRONMENT === "production";

// --------------------
// Global middlewares
// --------------------
app.set("trust proxy", 1);
app.use(Express.json());
app.use(cors());
app.use(hpp());
app.use(compression());
app.use(
  rateLimit({
    windowMs: 60_000,
    max: IS_PROD ? 300 : 1000,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);
app.use(morgan(IS_PROD ? "combined" : "dev"));

// --------------------
// Infra singletons (will be used for DI)
// --------------------
let postgres: PgPoolQueryable;
let uowFactory: PgUnitOfWorkFactory;
let cache: RedisRepo;

// --------------------
// Start server & composition root wiring
// --------------------
async function start(): Promise<void> {
  try {
    // --------------------
    // 1️⃣ Initialize infrastructure layer
    // --------------------
    postgres = await PgPoolQueryable.connect(
      {
        connectionString: process.env.DATABASE_URL,
        port: Number(process.env.PGPORT),
        ssl:
          process.env.PGSSL === "true" ? { rejectUnauthorized: false } : false,
        max: Number(process.env.PGMAX ?? 10),
        idleTimeoutMillis: Number(process.env.PGIDLE_TIMEOUT_MS ?? 10000),
      },
      console,
    );

    uowFactory = new PgUnitOfWorkFactory(postgres._getPool());

    cache = new RedisRepo({
      keyPrefix: ENVIRONMENT,
    });

    // --------------------
    // 2️⃣ Composition root wiring
    // --------------------
    // TODO: Here we will instanciate all that needs DI:
    //! Infra layer (repos)
    const userRepo = new UserRepo(postgres);
    const galaxyRepo = new GalaxyRepo(postgres);
    const systemRepo = new SystemRepo(postgres);
    const starRepo = new StarRepo(postgres);
    const planetRepo = new PlanetRepo(postgres);
    const moonRepo = new MoonRepo(postgres);
    const asteroidRepo = new AsteroidRepo(postgres);
    const sessionRepo = new SessionRepo(postgres._getPool());
    const hasher = new HasherRepo();
    const mailer = new MailerRepo();
    const jwtService = new JwtService();
    const userCache = new UserCacheService(cache);
    const galaxyCache = new GalaxyCacheService(cache);
    const systemCache = new SystemCacheService(cache);
    //! App layer
    // Use-cases
    const healthCheck = new HealthQuery();
    const loginUser = new LoginUser(userRepo, hasher);
    const signupUser = new SignupUser(userRepo, hasher, mailer, userCache);
    const verifyUser = new VerifyUser(userRepo, hasher, userCache);
    const resendVerificationCode = new ResendVerificationCode(
      userRepo,
      hasher,
      mailer,
      userCache,
    );
    const changeEmailUser = new ChangeEmail(userRepo, userCache);
    const changePasswordUser = new ChangePassword(
      userRepo,
      hasher,
      sessionRepo,
      userCache,
    );
    const changeRoleUser = new ChangeRole(userRepo, sessionRepo, userCache);
    const changeUsernameUser = new ChangeUsername(userRepo, userCache);
    const listUsers = new ListUsers(userRepo, userCache);
    const softDeleteUser = new SoftDeleteUser(userRepo, userCache);
    const restoreUser = new RestoreUser(userRepo, userCache);
    const refreshSession = new RefreshSession(jwtService, sessionRepo, hasher);
    const logoutSession = new LogoutSession(sessionRepo);
    const logoutAllSessions = new LogoutAllSessions(sessionRepo);
    const findUser = new FindUser(userRepo, userCache);
    const galaxyLifecycle = new GalaxyLifecycleService();
    const createGalaxy = new CreateGalaxy(
      uowFactory,
      {
        galaxy: (db) => new GalaxyRepo(db),
        system: (db) => new SystemRepo(db),
        star: (db) => new StarRepo(db),
        planet: (db) => new PlanetRepo(db),
        moon: (db) => new MoonRepo(db),
        asteroid: (db) => new AsteroidRepo(db),
      },
      galaxyLifecycle,
      galaxyCache,
      systemCache,
    );
    const changeGalaxyName = new ChangeGalaxyName(galaxyRepo, galaxyCache);
    const changeGalaxyShape = new ChangeGalaxyShape(
      uowFactory,
      {
        galaxy: (db) => new GalaxyRepo(db),
        system: (db) => new SystemRepo(db),
        star: (db) => new StarRepo(db),
        planet: (db) => new PlanetRepo(db),
        moon: (db) => new MoonRepo(db),
        asteroid: (db) => new AsteroidRepo(db),
      },
      galaxyLifecycle,
      galaxyCache,
      systemCache,
    );
    const deleteGalaxy = new DeleteGalaxy(
      uowFactory,
      {
        galaxy: (db) => new GalaxyRepo(db),
        system: (db) => new SystemRepo(db),
        star: (db) => new StarRepo(db),
        planet: (db) => new PlanetRepo(db),
        moon: (db) => new MoonRepo(db),
        asteroid: (db) => new AsteroidRepo(db),
      },
      galaxyLifecycle,
      galaxyCache,
      systemCache,
    );
    const findGalaxy = new FindGalaxy(galaxyRepo, galaxyCache);
    const listGalaxies = new ListGalaxies(galaxyRepo, galaxyCache);
    const populateGalaxy = new PopulateGalaxy(
      galaxyRepo,
      systemRepo,
      starRepo,
      planetRepo,
      moonRepo,
      asteroidRepo,
      galaxyCache,
    );
    const findSystem = new FindSystem(systemRepo, systemCache);
    const listSystemsByGalaxy = new ListSystemsByGalaxy(systemRepo, systemCache);
    const changeSystemName = new ChangeSystemName(
      systemRepo,
      systemCache,
      galaxyCache,
    );
    const changeSystemPosition = new ChangeSystemPosition(
      systemRepo,
      systemCache,
      galaxyCache,
    );
    // App-services
    const authService = new AuthService(
      loginUser,
      refreshSession,
      logoutSession,
      logoutAllSessions,
      sessionRepo,
      jwtService,
      hasher,
    );
    const platformService = new PlatformService(
      signupUser,
      verifyUser,
      resendVerificationCode,
      changeEmailUser,
      changePasswordUser,
      changeRoleUser,
      changeUsernameUser,
    );
    const lifecycleService = new LifecycleService(softDeleteUser, restoreUser);
    //! Presentation layer
    // Controllers
    const userController = new UserController(
      healthCheck,
      findUser,
      listUsers,
      authService,
      platformService,
      lifecycleService,
    );
    const galaxyController = new GalaxyController(
      createGalaxy,
      changeGalaxyName,
      changeGalaxyShape,
      deleteGalaxy,
      findGalaxy,
      listGalaxies,
      populateGalaxy,
    );
    const systemController = new SystemController(
      findSystem,
      listSystemsByGalaxy,
      changeSystemName,
      changeSystemPosition,
      findGalaxy,
    );
    // Middlewares
    const authMiddleware = new AuthMiddleware(jwtService, {
      issuer: process.env.JWT_ISSUER!,
      audience: process.env.JWT_AUDIENCE!,
    });
    const scopeMiddleware = new ScopeMiddleware();
    // Routers
    app.use(
      buildApiRouter({
        userController,
        galaxyController,
        systemController,
        auth: authMiddleware,
        scope: scopeMiddleware,
      }),
    );

    console.log(
      `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.successColor(
        "✅ Composition root wiring finished",
      )}`,
    );
    app.disable("x-powered-by");

    // --------------------
    // 3️⃣ Start listening
    // --------------------
    app.listen(PORT, () => {
      console.log(
        `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.successColor(
          `Listening on port ${PORT}`,
        )}`,
      );
    });
  } catch (e) {
    console.error(
      `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.errorColor(
        `Failed to start: ${e instanceof Error ? e.message : String(e)}`,
      )}`,
    );
    process.exit(1);
  }
}

// --------------------
// Graceful shutdown
// --------------------
const shutdown = async (signal: string) => {
  console.log(
    `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.warningColor(
      `🛑 Shutdown signal ${signal} received`,
    )}`,
  );
  try {
    await cache?.close();
    await postgres?.close();
    process.exit(0);
  } catch (e) {
    console.error(
      `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.errorColor(
        `❌ Shutdown error: ${e instanceof Error ? e.message : String(e)}`,
      )}`,
    );
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// --------------------
// Bootstrap
// --------------------
start().catch((e) => {
  console.error(
    `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.errorColor(
      `❌ Bootstrap error: ${e instanceof Error ? e.message : String(e)}`,
    )}`,
  );
  process.exit(1);
});

// --------------------
// Export infra for DI if needed
// --------------------
export { postgres, uowFactory, cache };
