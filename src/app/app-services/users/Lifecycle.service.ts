import { Uuid } from "../../../domain/aggregates/User";

export class LifecycleService {
    constructor(
        private readonly softDeleteUser: SoftDeleteUser,
        private readonly restoreUser: RestoreUser
    )

    softDelete(id: Uuid) {
        return this.softDelete.execute(id);
    }

    restore(id: Uuid) {
        return this.restore.execute(id);
    }
}