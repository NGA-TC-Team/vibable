import { describe, it, expect } from "vitest";
import { dataModelSchema } from "../data-model";

describe("dataModelSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = dataModelSchema.parse({});

    expect(result).toEqual({
      entities: [],
      storageStrategy: "local",
      storageNotes: "",
    });
  });

  it("parses valid entity data", () => {
    const valid = {
      entities: [
        {
          id: "e1",
          name: "User",
          fields: [
            { name: "email", type: "string" as const, required: true, description: "User email" },
          ],
        },
      ],
      storageStrategy: "remote" as const,
      storageNotes: "PostgreSQL",
    };

    const result = dataModelSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid storage strategy", () => {
    const result = dataModelSchema.safeParse({
      storageStrategy: "cloud",
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = dataModelSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
