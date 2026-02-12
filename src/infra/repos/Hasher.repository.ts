import bcrypt from "bcrypt";
import type { IHasher } from "../../app/interfaces/Hasher.port";

export class HasherRepo implements IHasher {
  constructor(private readonly rounds = 10) {}
  async hash(raw: string) {
    return bcrypt.hash(raw, this.rounds);
  }
  async compare(raw: string, hashed: string) {
    return bcrypt.compare(raw, hashed);
  }
}
