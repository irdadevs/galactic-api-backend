import dotenv from "dotenv";
dotenv.config();

import Express from "express";
import cors from "cors";
import morgan from "morgan";

import { PgPoolQueryable } from "./infra/db/Postgres";
import { PgUnitOfWorkFactory } from "./infra/db/PostgresUoW";
import { RedisAdapter } from "./infra/RedisAdapter";
import { CONSOLE_COLORS } from "./utils/Chalk";
import { buildApiRouter } from "./presentation/routes";

const app = Express();

const PORT = Number(process.env.PORT ?? 8080);
const ENVIRONMENT = process.env.NODE_ENV ?? "dev";

// middleware
app.use(Express.json());
app.use(cors());
app.use(morgan(ENVIRONMENT));
app.use(buildApiRouter());

// infra singletons
let postgres: PgPoolQueryable;
let uowFactory: PgUnitOfWorkFactory;
let cache: RedisAdapter;

const server = app.listen(PORT, async () => {
  try {
    // ---- DB ----
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

    // ---- UoW factory ----
    uowFactory = new PgUnitOfWorkFactory(postgres._getPool());

    // ---- Cache ----
    cache = new RedisAdapter({
      keyPrefix: ENVIRONMENT,
    });
    `✅${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.successColor(
      `🚀 Server listening on port ${PORT}.`,
    )}`;
  } catch (e) {
    `❌${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.errorColor(
      `Failed to start server. ${e}.`,
    )}`;
    process.exit(1);
  }
});

// ---- graceful shutdown ----
const shutdown = async (signal: string) => {
  `⚠️${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.warningColor(
    `🛑 ${signal} received. Shutting down...`,
  )}`;
  console.log(`\n🛑 ${signal} received. Shutting down…`);

  server.close(async () => {
    try {
      await cache?.close();
      await postgres?.close();

      `✅${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.successColor(
        `Graceful shutdown complete.`,
      )}`;
      process.exit(0);
    } catch (e) {
      `❌${CONSOLE_COLORS.labelColor("[🛜SERVER]")} ${CONSOLE_COLORS.errorColor(
        `Error during shutdown. ${e}`,
      )}`;
      process.exit(1);
    }
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// OPTIONAL: export infra for DI
export { postgres, uowFactory, cache };
