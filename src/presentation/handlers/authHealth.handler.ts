import { ExpressHandler } from "../routes";

export const authHealthHandler: ExpressHandler = (_req, res) =>
  res.json({ ok: true, feature: "auth" });
