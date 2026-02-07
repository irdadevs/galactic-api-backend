import { Asteroid } from "../../domain/aggregates/Asteroid";

const validInput = {
  systemId: "11111111-1111-4111-8111-111111111111",
  name: "AST-001",
  orbital: 1.5,
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

describe("Asteroid aggregate", () => {
  it("creates an asteroid with defaults", () => {
    const asteroid = Asteroid.create(validInput);

    expect(asteroid.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(asteroid.systemId).toBe(validInput.systemId);
    expect(asteroid.name).toBe(validInput.name);
    expect(asteroid.orbital).toBe(validInput.orbital);
  });

  it("throws on invalid name", () => {
    assertDomainErrorCode(
      () =>
        Asteroid.create({
          ...validInput,
          name: "a",
        }),
      "DOMAIN.INVALID_ASTEROID_NAME",
    );
  });

  it("throws on invalid type", () => {
    assertDomainErrorCode(
      () =>
        Asteroid.create({
          ...validInput,
          type: "belt" as "single",
        }),
      "DOMAIN.INVALID_ASTEROID_TYPE",
    );
  });

  it("throws on invalid size", () => {
    assertDomainErrorCode(
      () =>
        Asteroid.create({
          ...validInput,
          size: "huge" as "small",
        }),
      "DOMAIN.INVALID_ASTEROID_SIZE",
    );
  });

  it("throws on invalid orbital", () => {
    assertDomainErrorCode(
      () =>
        Asteroid.create({
          ...validInput,
          orbital: 2,
        }),
      "DOMAIN.INVALID_ASTEROID_ORBITAL",
    );
  });

  it("renames when different", () => {
    const asteroid = Asteroid.create(validInput);

    asteroid.rename("SOLAR-278");

    expect(asteroid.name).toBe("SOLAR-278");
  });

  it("changes type when different", () => {
    const asteroid = Asteroid.create(validInput);

    asteroid.changeType("cluster");

    expect(asteroid.type).toBe("cluster");
  });

  it("changes size when different", () => {
    const asteroid = Asteroid.create(validInput);

    asteroid.changeSize("medium");

    expect(asteroid.size).toBe("medium");
  });

  it("changes orbital when different", () => {
    const asteroid = Asteroid.create(validInput);

    asteroid.changeOrbital(2.5);

    expect(asteroid.orbital).toBe(2.5);
  });

  it("rehydrates from persistence data", () => {
    const asteroid = Asteroid.rehydrate({
      id: "22222222-2222-4222-8222-222222222222",
      systemId: "33333333-3333-4333-8333-333333333333",
      name: "AST-123",
      type: "single",
      size: "small",
      orbital: 3.5,
    });

    expect(asteroid.id).toBe("22222222-2222-4222-8222-222222222222");
    expect(asteroid.systemId).toBe("33333333-3333-4333-8333-333333333333");
    expect(asteroid.name).toBe("AST-123");
  });

  it("maps to DB DTO", () => {
    const asteroid = Asteroid.create(validInput);

    const dto = asteroid.toDB();

    expect(dto).toEqual({
      id: asteroid.id,
      system_id: asteroid.systemId,
      name: asteroid.name,
      type: asteroid.type,
      size: asteroid.size,
      orbital: asteroid.orbital,
    });
  });
});
