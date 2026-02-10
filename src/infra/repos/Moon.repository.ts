import { IMoon } from "../../app/interfaces/Moon.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { SharedErrorFactory } from "../../utils/errors/Error.map";
import { Moon, MoonName, MoonSize } from "../../domain/aggregates/Moon";
import { Uuid } from "../../domain/aggregates/User";

export default class MoonRepo implements IMoon {
  constructor(private readonly db: Queryable) {}

  private mapRow(row: QueryResultRow): Moon {
    return Moon.rehydrate({
      id: row.id,
      planetId: row.planet_id,
      name: row.name,
      size: row.size as MoonSize,
      orbital: Number(row.orbital),
      relativeMass: Number(row.relative_mass),
      absoluteMass: Number(row.absolute_mass),
      relativeRadius: Number(row.relative_radius),
      absoluteRadius: Number(row.absolute_radius),
      gravity: Number(row.gravity),
      temperature: Number(row.temperature),
    });
  }

  private async findOneBy(
    whereSql: string,
    params: any[],
  ): Promise<Moon | null> {
    const sql = `
      SELECT
        id,
        planet_id,
        name,
        size,
        orbital,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        temperature
      FROM procedurals.moons
      ${whereSql}
      LIMIT 1
    `;
    const query = await this.db.query(sql, params);
    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async create(moon: Moon): Promise<Moon> {
    const dto = moon.toDB();
    await this.db.query(
      `
      INSERT INTO procedurals.moons (
        id,
        planet_id,
        name,
        size,
        orbital,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        temperature
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
      )
      `,
      [
        dto.id,
        dto.planet_id,
        dto.name,
        dto.size,
        dto.orbital,
        dto.relative_mass,
        dto.absolute_mass,
        dto.relative_radius,
        dto.absolute_radius,
        dto.gravity,
        dto.temperature,
      ],
    );
    return moon;
  }

  async findById(id: Uuid): Promise<Moon | null> {
    return this.findOneBy("WHERE id = $1", [id.toString()]);
  }

  async findByPlanet(
    planetId: Uuid,
  ): Promise<{ rows: Moon[]; total: number }> {
    const query = await this.db.query(
      `
      SELECT
        id,
        planet_id,
        name,
        size,
        orbital,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        temperature
      FROM procedurals.moons
      WHERE planet_id = $1
      ORDER BY orbital ASC
      `,
      [planetId.toString()],
    );
    const rows = query.rows.map((row) => this.mapRow(row));
    return { rows, total: rows.length };
  }

  async findByName(name: MoonName): Promise<Moon | null> {
    return this.findOneBy("WHERE name = $1", [name.toString()]);
  }

  async changeName(id: Uuid, name: MoonName): Promise<Moon> {
    const res = await this.db.query(
      `UPDATE procedurals.moons SET name = $1, updated_at = now_utc() WHERE id = $2`,
      [name.toString(), id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
    const moon = await this.findById(id);
    if (!moon) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
    return moon;
  }

  async changeSize(id: Uuid, size: MoonSize): Promise<Moon> {
    const res = await this.db.query(
      `UPDATE procedurals.moons SET size = $1, updated_at = now_utc() WHERE id = $2`,
      [size, id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
    const moon = await this.findById(id);
    if (!moon) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
    return moon;
  }

  async changeOrbital(id: Uuid, orbital: number): Promise<Moon> {
    const res = await this.db.query(
      `UPDATE procedurals.moons SET orbital = $1, updated_at = now_utc() WHERE id = $2`,
      [orbital, id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
    const moon = await this.findById(id);
    if (!moon) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
    return moon;
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.db.query(
      `DELETE FROM procedurals.moons WHERE id = $1`,
      [id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "moon",
        id: id.toString(),
      });
    }
  }
}
