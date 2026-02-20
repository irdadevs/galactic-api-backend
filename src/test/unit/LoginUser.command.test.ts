import { LoginUser } from "../../app/use-cases/commands/users/LoginUser.command";
import { IUser } from "../../app/interfaces/User.port";
import { IHasher } from "../../app/interfaces/Hasher.port";
import { User } from "../../domain/aggregates/User";

describe("LoginUser command", () => {
  it("auto-unarchives archived users on successful login", async () => {
    const archived = User.create({
      id: "11111111-1111-4111-8111-111111111111",
      email: "archived@test.com",
      passwordHash: "hashed-password-123",
      username: "archived_user",
      isVerified: true,
      isDeleted: true,
      isArchived: true,
      deletedAt: new Date("2025-01-01T00:00:00.000Z"),
      archivedAt: new Date("2025-01-01T00:00:00.000Z"),
      lastActivityAt: new Date("2024-01-01T00:00:00.000Z"),
    });

    const repo: IUser = {
      save: jest.fn(async (u): Promise<User> => u),
      findById: jest.fn(async (): Promise<User | null> => null),
      findByEmail: jest.fn(async (): Promise<User | null> => archived),
      findByUsername: jest.fn(async (): Promise<User | null> => null),
      list: jest.fn(
        async (): Promise<{ rows: User[]; total: number }> => ({ rows: [], total: 0 }),
      ),
      changeEmail: jest.fn(async (): Promise<User> => archived),
      changePassword: jest.fn(async (): Promise<User> => archived),
      changeUsername: jest.fn(async (): Promise<User> => archived),
      changeRole: jest.fn(async (): Promise<User> => archived),
      verify: jest.fn(async (): Promise<void> => undefined),
      softDelete: jest.fn(async (): Promise<void> => undefined),
      restore: jest.fn(async (): Promise<void> => undefined),
      touchActivity: jest.fn(async (): Promise<void> => undefined),
      archiveInactive: jest.fn(
        async (): Promise<Array<{ id: string; email: string; username: string }>> => [],
      ),
    };

    const hasher: IHasher = {
      hash: jest.fn(async () => "hash"),
      compare: jest.fn(async () => true),
    };

    const command = new LoginUser(repo, hasher);
    const result = await command.execute({
      email: "archived@test.com",
      rawPassword: "123456",
    });

    expect(result.isArchived).toBe(false);
    expect(result.isDeleted).toBe(false);
    expect(repo.save).toHaveBeenCalledTimes(1);
  });
});
