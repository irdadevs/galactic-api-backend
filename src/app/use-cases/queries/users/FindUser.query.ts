import {
  Email,
  User,
  Username,
  Uuid,
} from "../../../../domain/aggregates/User";
import { IUser } from "../../../interfaces/User.port";

export default class FindUser {
  constructor(private readonly repo: IUser) {}

  async byId(id: Uuid): Promise<User | null> {
    return this.repo.findById(id);
  }

  async byEmail(email: Email): Promise<User | null> {
    return this.repo.findByEmail(email);
  }

  async byUsername(username: Username): Promise<User | null> {
    return this.repo.findByUsername(username);
  }
}
