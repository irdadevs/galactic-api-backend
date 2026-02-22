import { ErrorFactory } from "../../utils/errors/Error.map";
import { Uuid } from "./User";

export type DonationType = "one_time" | "monthly";
export type DonationStatus =
  | "pending"
  | "active"
  | "completed"
  | "canceled"
  | "failed"
  | "expired";
export type PaymentProvider = "stripe";

export class CurrencyCode {
  private constructor(private readonly value: string) {}

  static create(value: string): CurrencyCode {
    const normalized = value.trim().toUpperCase();
    if (!/^[A-Z]{3}$/.test(normalized)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "currency",
      });
    }
    return new CurrencyCode(normalized);
  }

  toString(): string {
    return this.value;
  }
}

export class Money {
  private constructor(private readonly amountMinorValue: number) {}

  static create(amountMinor: number): Money {
    if (!Number.isInteger(amountMinor) || amountMinor <= 0) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "amountMinor",
      });
    }
    return new Money(amountMinor);
  }

  get amountMinor(): number {
    return this.amountMinorValue;
  }
}

export type DonationCreateProps = {
  id?: string;
  userId: string;
  donationType: DonationType;
  amountMinor: number;
  currency: string;
  status?: DonationStatus;
  provider?: PaymentProvider;
  providerSessionId: string;
  providerCustomerId?: string | null;
  providerSubscriptionId?: string | null;
  currentPeriodStart?: Date | null;
  currentPeriodEnd?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  canceledAt?: Date | null;
};

const ALLOWED_TYPES: DonationType[] = ["one_time", "monthly"];
const ALLOWED_STATUSES: DonationStatus[] = [
  "pending",
  "active",
  "completed",
  "canceled",
  "failed",
  "expired",
];

export class Donation {
  private constructor(
    private props: {
      id: Uuid;
      userId: Uuid;
      donationType: DonationType;
      amountMinor: number;
      currency: CurrencyCode;
      status: DonationStatus;
      provider: PaymentProvider;
      providerSessionId: string;
      providerCustomerId: string | null;
      providerSubscriptionId: string | null;
      currentPeriodStart: Date | null;
      currentPeriodEnd: Date | null;
      createdAt: Date;
      updatedAt: Date;
      canceledAt: Date | null;
    },
  ) {}

  static create(input: DonationCreateProps): Donation {
    if (!ALLOWED_TYPES.includes(input.donationType)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "donationType",
      });
    }
    const status = input.status ?? "pending";
    if (!ALLOWED_STATUSES.includes(status)) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "status",
      });
    }
    const money = Money.create(input.amountMinor);
    const providerSessionId = input.providerSessionId.trim();
    if (!providerSessionId) {
      throw ErrorFactory.domain("PRESENTATION.INVALID_FIELD", {
        field: "providerSessionId",
      });
    }

    return new Donation({
      id: Uuid.create(input.id),
      userId: Uuid.create(input.userId),
      donationType: input.donationType,
      amountMinor: money.amountMinor,
      currency: CurrencyCode.create(input.currency),
      status,
      provider: input.provider ?? "stripe",
      providerSessionId,
      providerCustomerId: input.providerCustomerId ?? null,
      providerSubscriptionId: input.providerSubscriptionId ?? null,
      currentPeriodStart: input.currentPeriodStart ?? null,
      currentPeriodEnd: input.currentPeriodEnd ?? null,
      createdAt: input.createdAt ?? new Date(),
      updatedAt: input.updatedAt ?? new Date(),
      canceledAt: input.canceledAt ?? null,
    });
  }

  static rehydrate(input: DonationCreateProps & { id: string }): Donation {
    return Donation.create(input);
  }

  completeOneTime(): void {
    this.props.status = "completed";
    this.props.updatedAt = new Date();
  }

  activateRecurring(params: {
    providerCustomerId?: string | null;
    providerSubscriptionId: string;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
  }): void {
    this.props.status = "active";
    this.props.providerCustomerId =
      params.providerCustomerId ?? this.props.providerCustomerId;
    this.props.providerSubscriptionId = params.providerSubscriptionId;
    this.props.currentPeriodStart = params.currentPeriodStart ?? null;
    this.props.currentPeriodEnd = params.currentPeriodEnd ?? null;
    this.props.updatedAt = new Date();
  }

  fail(): void {
    this.props.status = "failed";
    this.props.updatedAt = new Date();
  }

  expire(): void {
    this.props.status = "expired";
    this.props.updatedAt = new Date();
  }

  cancel(): void {
    this.props.status = "canceled";
    this.props.canceledAt = new Date();
    this.props.updatedAt = new Date();
  }

  get id(): string {
    return this.props.id.toString();
  }
  get userId(): string {
    return this.props.userId.toString();
  }
  get donationType(): DonationType {
    return this.props.donationType;
  }
  get amountMinor(): number {
    return this.props.amountMinor;
  }
  get currency(): string {
    return this.props.currency.toString();
  }
  get status(): DonationStatus {
    return this.props.status;
  }
  get provider(): PaymentProvider {
    return this.props.provider;
  }
  get providerSessionId(): string {
    return this.props.providerSessionId;
  }
  get providerCustomerId(): string | null {
    return this.props.providerCustomerId;
  }
  get providerSubscriptionId(): string | null {
    return this.props.providerSubscriptionId;
  }
  get currentPeriodStart(): Date | null {
    return this.props.currentPeriodStart;
  }
  get currentPeriodEnd(): Date | null {
    return this.props.currentPeriodEnd;
  }
  get createdAt(): Date {
    return this.props.createdAt;
  }
  get updatedAt(): Date {
    return this.props.updatedAt;
  }
  get canceledAt(): Date | null {
    return this.props.canceledAt;
  }

  toJSON(): {
    id: string;
    userId: string;
    donationType: DonationType;
    amountMinor: number;
    currency: string;
    status: DonationStatus;
    provider: PaymentProvider;
    providerSessionId: string;
    providerCustomerId: string | null;
    providerSubscriptionId: string | null;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    createdAt: Date;
    updatedAt: Date;
    canceledAt: Date | null;
  } {
    return {
      id: this.id,
      userId: this.userId,
      donationType: this.donationType,
      amountMinor: this.amountMinor,
      currency: this.currency,
      status: this.status,
      provider: this.provider,
      providerSessionId: this.providerSessionId,
      providerCustomerId: this.providerCustomerId,
      providerSubscriptionId: this.providerSubscriptionId,
      currentPeriodStart: this.currentPeriodStart,
      currentPeriodEnd: this.currentPeriodEnd,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      canceledAt: this.canceledAt,
    };
  }
}
