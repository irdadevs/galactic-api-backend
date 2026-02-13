import { Response } from "express";

export default function invalidBody(res: Response, details: unknown) {
  return res.status(400).json({
    ok: false,
    error: "INVALID_BODY",
    details,
  });
}
