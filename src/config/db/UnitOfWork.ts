import { Queryable } from "./Queryable";

export interface UnitOfWork {
  /** get current transactional query context */
  db: Queryable;

  /** commit transaction */
  commit(): Promise<void>;

  /** rollback transaction */
  rollback(): Promise<void>;
}

export interface UnitOfWorkFactory {
  start(): Promise<UnitOfWork>;
}
