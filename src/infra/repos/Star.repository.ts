import { IStar } from "../../app/interfaces/Star.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { ErrorFactory } from "../../utils/errors/Error.map";
import {
  Star,
  StarName,
  StarType,
  StarClass,
  StarColor,
} from "../../domain/aggregates/Star";
import { Uuid } from "../../domain/aggregates/User";

export default class StarRepo implements IStar {
  constructor(private readonly db: Queryable) {}

  private mapRow(row: QueryResultRow): Star {
    return Star.rehydrate({
      id: row.id,
      systemId: row.system_id,
      name: row.name,
      starType: row.star_type as StarType,
      starClass: row.star_class as StarClass,
      surfaceTemperature: Number(row.surface_temperature),
      color: row.color as StarColor,
      relativeMass: Number(row.relative_mass),
      absoluteMass: Number(row.absolute_mass),
      relativeRadius: Number(row.relative_radius),
      absoluteRadius: Number(row.absolute_radius),
      gravity: Number(row.gravity),
      isMain: row.is_main,
      orbital: Number(row.orbital),
      orbitalStarter: Number(row.orbital_starter),
    });
  }

  private async findOneBy(
    whereSql: string,
    params: any[],
  ): Promise<Star | null> {
    const sql = `
      SELECT
        id,
        system_id,
        name,
        star_type,
        star_class,
        surface_temperature,
        color,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        is_main,
        orbital,
        orbital_starter
      FROM procedurals.stars
      ${whereSql}
      LIMIT 1
    `;
    const query = await this.db.query(sql, params);
    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async create(star: Star): Promise<Star> {
    const dto = star.toDB();
    await this.db.query(
      `
      INSERT INTO procedurals.stars (
        id,
        system_id,
        name,
        star_type,
        star_class,
        surface_temperature,
        color,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        is_main,
        orbital,
        orbital_starter
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15
      )
      `,
      [
        dto.id,
        dto.system_id,
        dto.name,
        dto.star_type,
        dto.star_class,
        dto.surface_temperature,
        dto.color,
        dto.relative_mass,
        dto.absolute_mass,
        dto.relative_radius,
        dto.absolute_radius,
        dto.gravity,
        dto.is_main,
        dto.orbital,
        dto.orbital_starter,
      ],
    );
    return star;
  }

  async findById(id: Uuid): Promise<Star | null> {
    return this.findOneBy("WHERE id = $1", [id.toString()]);
  }

  async findBySystem(systemId: Uuid): Promise<{ rows: Star[]; total: number }> {
    const query = await this.db.query(
      `
      SELECT
        id,
        system_id,
        name,
        star_type,
        star_class,
        surface_temperature,
        color,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        is_main,
        orbital,
        orbital_starter
      FROM procedurals.stars
      WHERE system_id = $1
      ORDER BY is_main DESC, relative_mass DESC
      `,
      [systemId.toString()],
    );
    const rows = query.rows.map((row) => this.mapRow(row));
    return { rows, total: rows.length };
  }

  async findByName(name: StarName): Promise<Star | null> {
    return this.findOneBy("WHERE name = $1", [name.toString()]);
  }

  async changeName(id: Uuid, name: StarName): Promise<Star> {
    const res = await this.db.query(
      `UPDATE procedurals.stars SET name = $1, updated_at = now_utc() WHERE id = $2`,
      [name.toString(), id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    const star = await this.findById(id);
    if (!star) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    return star;
  }

  async changeIsMain(id: Uuid, isMain: boolean): Promise<Star> {
    const res = await this.db.query(
      `UPDATE procedurals.stars SET is_main = $1, updated_at = now_utc() WHERE id = $2`,
      [isMain, id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    const star = await this.findById(id);
    if (!star) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    return star;
  }

  async changeOrbital(id: Uuid, orbital: number): Promise<Star> {
    const res = await this.db.query(
      `UPDATE procedurals.stars SET orbital = $1, updated_at = now_utc() WHERE id = $2`,
      [orbital, id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    const star = await this.findById(id);
    if (!star) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    return star;
  }

  async changeStarterOrbital(id: Uuid, starterOrbital: number): Promise<Star> {
    const res = await this.db.query(
      `UPDATE procedurals.stars SET orbital_starter = $1, updated_at = now_utc() WHERE id = $2`,
      [starterOrbital, id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    const star = await this.findById(id);
    if (!star) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
    return star;
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.db.query(
      `DELETE FROM procedurals.stars WHERE id = $1`,
      [id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "star",
        id: id.toString(),
      });
    }
  }
}
