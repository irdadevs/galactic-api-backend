import {
  DomainError,
  ApplicationError,
  InfrastructureError,
  PresentationError,
} from "./Errors.base";

/* ---------- Shapes ---------- */
export type ErrorDef = { code: string; httpCode: number; public: boolean };
export type ErrorMap = Record<string, ErrorDef>;

/** Extract union of codes from any ErrorMap (robust way). */
export type ErrorCode<M extends ErrorMap> = M[keyof M] extends {
  code: infer C extends string;
}
  ? C
  : never;

/* ---------- Utils ---------- */
function formatMessage(tpl: string, meta?: Record<string, unknown>) {
  if (!tpl || !meta) return tpl;
  return tpl.replace(/\$\{(\w+)\}/g, (_: string, k: string) =>
    String(meta[k] ?? ""),
  );
}

/* ---------- Factory ---------- */
export function createErrorFactory<M extends ErrorMap>(
  map: M,
  messages: Record<ErrorCode<M>, string>,
) {
  const defs = Object.values(map) as Array<M[keyof M] & ErrorDef>;

  function resolve(code: ErrorCode<M>) {
    const def = defs.find((d) => d.code === code);
    if (!def) throw new Error(`Unknown error code: ${code}`);
    const messageTpl = messages[code] ?? code;
    return { def, messageTpl };
  }

  return {
    domain(
      code: ErrorCode<M>,
      meta?: Record<string, unknown>,
      cause?: unknown,
    ) {
      const { def, messageTpl } = resolve(code);
      return new DomainError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.httpCode,
        def.public,
        "Domain Layer",
      );
    },
    app(code: ErrorCode<M>, meta?: Record<string, unknown>, cause?: unknown) {
      const { def, messageTpl } = resolve(code);
      return new ApplicationError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.httpCode,
        def.public,
        "Application Layer",
      );
    },
    infra(code: ErrorCode<M>, meta?: Record<string, unknown>, cause?: unknown) {
      const { def, messageTpl } = resolve(code);
      return new InfrastructureError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.httpCode,
        def.public,
        "Infrastructure Layer",
      );
    },
    presentation(
      code: ErrorCode<M>,
      meta?: Record<string, unknown>,
      cause?: unknown,
    ) {
      const { def, messageTpl } = resolve(code);
      return new PresentationError(
        def.code,
        formatMessage(messageTpl, meta),
        meta,
        cause,
        def.httpCode,
        def.public,
        "Presentation Layer",
      );
    },
  };
}
