import { z } from "zod";

export const ChangePlanetBiomeDTO = z.object({
  biome: z.enum([
    "temperate",
    "desert",
    "ocean",
    "ice",
    "toxic",
    "radioactive",
    "crystal",
  ]),
});

export type ChangePlanetBiomeDTO = z.infer<typeof ChangePlanetBiomeDTO>;
