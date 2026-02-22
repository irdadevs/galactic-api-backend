import { IDonation, ListDonationsQuery } from "../../app/interfaces/Donation.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { Donation } from "../../domain/aggregates/Donation";
import { paginateFrom, ParamBag } from "../../utils/Pagination";
import { ErrorFactory } from "../../utils/errors/Error.map";

export default class DonationRepo implements IDonation {
  constructor(private readonly db: Queryable) {}

  private mapRow(row: QueryResultRow): Donation {
    return Donation.rehydrate({
      id: String(row.id),
      userId: String(row.user_id),
      donationType: row.donation_type,
      amountMinor: Number(row.amount_minor),
      currency: row.currency,
      status: row.status,
      provider: row.provider,
      providerSessionId: row.provider_session_id,
      providerCustomerId: row.provider_customer_id ?? null,
      providerSubscriptionId: row.provider_subscription_id ?? null,
      currentPeriodStart: row.current_period_start ? new Date(row.current_period_start) : null,
      currentPeriodEnd: row.current_period_end ? new Date(row.current_period_end) : null,
      canceledAt: row.canceled_at ? new Date(row.canceled_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }

  async save(donation: Donation): Promise<Donation> {
    const json = donation.toJSON();
    await this.db.query(
      `
      INSERT INTO billing.donations (
        id, user_id, donation_type, amount_minor, currency, status, provider,
        provider_session_id, provider_customer_id, provider_subscription_id,
        current_period_start, current_period_end, canceled_at, created_at, updated_at
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      ON CONFLICT (id) DO UPDATE SET
        user_id = EXCLUDED.user_id,
        donation_type = EXCLUDED.donation_type,
        amount_minor = EXCLUDED.amount_minor,
        currency = EXCLUDED.currency,
        status = EXCLUDED.status,
        provider = EXCLUDED.provider,
        provider_session_id = EXCLUDED.provider_session_id,
        provider_customer_id = EXCLUDED.provider_customer_id,
        provider_subscription_id = EXCLUDED.provider_subscription_id,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        canceled_at = EXCLUDED.canceled_at,
        updated_at = now_utc()
      `,
      [
        json.id,
        json.userId,
        json.donationType,
        json.amountMinor,
        json.currency,
        json.status,
        json.provider,
        json.providerSessionId,
        json.providerCustomerId,
        json.providerSubscriptionId,
        json.currentPeriodStart,
        json.currentPeriodEnd,
        json.canceledAt,
        json.createdAt,
        json.updatedAt,
      ],
    );

    const stored = await this.findById(json.id);
    if (!stored) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "donation",
        id: json.id,
      });
    }
    return stored;
  }

  async findById(id: string): Promise<Donation | null> {
    const query = await this.db.query(
      `
      SELECT
        id,
        user_id,
        donation_type,
        amount_minor,
        currency,
        status,
        provider,
        provider_session_id,
        provider_customer_id,
        provider_subscription_id,
        current_period_start,
        current_period_end,
        canceled_at,
        created_at,
        updated_at
      FROM billing.donations
      WHERE id = $1
      LIMIT 1
      `,
      [id],
    );

    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async findByProviderSessionId(sessionId: string): Promise<Donation | null> {
    const query = await this.db.query(
      `
      SELECT
        id,
        user_id,
        donation_type,
        amount_minor,
        currency,
        status,
        provider,
        provider_session_id,
        provider_customer_id,
        provider_subscription_id,
        current_period_start,
        current_period_end,
        canceled_at,
        created_at,
        updated_at
      FROM billing.donations
      WHERE provider_session_id = $1
      LIMIT 1
      `,
      [sessionId],
    );

    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async list(query: ListDonationsQuery): Promise<{ rows: Donation[]; total: number }> {
    const params = new ParamBag();
    const where: string[] = ["is_archived = false"];

    if (query.userId?.trim()) where.push(`user_id = ${params.add(query.userId.trim())}`);
    if (query.donationType) where.push(`donation_type = ${params.add(query.donationType)}`);
    if (query.status) where.push(`status = ${params.add(query.status)}`);

    const fromSql = `
      FROM billing.donations
      WHERE ${where.join(" AND ")}
    `;

    const page = await paginateFrom<QueryResultRow>(this.db, fromSql, params.values, {
      select: `
        id,
        user_id,
        donation_type,
        amount_minor,
        currency,
        status,
        provider,
        provider_session_id,
        provider_customer_id,
        provider_subscription_id,
        current_period_start,
        current_period_end,
        canceled_at,
        created_at,
        updated_at
      `,
      orderMap: {
        createdAt: "created_at",
        updatedAt: "updated_at",
        amountMinor: "amount_minor",
      },
      orderBy: query.orderBy ?? "createdAt",
      orderDir: query.orderDir ?? "desc",
      limit: query.limit ?? 50,
      offset: query.offset ?? 0,
    });

    return {
      rows: page.rows.map((row) => this.mapRow(row)),
      total: page.total,
    };
  }
}
