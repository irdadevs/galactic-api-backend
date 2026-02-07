import { Galaxy, GalaxyShapeValue } from "../../domain/aggregates/Galaxy";

const validInput = {
  ownerId: "11111111-1111-4111-8111-111111111111",
  name: "Andromeda",
  systemCount: 3,
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

describe("Galaxy aggregate", () => {
  it("creates a galaxy with defaults", () => {
    const galaxy = Galaxy.create(validInput);

    expect(galaxy.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(galaxy.ownerId).toBe(validInput.ownerId);
    expect(galaxy.name).toBe(validInput.name);
    expect(galaxy.systemCount).toBe(validInput.systemCount);
    expect(galaxy.createdAt).toBeInstanceOf(Date);
  });

  it("creates a galaxy with provided fields", () => {
    const galaxy = Galaxy.create({
      ...validInput,
      id: "22222222-2222-4222-8222-222222222222",
      shape: "spherical",
      createdAt: new Date("2025-03-03T00:00:00.000Z"),
    });

    expect(galaxy.id).toBe("22222222-2222-4222-8222-222222222222");
    expect(galaxy.shape).toBe("spherical");
    expect(galaxy.createdAt.toISOString()).toBe("2025-03-03T00:00:00.000Z");
  });

  it("throws on invalid owner id", () => {
    assertDomainErrorCode(
      () =>
        Galaxy.create({
          ...validInput,
          ownerId: "not-a-uuid",
        }),
      "DOMAIN.INVALID_USER_ID",
    );
  });

  it("throws on invalid name", () => {
    assertDomainErrorCode(
      () =>
        Galaxy.create({
          ...validInput,
          name: "bad",
        }),
      "DOMAIN.INVALID_GALAXY_NAME",
    );
  });

  it("throws on invalid shape", () => {
    assertDomainErrorCode(
      () =>
        Galaxy.create({
          ...validInput,
          shape: "circle",
        }),
      "DOMAIN.INVALID_GALAXY_SHAPE",
    );
  });

  it("normalizes system count minimum to 1", () => {
    const galaxy = Galaxy.create({
      ...validInput,
      systemCount: 0,
    });

    expect(galaxy.systemCount).toBe(1);
  });

  it("renames when different", () => {
    const galaxy = Galaxy.create(validInput);

    galaxy.rename("MilkyWay");

    expect(galaxy.name).toBe("MilkyWay");
  });

  it("keeps name when unchanged", () => {
    const galaxy = Galaxy.create(validInput);

    galaxy.rename(validInput.name);

    expect(galaxy.name).toBe(validInput.name);
  });

  it("changes shape when different", () => {
    const galaxy = Galaxy.create(validInput);
    const nextShape: GalaxyShapeValue =
      galaxy.shape === "irregular" ? "spherical" : "irregular";

    galaxy.changeShape(nextShape);

    expect(galaxy.shape).toBe(nextShape);
  });

  it("keeps shape when unchanged", () => {
    const galaxy = Galaxy.create(validInput);

    galaxy.changeShape(galaxy.shape);

    expect(galaxy.shape).toBe(galaxy.shape);
  });

  it("changes system count when different", () => {
    const galaxy = Galaxy.create(validInput);

    galaxy.changeSystemCount(10);

    expect(galaxy.systemCount).toBe(10);
  });

  it("normalizes system count on change", () => {
    const galaxy = Galaxy.create(validInput);

    galaxy.changeSystemCount(-5);

    expect(galaxy.systemCount).toBe(1);
  });

  it("rehydrates from persistence data", () => {
    const galaxy = Galaxy.rehydrate({
      id: "33333333-3333-4333-8333-333333333333",
      ownerId: "44444444-4444-4444-8444-444444444444",
      name: "Triangulum",
      shape: "5-arm spiral",
      systemCount: 12,
      createdAt: new Date("2024-02-02T00:00:00.000Z"),
    });

    expect(galaxy.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(galaxy.ownerId).toBe("44444444-4444-4444-8444-444444444444");
    expect(galaxy.name).toBe("Triangulum");
    expect(galaxy.shape).toBe("5-arm spiral");
    expect(galaxy.systemCount).toBe(12);
  });

  it("maps to DB DTO", () => {
    const galaxy = Galaxy.create(validInput);

    const dto = galaxy.toDB();

    expect(dto).toEqual({
      id: galaxy.id,
      owner_id: galaxy.ownerId,
      name: galaxy.name,
      shape: galaxy.shape,
      system_count: galaxy.systemCount,
      created_at: galaxy.createdAt,
    });
  });
});
