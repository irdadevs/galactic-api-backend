import { loadAppEnv } from "../../config/AppEnv";

describe("loadAppEnv", () => {
  it("parses a valid development env", () => {
    const env = loadAppEnv({
      NODE_ENV: "development",
      PORT: "8080",
      DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
      PGPORT: "5432",
      PGSSL: "false",
      PGMAX: "10",
      PGIDLE_TIMEOUT_MS: "10000",
      JWT_ISSUER: "issuer",
      JWT_AUDIENCE: "audience",
    });

    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(8080);
    expect(env.CORS_ORIGINS).toBe(true);
  });

  it("requires CORS_ORIGIN in production", () => {
    expect(() =>
      loadAppEnv({
        NODE_ENV: "production",
        PORT: "8080",
        DATABASE_URL: "postgresql://user:pass@localhost:5432/db",
        PGPORT: "5432",
        PGSSL: "true",
        PGMAX: "10",
        PGIDLE_TIMEOUT_MS: "10000",
        JWT_ISSUER: "issuer",
        JWT_AUDIENCE: "audience",
      }),
    ).toThrow(/CORS_ORIGIN/i);
  });
});
