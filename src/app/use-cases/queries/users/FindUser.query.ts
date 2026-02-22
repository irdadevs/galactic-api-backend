import {
  Email,
  User,
  Username,
  Uuid,
} from "../../../../domain/aggregates/User";
import { UserCacheService } from "../../../app-services/users/UserCache.service";
import { IUser } from "../../../interfaces/User.port";

export default class FindUser {
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

  async byId(id: Uuid): Promise<User | null> {
    await this.archiveInactiveAndInvalidate();
    const cached = await this.userCache.getById(id.toString());
    if (cached) return cached;

    const user = await this.repo.findById(id);
    if (user) {
      await this.userCache.setUser(user);
    }
    return user;
  }

  async byEmail(email: Email): Promise<User | null> {
    await this.archiveInactiveAndInvalidate();
    const cached = await this.userCache.getByEmail(email.toString());
    if (cached) return cached;

    const user = await this.repo.findByEmail(email);
    if (user) {
      await this.userCache.setUser(user);
    }
    return user;
  }

  async byUsername(username: Username): Promise<User | null> {
    await this.archiveInactiveAndInvalidate();
    const cached = await this.userCache.getByUsername(username.toString());
    if (cached) return cached;

    const user = await this.repo.findByUsername(username);
    if (user) {
      await this.userCache.setUser(user);
    }
    return user;
  }
}
