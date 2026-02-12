import { createErrorFactory, ErrorDef } from "./Errors.factory";

export const SharedErrorMap = {
  INVALID_UUID_KEY: {
    code: "SHARED.INVALID_UUID_KEY",
    httpCode: 422,
    retryable: false,
  },
  INVALID_SKU: {
    code: "SHARED.INVALID_SKU",
    httpCode: 422,
    retryable: false,
  },
  INVALID_LOCAL_TIME: {
    code: "SHARED.INVALID_LOCAL_TIME",
    httpCode: 422,
    retryable: false,
  },
  OUT_OF_RANGE: {
    code: "SHARED.OUT_OF_RANGE",
    httpCode: 422,
    retryable: false,
  },
  OPERATION_NOT_ALLOWED_ON_ARCHIVED: {
    code: "SHARED.OPERATION_NOT_ALLOWED_ON_ARCHIVED",
    httpCode: 422,
    retryable: false,
  },
  INVALID_FIELD: {
    code: "SHARED.INVALID_FIELD",
    httpCode: 422,
    retryable: false,
  },
  NOT_FOUND: {
    code: "SHARED.NOT_FOUND",
    httpCode: 404,
    retryable: false,
  },
  INVALID_COUNTRY_CODE: {
    code: "SHARED.INVALID_COUNTRY_CODE",
    httpCode: 422,
    retryable: false,
  },
  ACTIVE_DELETED_AGGREGATOR: {
    code: "SHARED.ACTIVE_DELETED_AGGREGATOR",
    httpCode: 403,
    retryable: false,
  },
  INVALIDISO4217: {
    code: "SHARED.CURRENCIES.INVALIDISO4217",
    httpCode: 422,
    retryable: false,
  },
  INVALID_PROVIDER_TOKEN: {
    code: "SHARED.DI.INVALID_PROVIDER_TOKEN",
    httpCode: 500,
    retryable: false,
  },
  INVALID_PROVIDER: {
    code: "SHARED.DI.INVALID_PROVIDER",
    httpCode: 500,
    retryable: false,
  },
  DEPENDENCY_NOT_FOUND: {
    code: "SHARED.DI.DEPENDENCY_NOT_FOUND",
    httpCode: 500,
    retryable: false,
  },
  JOB_ALREADY_SCHEDULED: {
    code: "SHARED.SCHEDULERS.JOB_ALREADY_SCHEDULED",
    httpCode: 500,
    retryable: false,
  },
  INVALID_CRON_EXPR: {
    code: "SHARED.SCHEDULERS.INVALID_CRON_EXPR",
    httpCode: 500,
    retryable: false,
  },
  DATABASE_CONNECTION: {
    code: "SHARED.DATABASE_CONNECTION",
    httpCode: 500,
    retryable: false,
  },
  NOT_DETECTED: {
    code: "SHARED.DI.NOT_DETECTED",
    httpCode: 500,
    retryable: false,
  },
  INVALID_CONTAINER: {
    code: "SHARED.DI.INVALID_CONTAINER",
    httpCode: 500,
    retryable: false,
  },
  DB_POOL_NOT_AVAILABLE: {
    code: "SHARED.DB_POOL_NOT_AVAILABLE",
    httpCode: 500,
    retryable: false,
  },
  TRANSACTION_FAILED: {
    code: "SHARED.TRANSACTION_FAILED",
    httpCode: 500,
    retryable: false,
  },
  ORDER_MAP_EMPTY: {
    code: "SHARED.ORDER_MAP_EMPTY",
    httpCode: 400,
    retryable: false,
  },
  INVALID_SECRET: {
    code: "SHARED.INVALID_SECRET",
    httpCode: 400,
    retryable: false,
  },
  INVALID_CREDENTIALS: {
    code: "SHARED.INVALID_CREDENTIALS",
    httpCode: 400,
    retryable: false,
  },
  REFRESH_REUSED: {
    code: "AUTH.REFRESH_REUSED",
    httpCode: 400,
    retryable: false,
  },
  INVALID_REFRESH: {
    code: "AUTH.INVALID_REFRESH",
    httpCode: 400,
    retryable: false,
  },
  SESSION_EXPIRED: {
    code: "AUTH.SESSION_EXPIRED",
    httpCode: 400,
    retryable: false,
  },
  SESSION_INVALID: {
    code: "AUTH.SESSION_INVALID",
    httpCode: 400,
    retryable: false,
  },
  EMAIL_EXIST: {
    code: "SHARED.EMAIL_EXIST",
    httpCode: 400,
    retryable: false,
  },
  USERNAME_EXIST: {
    code: "SHARED.USERNAME_EXIST",
    httpCode: 400,
    retryable: false,
  },
  SOFT_DELETE_FAILED: {
    code: "AUTH.SOFT_DELETE_FAILED",
    httpCode: 400,
    retryable: false,
  },
  RESTORE_FAILED: {
    code: "AUTH.RESTORE_FAILED",
    httpCode: 400,
    retryable: false,
  },
} as const satisfies Record<string, ErrorDef>;

