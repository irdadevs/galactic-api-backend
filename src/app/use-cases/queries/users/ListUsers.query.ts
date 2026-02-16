import { User } from "../../../../domain/aggregates/User";
import { IUser, ListUsersQuery } from "../../../interfaces/User.port";
import { UserCacheService } from "../../../app-services/users/UserCache.service";

export class ListUsers {
  constructor(
    private readonly repo: IUser,
    private readonly userCache: UserCacheService,
  ) {}

  async execute(
    query: ListUsersQuery,
  ): Promise<{ rows: User[]; total: number }> {
    const cached = await this.userCache.getList(query);
    if (cached) {
      return cached;
    }

    const result = await this.repo.list(query);
    await this.userCache.setList(query, result);

    return result;
  }
}
