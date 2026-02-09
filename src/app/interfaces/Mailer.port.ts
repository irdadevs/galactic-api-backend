import { Email } from "../../domain/aggregates/User";

export interface IMailer {
  send(to: Email, subject: string, body: string): Promise<void>;
  resend(to: Email, subject: string, body: string): Promise<void>;
}
