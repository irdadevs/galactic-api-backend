import { Moon } from "../../domain/aggregates/Moon";

const validInput = {
  planetId: "11111111-1111-4111-8111-111111111111",
  name: "Luna",
  orbital: 1,
};

const assertDomainErrorCode = (fn: () => void, code: string) => {
  let thrown: unknown;
  try {
    fn();
  } catch (err) {
    thrown = err;
  }

  expect(thrown).toBeDefined();
  const error = thrown as { code?: string };
  expect(error.code).toBe(code);
};

describe("Moon aggregate", () => {
  it("creates a moon with defaults", () => {
    const moon = Moon.create(validInput);

    expect(moon.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(moon.planetId).toBe(validInput.planetId);
    expect(moon.name).toBe(validInput.name);
    expect(moon.orbital).toBe(validInput.orbital);
  });

  it("throws on invalid name", () => {
    assertDomainErrorCode(
      () =>
        Moon.create({
          ...validInput,
          name: "a",
        }),
      "DOMAIN.INVALID_MOON_NAME",
    );
  });

  it("throws on invalid size", () => {
    assertDomainErrorCode(
      () =>
        Moon.create({
          ...validInput,
          size: "mega" as "medium",
        }),
      "DOMAIN.INVALID_MOON_SIZE",
    );
  });

  it("throws on invalid orbital", () => {
    assertDomainErrorCode(
      () =>
        Moon.create({
          ...validInput,
          orbital: 0,
        }),
      "DOMAIN.INVALID_MOON_ORBITAL",
    );
  });

  it("renames when different", () => {
    const moon = Moon.create(validInput);

    moon.rename("Selene");

    expect(moon.name).toBe("Selene");
  });

  it("changes orbital when different", () => {
    const moon = Moon.create(validInput);

    moon.changeOrbital(2);

    expect(moon.orbital).toBe(2);
  });

  it("rehydrates from persistence data", () => {
    const moon = Moon.rehydrate({
      id: "22222222-2222-4222-8222-222222222222",
      planetId: "33333333-3333-4333-8333-333333333333",
      name: "Europa",
      size: "medium",
      orbital: 1,
      relativeMass: 1,
      absoluteMass: 7.342e22,
      relativeRadius: 1,
      absoluteRadius: 1.7374e6,
      gravity: 1.62,
      temperature: 220,
    });

    expect(moon.id).toBe("22222222-2222-4222-8222-222222222222");
    expect(moon.planetId).toBe("33333333-3333-4333-8333-333333333333");
    expect(moon.name).toBe("Europa");
  });

  it("maps to DB DTO", () => {
    const moon = Moon.create(validInput);

    const dto = moon.toDB();

    expect(dto).toEqual({
      id: moon.id,
      planet_id: moon.planetId,
      name: moon.name,
      size: moon.size,
      orbital: moon.orbital,
      relative_mass: moon.relativeMass,
      absolute_mass: moon.absoluteMass,
      relative_radius: moon.relativeRadius,
      absolute_radius: moon.absoluteRadius,
      gravity: moon.gravity,
      temperature: moon.temperature,
    });
  });
});
