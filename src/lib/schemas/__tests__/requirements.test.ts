import { describe, it, expect } from "vitest";
import { requirementsSchema } from "../requirements";

describe("requirementsSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = requirementsSchema.parse({});

    expect(result).toEqual({
      functional: [],
      nonFunctional: [],
    });
  });

  it("parses valid data with requirements", () => {
    const valid = {
      functional: [
        {
          id: "f1",
          title: "Login",
          description: "User can log in",
          priority: "must" as const,
          acceptanceCriteria: ["Email + password"],
        },
      ],
      nonFunctional: [
        { id: "nf1", category: "performance" as const, description: "< 200ms response" },
      ],
    };

    const result = requirementsSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid priority enum", () => {
    const result = requirementsSchema.safeParse({
      functional: [{ id: "f1", title: "X", priority: "critical" }],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = requirementsSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
