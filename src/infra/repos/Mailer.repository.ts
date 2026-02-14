import { randomInt } from "crypto";
import { IMailer } from "../../app/interfaces/Mailer.port";
import { Email } from "../../domain/aggregates/User";
import { ErrorFactory } from "../../utils/errors/Error.map";

const nodemailer = require("nodemailer");

type MailerConfig = {
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  from?: string;
  isProd?: boolean;
};

export class MailerRepo implements IMailer {
  private readonly transporter: any | null;
  private readonly from: string;
  private readonly isProd: boolean;

  constructor(config?: MailerConfig) {
    const host = config?.host ?? process.env.SMTP_HOST;
    const port = config?.port ?? Number(process.env.SMTP_PORT ?? 0);
    const user = config?.user ?? process.env.SMTP_USER;
    const pass = config?.pass ?? process.env.SMTP_PASS;
    this.from =
      config?.from ?? process.env.SMTP_FROM ?? "no-reply@galactic.local";
    this.isProd = config?.isProd ?? process.env.NODE_ENV === "production";

    if (host && Number.isFinite(port) && port > 0) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: config?.secure ?? process.env.SMTP_SECURE === "true",
        auth: user && pass ? { user, pass } : undefined,
      });
      return;
    }

    this.transporter = null;
  }

  genCode(long: number = 6): string {
    const digits =
      "abcdefghijklmnoprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < long; i++) {
      code += digits[randomInt(0, digits.length)];
    }
    return code;
  }

  async send(to: Email, subject: string, body: string): Promise<void> {
    if (!this.transporter) {
      if (this.isProd) {
        throw ErrorFactory.infra("SHARED.DEPENDENCY_NOT_FOUND", {
          dep: "SMTP transport",
        });
      }

      console.info(
        `[MAILER] to=${to.toString()} subject="${subject}" body="${body}"`,
      );
      return;
    }

    await this.transporter.sendMail({
      from: this.from,
      to: to.toString(),
      subject,
      text: body,
    });
  }
}
