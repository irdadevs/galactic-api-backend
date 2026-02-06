import { User, UserId } from "../../domain/aggregates/User";

const validInput = {
  email: "test@example.com",
  passwordHash: "hashed-password-123",
};

const assertDomainErrorCode = (fn: () => void, code: string) => {
  let thrown: unknown;
  try {
    fn();
  } catch (err) {
    thrown = err;
  }

  expect(thrown).toBeDefined();

  const error = thrown as { code?: string };
  expect(error.code).toBe(code);
};

describe("User aggregate", () => {
  it("creates a user with defaults", () => {
    const user = User.create(validInput);

    expect(UserId.isValid(user.id)).toBe(true);
    expect(user.email).toBe(validInput.email);
    expect(user.passwordHash).toBe(validInput.passwordHash);
    expect(user.isVerified).toBe(false);
    expect(user.role).toBe("User");
    expect(user.createdAt).toBeInstanceOf(Date);
  });

  it("creates a user with provided fields", () => {
    const user = User.create({
      ...validInput,
      id: "11111111-1111-4111-8111-111111111111",
      role: "Admin",
      isVerified: true,
      createdAt: new Date("2025-01-01T00:00:00.000Z"),
    });

    expect(user.id).toBe("11111111-1111-4111-8111-111111111111");
    expect(user.role).toBe("Admin");
    expect(user.isVerified).toBe(true);
    expect(user.createdAt.toISOString()).toBe("2025-01-01T00:00:00.000Z");
  });

  it("throws on invalid id", () => {
    assertDomainErrorCode(
      () =>
        User.create({
          ...validInput,
          id: "not-a-uuid",
        }),
      "DOMAIN.INVALID_USER_ID",
    );
  });

  it("throws on invalid email", () => {
    assertDomainErrorCode(
      () =>
        User.create({
          ...validInput,
          email: "not-an-email",
        }),
      "DOMAIN.INVALID_USER_EMAIL",
    );
  });

  it("throws on invalid password hash", () => {
    assertDomainErrorCode(
      () =>
        User.create({
          ...validInput,
          passwordHash: "short",
        }),
      "DOMAIN.INVALID_USER_PASSWORD",
    );
  });

  it("throws on invalid role", () => {
    assertDomainErrorCode(
      () =>
        User.create({
          ...validInput,
          role: "Root" as "Admin",
        }),
      "DOMAIN.INVALID_USER_ROLE",
    );
  });

  it("verifies email idempotently", () => {
    const user = User.create(validInput);

    user.verifyEmail();
    user.verifyEmail();

    expect(user.isVerified).toBe(true);
  });

  it("changes email when different", () => {
    const user = User.create(validInput);

    user.changeEmail("next@example.com");

    expect(user.email).toBe("next@example.com");
  });

  it("keeps email when unchanged", () => {
    const user = User.create(validInput);

    user.changeEmail(validInput.email);

    expect(user.email).toBe(validInput.email);
  });

  it("changes password hash when different", () => {
    const user = User.create(validInput);

    user.changePasswordHash("another-hash-123");

    expect(user.passwordHash).toBe("another-hash-123");
  });

  it("keeps password hash when unchanged", () => {
    const user = User.create(validInput);

    user.changePasswordHash(validInput.passwordHash);

    expect(user.passwordHash).toBe(validInput.passwordHash);
  });

  it("rehydrates from persistence data", () => {
    const user = User.rehydrate({
      id: "22222222-2222-4222-8222-222222222222",
      email: "rehydrated@example.com",
      passwordHash: "rehydrated-hash-123",
      isVerified: true,
      createdAt: new Date("2024-06-01T10:00:00.000Z"),
      role: "User",
    });

    expect(user.id).toBe("22222222-2222-4222-8222-222222222222");
    expect(user.email).toBe("rehydrated@example.com");
    expect(user.passwordHash).toBe("rehydrated-hash-123");
    expect(user.isVerified).toBe(true);
    expect(user.role).toBe("User");
  });

  it("maps to DB DTO", () => {
    const user = User.create(validInput);

    const dto = user.toDB();

    expect(dto).toEqual({
      id: user.id,
      email: user.email,
      password: user.passwordHash,
      is_verified: user.isVerified,
      created_at: user.createdAt,
      role: user.role,
    });
  });
});
