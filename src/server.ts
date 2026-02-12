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
import { ScopeMiddleware } from "./presentation/middlewares/scope";

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
    const jwtService = new JwtService();
    //! App layer
    // Use-cases
    // App-services
    //! Presentation layer
    // Controllers
    // const userController = new UserController(healthCheck, authService, lifecycleService);
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
        auth: authMiddleware,
        scope: scopeMiddleware,
      }),
    );

    console.log(
      `${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.successColor(
        "✅ Composition root wiring finished",
      )}`,
    );

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
