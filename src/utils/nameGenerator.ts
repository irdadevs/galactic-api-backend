import { Dice } from "./Dice.class";
import { nameSyllables } from "./constants";

const pickFrom = <T>(list: readonly T[]): T => {
  const index = Dice.roll(list.length, true);
  return list[index];
};

const rollSyllableCount = (): number => {
  const count = Dice.roll(4, true);
  return count <= 0 ? 1 : count;
};

const rollSpecialThreshold = (): boolean => Dice.roll(100, true) <= 5;

const formatSpecialName = (prefix: string, value: number): string => {
  const trimmed = prefix.endsWith("-") ? prefix.slice(0, -1) : prefix;
  return `${trimmed}-${String(value).padStart(3, "0")}`;
};

export const generateSyllableName = (): string => {
  const count = rollSyllableCount();
  let name = "";
  for (let i = 0; i < count; i += 1) {
    name += pickFrom(nameSyllables.syllables);
  }
  return name;
};

export const generateSpecialName = (): string => {
  const prefix = pickFrom(nameSyllables.specials);
  const value = Dice.roll(999, true) + 1;
  return formatSpecialName(prefix, value);
};

export const generateCelestialName = (): string =>
  rollSpecialThreshold() ? generateSpecialName() : generateSyllableName();

export const isSpecialName = (value: string): boolean => {
  const match = value.match(/^([A-Z-]+)-(\d{3})$/);
  if (!match) return false;

  const prefix = `${match[1]}-`;
  const number = Number(match[2]);
  const hasPrefix = nameSyllables.specials.includes(prefix);

  return hasPrefix && number >= 1 && number <= 999;
};
