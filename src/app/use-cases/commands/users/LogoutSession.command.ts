import { ISession } from "../../../interfaces/Session.port";

export class LogoutSession {
  constructor(private readonly sessionRepo: ISession) {}

  async execute(sessionId: string): Promise<void> {
    await this.sessionRepo.revoke(sessionId);
  }
}
