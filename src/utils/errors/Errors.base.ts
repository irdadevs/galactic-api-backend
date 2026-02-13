export type ErrorMeta = Record<string, unknown>;

export class BaseError extends Error {
  constructor(
    public readonly code: string, // machine code: "core.email.invalid"
    message?: string, // developer-oriented message
    public readonly meta?: ErrorMeta, // structured context (email, limits, etc.)
    public readonly cause?: unknown, // underlying error
    public readonly httpCode?: number, // 404, 422, 500...
    public readonly isPublic?: boolean, // whether to expose message to the client
    public readonly retryable?: boolean, // just for retries attemps at controller layers
    public readonly layer?: string // just for retries attemps at controller layers
  ) {
    super(message ?? code);
    this.name = this.constructor.name;
  }
}

/** Thrown from *domain layer* (entities, VOs, domain services). */
export class DomainError extends BaseError {}

/** Thrown from *application layer* (use cases, orchestration, policies). */
export class ApplicationError extends BaseError {}

/** Thrown from *infrastructure layer* (db, io, adapters). */
export class InfrastructureError extends BaseError {}

/** Thrown from *presentation layer* (controllers, API routes.). */
export class PresentationError extends BaseError {}

/** Thrown from *platform layer* (Module intercon, integrity.). */
export class PlatformError extends BaseError {}
