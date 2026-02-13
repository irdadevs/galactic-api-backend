import { Response } from "express";
import { BaseError } from "./Errors.base";

const DEFAULT_ERROR = {
  error: "INTERNAL_ERROR",
  message: "Something went wrong.",
};

export default function errorHandler(err: unknown, res: Response) {
  if (err instanceof BaseError) {
    const status = err.httpCode ?? 500;

    if (err.isPublic) {
      return res.status(status).json({
        ok: false,
        error: err.code,
        message: err.message,
      });
    }

    return res.status(status).json({
      ok: false,
      ...DEFAULT_ERROR,
    });
  }

  return res.status(500).json({
    ok: false,
    ...DEFAULT_ERROR,
  });
}
