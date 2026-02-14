import { ISession } from "../../../interfaces/Session.port";

export class LogoutAllSessions {
  constructor(private readonly sessionRepo: ISession) {}

  async execute(userId: string): Promise<void> {
    await this.sessionRepo.revokeAllForUser(userId);
  }
}