export type SharedError = (typeof SharedErrorMap)[keyof typeof SharedErrorMap];
export type SharedErrorCode = SharedError["code"];

export const SharedErrorMessages: Record<SharedErrorCode, string> = {
  [SharedErrorMap.INVALID_SKU.code]: "SKU is not valid. SKU: ${sku}.",
  [SharedErrorMap.INVALID_LOCAL_TIME.code]:
    "Invalid local time. LocalTime: {$localtime}.",
  [SharedErrorMap.INVALID_UUID_KEY.code]:
    "UUID key not valid. UUID key: ${uuid}.",
  [SharedErrorMap.OUT_OF_RANGE.code]:
    "Value out of range. Field name: ${field}, min: ${min}, max: ${max}.",
  [SharedErrorMap.OPERATION_NOT_ALLOWED_ON_ARCHIVED.code]:
    "Operation is not valid when entity is archived. Entity ID: ${id}.",
  [SharedErrorMap.INVALID_FIELD.code]: "Invalid field. Field name: ${field}.",
  [SharedErrorMap.NOT_FOUND.code]:
    "Source not found. Source type: ${sourceType}, source id: ${id}.",
  [SharedErrorMap.INVALID_COUNTRY_CODE.code]:
    "Country code is not valid. Code: ${countryCode}.",
  [SharedErrorMap.ACTIVE_DELETED_AGGREGATOR.code]:
    "Active deleted aggregator. Entity: {$entity} with id: ${id}.",
  [SharedErrorMap.INVALIDISO4217.code]:
    "Invalid currency code. Code. {$currencyCode}.",
  [SharedErrorMap.INVALID_PROVIDER_TOKEN.code]:
    "Invalid provider token. Token: {$token}.",
  [SharedErrorMap.INVALID_PROVIDER.code]: "DI: Invalid provider.",
  [SharedErrorMap.DEPENDENCY_NOT_FOUND.code]:
    "Dependency not found. Dependency: {$dep}.",
  [SharedErrorMap.JOB_ALREADY_SCHEDULED.code]:
    "Job already scheduled. Name: {$name}.",
  [SharedErrorMap.INVALID_CRON_EXPR.code]:
    "Invalid cron expression. Expr: {$expr}.",
  [SharedErrorMap.DATABASE_CONNECTION.code]:
    "Database connection max attempts reached.",
  [SharedErrorMap.NOT_DETECTED.code]:
    "DI token not registered: Token: ${token}",
  [SharedErrorMap.INVALID_CONTAINER.code]:
    "containerTree needs a SimpleContainer implementation.",
  [SharedErrorMap.DB_POOL_NOT_AVAILABLE.code]:
    "Database Pool not available for Unit Of Work. Null returned.",
  [SharedErrorMap.TRANSACTION_FAILED.code]:
    "Atomic database transaction failed. Cause: \n${cause}",
  [SharedErrorMap.ORDER_MAP_EMPTY.code]: "Order map need at least one entry.",
  [SharedErrorMap.INVALID_SECRET.code]: "Invalid JWT secret.",
  [SharedErrorMap.INVALID_CREDENTIALS.code]: "Invalid login credentials.",
  [SharedErrorMap.INVALID_REFRESH.code]: "Invalid session refresh.",
  [SharedErrorMap.SESSION_INVALID.code]: "Invalid session.",
  [SharedErrorMap.SESSION_EXPIRED.code]: "Expired session.",
  [SharedErrorMap.REFRESH_REUSED.code]: "Session refresh token reused.",
  [SharedErrorMap.EMAIL_EXIST.code]: "Email already exist. Email: ${newEmail}.",
  [SharedErrorMap.USERNAME_EXIST.code]:
    "Username already exist. Username: ${newUsername}.",
  [SharedErrorMap.SOFT_DELETE_FAILED.code]:
    "User soft delete failled. Id: ${id}, Cause: \n${cause}",
  [SharedErrorMap.RESTORE_FAILED.code]:
    "User soft delete failled. Id: ${id}, Cause: \n${cause}",
};

