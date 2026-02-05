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
    httpCode: 500,
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
};

export const SharedErrorFactory = createErrorFactory(
  SharedErrorMap,
  SharedErrorMessages,
);
