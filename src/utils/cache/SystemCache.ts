import { System, SystemPositionProps } from "../../domain/aggregates/System";
import { TTL_MAP } from "../TTL.map";

export type CachedSystem = {
  id: string;
  galaxyId: string;
  name: string;
  position: SystemPositionProps;
};

export type CachedListSystemsByGalaxyResult = {
  rows: CachedSystem[];
  total: number;
};

export const SYSTEM_CACHE_POLICY = {
  systemTtl: TTL_MAP.threeDays,
  systemsListTtl: TTL_MAP.oneDay,
} as const;

const SYSTEMS_PREFIX = "systems";
const SYSTEMS_BY_NAME_PREFIX = `${SYSTEMS_PREFIX}:by-name`;
const SYSTEMS_BY_POSITION_PREFIX = `${SYSTEMS_PREFIX}:by-position`;
const SYSTEMS_LIST_GALAXY_PREFIX = `${SYSTEMS_PREFIX}:list-by-galaxy`;

export const SystemCacheKeys = {
  byId: (id: string): string => `${SYSTEMS_PREFIX}:by-id:${id}`,
  byName: (name: string): string =>
    `${SYSTEMS_BY_NAME_PREFIX}:${name.trim().toLowerCase()}`,
  byNamePrefix: (): string => SYSTEMS_BY_NAME_PREFIX,
  byPosition: (position: SystemPositionProps): string =>
    `${SYSTEMS_BY_POSITION_PREFIX}:${position.x}:${position.y}:${position.z}`,
  byPositionPrefix: (): string => SYSTEMS_BY_POSITION_PREFIX,
  listByGalaxy: (galaxyId: string): string =>
    `${SYSTEMS_LIST_GALAXY_PREFIX}:${galaxyId}`,
  listByGalaxyPrefix: (): string => SYSTEMS_LIST_GALAXY_PREFIX,
};

export function serializeSystemForCache(system: System): CachedSystem {
  return system.toJSON();
}

export function deserializeSystemFromCache(cached: CachedSystem): System {
  return System.rehydrate({
    id: cached.id,
    galaxyId: cached.galaxyId,
    name: cached.name,
    position: cached.position,
  });
}
