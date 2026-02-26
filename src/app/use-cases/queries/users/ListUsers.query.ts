import { IUser, ListUsersQuery, UserListItem } from "../../../interfaces/User.port";
import { UserCacheService } from "../../../app-services/users/UserCache.service";

export class ListUsers {
  constructor(
    private readonly repo: IUser,
    private readonly userCache: UserCacheService,
  ) {}

  private async archiveInactiveAndInvalidate(): Promise<void> {
    const archived = await this.repo.archiveInactive(90);
    if (archived.length === 0) return;
    for (const user of archived) {
      await this.userCache.invalidateBySnapshot({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }
  }

  async execute(query: ListUsersQuery): Promise<{ rows: UserListItem[]; total: number }> {
    await this.archiveInactiveAndInvalidate();
    const cached = await this.userCache.getList(query);
    if (cached) {
      return cached;
    }

    const result = await this.repo.list(query);
    await this.userCache.setList(query, result);

    return result;
  }
}