export const SharedErrorFactory = createErrorFactory(
  SharedErrorMap,
  SharedErrorMessages,
);

export const DomainErrorMap = {
  INVALID_USER_ID: {
    code: "DOMAIN.INVALID_USER_ID",
    httpCode: 400,
    retryable: false,
  },
  INVALID_USER_EMAIL: {
    code: "DOMAIN.INVALID_USER_EMAIL",
    httpCode: 400,
    retryable: false,
  },
  INVALID_USER_PASSWORD: {
    code: "DOMAIN.INVALID_USER_PASSWORD",
    httpCode: 400,
    retryable: false,
  },
  INVALID_USER_USERNAME: {
    code: "DOMAIN.INVALID_USER_USERNAME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_USER_ROLE: {
    code: "DOMAIN.INVALID_USER_ROLE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_GALAXY_NAME: {
    code: "DOMAIN.INVALID_GALAXY_NAME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_GALAXY_SHAPE: {
    code: "DOMAIN.INVALID_GALAXY_SHAPE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_SYSTEM_NAME: {
    code: "DOMAIN.INVALID_SYSTEM_NAME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_SYSTEM_POSITION: {
    code: "DOMAIN.INVALID_SYSTEM_POSITION",
    httpCode: 400,
    retryable: false,
  },
  INVALID_STAR_TYPE: {
    code: "DOMAIN.INVALID_STAR_TYPE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_STAR_CLASS: {
    code: "DOMAIN.INVALID_STAR_CLASS",
    httpCode: 400,
    retryable: false,
  },
  INVALID_STAR_COLOR: {
    code: "DOMAIN.INVALID_STAR_COLOR",
    httpCode: 400,
    retryable: false,
  },
  INVALID_STAR_VALUE: {
    code: "DOMAIN.INVALID_STAR_VALUE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_PLANET_NAME: {
    code: "DOMAIN.INVALID_PLANET_NAME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_PLANET_TYPE: {
    code: "DOMAIN.INVALID_PLANET_TYPE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_PLANET_SIZE: {
    code: "DOMAIN.INVALID_PLANET_SIZE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_PLANET_BIOME: {
    code: "DOMAIN.INVALID_PLANET_BIOME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_PLANET_ORBITAL: {
    code: "DOMAIN.INVALID_PLANET_ORBITAL",
    httpCode: 400,
    retryable: false,
  },
  INVALID_PLANET_VALUE: {
    code: "DOMAIN.INVALID_PLANET_VALUE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_ASTEROID_TYPE: {
    code: "DOMAIN.INVALID_ASTEROID_TYPE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_ASTEROID_NAME: {
    code: "DOMAIN.INVALID_ASTEROID_NAME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_ASTEROID_SIZE: {
    code: "DOMAIN.INVALID_ASTEROID_SIZE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_ASTEROID_ORBITAL: {
    code: "DOMAIN.INVALID_ASTEROID_ORBITAL",
    httpCode: 400,
    retryable: false,
  },
  INVALID_MOON_NAME: {
    code: "DOMAIN.INVALID_MOON_NAME",
    httpCode: 400,
    retryable: false,
  },
  INVALID_MOON_SIZE: {
    code: "DOMAIN.INVALID_MOON_SIZE",
    httpCode: 400,
    retryable: false,
  },
  INVALID_MOON_ORBITAL: {
    code: "DOMAIN.INVALID_MOON_ORBITAL",
    httpCode: 400,
    retryable: false,
  },
  INVALID_MOON_VALUE: {
    code: "DOMAIN.INVALID_MOON_VALUE",
    httpCode: 400,
    retryable: false,
  },
} as const satisfies Record<string, ErrorDef>;

