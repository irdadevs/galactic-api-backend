import { randomInt } from "crypto";

export function genRandomCode(long: number = 8): string {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";

  for (let i = 0; i < long; i++) {
    result += chars[randomInt(0, chars.length)];
  }

  return result;
}
