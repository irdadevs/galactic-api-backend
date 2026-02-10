import { IAsteroid } from "../../app/interfaces/Asteroid.port";
import { Queryable, QueryResultRow } from "../../config/db/Queryable";
import { SharedErrorFactory } from "../../utils/errors/Error.map";
import {
  Asteroid,
  AsteroidName,
  AsteroidSize,
  AsteroidType,
} from "../../domain/aggregates/Asteroid";
import { Uuid } from "../../domain/aggregates/User";

export default class AsteroidRepo implements IAsteroid {
  constructor(private readonly db: Queryable) {}

  private mapRow(row: QueryResultRow): Asteroid {
    return Asteroid.rehydrate({
      id: row.id,
      systemId: row.system_id,
      name: row.name,
      type: row.type as AsteroidType,
      size: row.size as AsteroidSize,
      orbital: Number(row.orbital),
    });
  }

  private async findOneBy(
    whereSql: string,
    params: any[],
  ): Promise<Asteroid | null> {
    const sql = `
      SELECT id, system_id, name, type, size, orbital
      FROM procedurals.asteroids
      ${whereSql}
      LIMIT 1
    `;
    const query = await this.db.query(sql, params);
    if (query.rowCount === 0) return null;
    return this.mapRow(query.rows[0]);
  }

  async create(asteroid: Asteroid): Promise<Asteroid> {
    const dto = asteroid.toDB();
    await this.db.query(
      `
      INSERT INTO procedurals.asteroids (
        id, system_id, name, type, size, orbital
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        dto.id,
        dto.system_id,
        dto.name,
        dto.type,
        dto.size,
        dto.orbital,
      ],
    );
    return asteroid;
  }

  async findById(id: Uuid): Promise<Asteroid | null> {
    return this.findOneBy("WHERE id = $1", [id.toString()]);
  }

  async findBySystem(
    systemId: Uuid,
  ): Promise<{ rows: Asteroid[]; total: number }> {
    const query = await this.db.query(
      `
      SELECT id, system_id, name, type, size, orbital
      FROM procedurals.asteroids
      WHERE system_id = $1
      ORDER BY orbital ASC
      `,
      [systemId.toString()],
    );
    const rows = query.rows.map((row) => this.mapRow(row));
    return { rows, total: rows.length };
  }

  async findByName(name: AsteroidName): Promise<Asteroid | null> {
    return this.findOneBy("WHERE name = $1", [name.toString()]);
  }

  async changeName(id: Uuid, name: AsteroidName): Promise<Asteroid> {
    const res = await this.db.query(
      `UPDATE procedurals.asteroids SET name = $1, updated_at = now_utc() WHERE id = $2`,
      [name.toString(), id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    const asteroid = await this.findById(id);
    if (!asteroid) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    return asteroid;
  }

  async changeType(id: Uuid, type: AsteroidType): Promise<Asteroid> {
    const res = await this.db.query(
      `UPDATE procedurals.asteroids SET type = $1, updated_at = now_utc() WHERE id = $2`,
      [type, id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    const asteroid = await this.findById(id);
    if (!asteroid) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    return asteroid;
  }

  async changeSize(id: Uuid, size: AsteroidSize): Promise<Asteroid> {
    const res = await this.db.query(
      `UPDATE procedurals.asteroids SET size = $1, updated_at = now_utc() WHERE id = $2`,
      [size, id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    const asteroid = await this.findById(id);
    if (!asteroid) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    return asteroid;
  }

  async changeOrbital(id: Uuid, orbital: number): Promise<Asteroid> {
    const res = await this.db.query(
      `UPDATE procedurals.asteroids SET orbital = $1, updated_at = now_utc() WHERE id = $2`,
      [orbital, id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    const asteroid = await this.findById(id);
    if (!asteroid) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
    return asteroid;
  }

  async delete(id: Uuid): Promise<void> {
    const res = await this.db.query(
      `DELETE FROM procedurals.asteroids WHERE id = $1`,
      [id.toString()],
    );
    if (res.rowCount === 0) {
      throw SharedErrorFactory.infra("SHARED.NOT_FOUND", {
        sourceType: "asteroid",
        id: id.toString(),
      });
    }
  }
}