export type DomainError = (typeof DomainErrorMap)[keyof typeof DomainErrorMap];
export type DomainErrorCode = DomainError["code"];

export const DomainErrorMessages: Record<DomainErrorCode, string> = {
  [DomainErrorMap.INVALID_USER_ID.code]: "Invalid user UUID. Id: ${id}.",
  [DomainErrorMap.INVALID_USER_EMAIL.code]:
    "Invalid user email. Email: ${email}.",
  [DomainErrorMap.INVALID_USER_PASSWORD.code]:
    "Invalid user password hash. Hash: ${password}.",
  [DomainErrorMap.INVALID_USER_USERNAME.code]:
    "Invalid username. Username: ${username}.",
  [DomainErrorMap.INVALID_USER_ROLE.code]: "Invalid user role. Role: ${role}.",
  [DomainErrorMap.INVALID_GALAXY_NAME.code]:
    "Invalid galaxy name. Name: ${name}.",
  [DomainErrorMap.INVALID_GALAXY_SHAPE.code]:
    "Invalid galaxy shape. Shape: ${shape}.",
  [DomainErrorMap.INVALID_SYSTEM_NAME.code]:
    "Invalid system name. Name: ${name}.",
  [DomainErrorMap.INVALID_SYSTEM_POSITION.code]:
    "Invalid system position. Position: ${position}.",
  [DomainErrorMap.INVALID_STAR_TYPE.code]: "Invalid star type. Type: ${type}.",
  [DomainErrorMap.INVALID_STAR_CLASS.code]:
    "Invalid star class. Class: ${class}.",
  [DomainErrorMap.INVALID_STAR_COLOR.code]:
    "Invalid star color. Color: ${color}.",
  [DomainErrorMap.INVALID_STAR_VALUE.code]:
    "Invalid star value. Field: ${field}.",
  [DomainErrorMap.INVALID_PLANET_NAME.code]:
    "Invalid planet name. Name: ${name}.",
  [DomainErrorMap.INVALID_PLANET_TYPE.code]:
    "Invalid planet type. Type: ${type}.",
  [DomainErrorMap.INVALID_PLANET_SIZE.code]:
    "Invalid planet size. Size: ${size}.",
  [DomainErrorMap.INVALID_PLANET_BIOME.code]:
    "Invalid planet biome. Biome: ${biome}.",
  [DomainErrorMap.INVALID_PLANET_ORBITAL.code]:
    "Invalid planet orbital. Orbital: ${orbital}.",
  [DomainErrorMap.INVALID_PLANET_VALUE.code]:
    "Invalid planet value. Field: ${field}.",
  [DomainErrorMap.INVALID_ASTEROID_TYPE.code]:
    "Invalid asteroid type. Type: ${type}.",
  [DomainErrorMap.INVALID_ASTEROID_NAME.code]:
    "Invalid asteroid name. Name: ${name}.",
  [DomainErrorMap.INVALID_ASTEROID_SIZE.code]:
    "Invalid asteroid size. Size: ${size}.",
  [DomainErrorMap.INVALID_ASTEROID_ORBITAL.code]:
    "Invalid asteroid orbital. Orbital: ${orbital}.",
  [DomainErrorMap.INVALID_MOON_NAME.code]: "Invalid moon name. Name: ${name}.",
  [DomainErrorMap.INVALID_MOON_SIZE.code]: "Invalid moon size. Size: ${size}.",
  [DomainErrorMap.INVALID_MOON_ORBITAL.code]:
    "Invalid moon orbital. Orbital: ${orbital}.",
  [DomainErrorMap.INVALID_MOON_VALUE.code]:
    "Invalid moon value. Field: ${field}.",
};

export const DomainErrorFactory = createErrorFactory(
  DomainErrorMap,
  DomainErrorMessages,
);
