import { System } from "../../domain/aggregates/System";

const validInput = {
  galaxyId: "11111111-1111-4111-8111-111111111111",
  name: "Sol",
  position: { x: 1, y: 2, z: 3 },
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

describe("System aggregate", () => {
  it("creates with defaults", () => {
    const system = System.create(validInput);

    expect(system.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
    expect(system.galaxyId).toBe(validInput.galaxyId);
    expect(system.name).toBe(validInput.name);
    expect(system.position).toEqual(validInput.position);
  });

  it("creates with provided id", () => {
    const system = System.create({
      ...validInput,
      id: "22222222-2222-4222-8222-222222222222",
    });

    expect(system.id).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("throws on invalid name", () => {
    assertDomainErrorCode(
      () =>
        System.create({
          ...validInput,
          name: "a",
        }),
      "DOMAIN.INVALID_SYSTEM_NAME",
    );
  });

  it("throws on invalid position", () => {
    assertDomainErrorCode(
      () =>
        System.create({
          ...validInput,
          position: { x: Number.NaN, y: 1, z: 2 },
        }),
      "DOMAIN.INVALID_SYSTEM_POSITION",
    );
  });

  it("renames when different", () => {
    const system = System.create(validInput);

    system.rename("Alpha");

    expect(system.name).toBe("Alpha");
  });

  it("moves when different", () => {
    const system = System.create(validInput);

    system.move({ x: 10, y: 20, z: 30 });

    expect(system.position).toEqual({ x: 10, y: 20, z: 30 });
  });

  it("rehydrates from persistence data", () => {
    const system = System.rehydrate({
      id: "33333333-3333-4333-8333-333333333333",
      galaxyId: "44444444-4444-4444-8444-444444444444",
      name: "Sirius",
      position: { x: 0, y: 0, z: 0 },
    });

    expect(system.id).toBe("33333333-3333-4333-8333-333333333333");
    expect(system.galaxyId).toBe("44444444-4444-4444-8444-444444444444");
    expect(system.name).toBe("Sirius");
  });

  it("maps to DB DTO", () => {
    const system = System.create(validInput);

    const dto = system.toDB();

    expect(dto).toEqual({
      id: system.id,
      galaxy_id: system.galaxyId,
      name: system.name,
      position_x: validInput.position.x,
      position_y: validInput.position.y,
      position_z: validInput.position.z,
    });
  });
});
