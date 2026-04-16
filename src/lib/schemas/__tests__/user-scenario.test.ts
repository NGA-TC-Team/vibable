import { describe, it, expect } from "vitest";
import { userScenarioSchema } from "../user-scenario";

describe("userScenarioSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = userScenarioSchema.parse({});

    expect(result).toEqual({
      personas: [],
      userStories: [],
      successScenarios: [],
      failureScenarios: [],
    });
  });

  it("parses valid data with personas and stories", () => {
    const valid = {
      personas: [
        { id: "p1", name: "Alice", role: "Dev", painPoints: ["slow CI"], goals: ["fast builds"] },
      ],
      userStories: [
        { id: "s1", personaId: "p1", asA: "developer", iWant: "fast CI", soThat: "I ship faster" },
      ],
      successScenarios: ["User completes onboarding"],
      failureScenarios: ["User drops off"],
    };

    const result = userScenarioSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid persona structure", () => {
    const result = userScenarioSchema.safeParse({
      personas: [{ name: 123 }],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = userScenarioSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
