import { IPlanet } from "../../app/interfaces/Planet.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { ErrorFactory } from "../../utils/errors/Error.map";
import {
  Planet,
  PlanetBiome,
  PlanetName,
  PlanetSize,
  PlanetType,
} from "../../domain/aggregates/Planet";
import { Uuid } from "../../domain/aggregates/User";

export default class PlanetRepo implements IPlanet {
  constructor(private readonly db: Queryable) {}

  private mapRow(row: QueryResultRow): Planet {
    return Planet.rehydrate({
      id: row.id,
      systemId: row.system_id,
      name: row.name,
      type: row.type as PlanetType,
      size: row.size as PlanetSize,
      orbital: Number(row.orbital),
      biome: row.biome as PlanetBiome,
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
  ): Promise<Planet | null> {
    const sql = `
      SELECT
        id,
        system_id,
        name,
        type,
        size,
        orbital,
        biome,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        temperature
      FROM procedurals.planets
      ${whereSql}
      LIMIT 1
    `;
    const query = await this.db.query(sql, params);
    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async create(planet: Planet): Promise<Planet> {
    const dto = planet.toDB();
    await this.db.query(
      `
      INSERT INTO procedurals.planets (
        id,
        system_id,
        name,
        type,
        size,
        orbital,
        biome,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        temperature
      )
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
      )
      `,
      [
        dto.id,
        dto.system_id,
        dto.name,
        dto.type,
        dto.size,
        dto.orbital,
        dto.biome,
        dto.relative_mass,
        dto.absolute_mass,
        dto.relative_radius,
        dto.absolute_radius,
        dto.gravity,
        dto.temperature,
      ],
    );
    return planet;
  }

  async findById(id: Uuid): Promise<Planet | null> {
    return this.findOneBy("WHERE id = $1", [id.toString()]);
  }

  async findBySystem(
    systemId: Uuid,
  ): Promise<{ rows: Planet[]; total: number }> {
    const query = await this.db.query(
      `
      SELECT
        id,
        system_id,
        name,
        type,
        size,
        orbital,
        biome,
        relative_mass,
        absolute_mass,
        relative_radius,
        absolute_radius,
        gravity,
        temperature
      FROM procedurals.planets
      WHERE system_id = $1
      ORDER BY orbital ASC
      `,
      [systemId.toString()],
    );
    const rows = query.rows.map((row) => this.mapRow(row));
    return { rows, total: rows.length };
  }

  async findByName(name: PlanetName): Promise<Planet | null> {
    return this.findOneBy("WHERE name = $1", [name.toString()]);
  }

  async changeName(id: Uuid, name: PlanetName): Promise<Planet> {
    const res = await this.db.query(
      `UPDATE procedurals.planets SET name = $1, updated_at = now_utc() WHERE id = $2`,
      [name.toString(), id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
    const planet = await this.findById(id);
    if (!planet) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
    return planet;
  }

  async changeOrbital(id: Uuid, orbital: number): Promise<Planet> {
    const res = await this.db.query(
      `UPDATE procedurals.planets SET orbital = $1, updated_at = now_utc() WHERE id = $2`,
      [orbital, id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
    const planet = await this.findById(id);
    if (!planet) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
    return planet;
  }

  async changeBiome(id: Uuid, biome: PlanetBiome): Promise<Planet> {
    const res = await this.db.query(
      `UPDATE procedurals.planets SET biome = $1, updated_at = now_utc() WHERE id = $2`,
      [biome, id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
    const planet = await this.findById(id);
    if (!planet) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
    return planet;
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.db.query(
      `DELETE FROM procedurals.planets WHERE id = $1`,
      [id.toString()],
    );
    if (res.rowCount === 0) {
      throw ErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "planet",
        id: id.toString(),
      });
    }
  }
}
