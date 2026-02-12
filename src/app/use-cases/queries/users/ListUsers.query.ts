import { ICache } from "../../../interfaces/Cache.port";
import { User } from "../../../../domain/aggregates/User";
import { IUser, ListUsersQuery } from "../../../interfaces/User.port";

export class ListUsers {
  constructor(
    private readonly repo: IUser,
    private readonly cache: ICache,
  ) {}

  async execute(
    query: ListUsersQuery,
  ): Promise<{ rows: User[]; total: number }> {
    const result = await this.repo.list(query);
    await this.cache.set("users:list", result.rows);
    return result;
  }
}
