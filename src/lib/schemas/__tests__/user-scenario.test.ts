import { describe, it, expect } from "vitest";
import { userScenarioSchema } from "../user-scenario";

describe("userScenarioSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = userScenarioSchema.parse({});

    expect(result).toEqual({
      personaDetailLevel: "simple",
      personas: [],
      userStories: [],
      successScenarios: [],
      failureScenarios: [],
    });
  });

  it("parses valid data with personas and stories", () => {
    const valid = {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: "p1",
          name: "Alice",
          role: "Dev",
          demographics: "B2B SaaS team lead",
          context: "Works across multiple dashboards every morning",
          techProficiency: "Advanced",
          behaviors: ["Checks status before standup"],
          motivations: ["Reduce repetitive work"],
          needs: ["Clear summary view"],
          painPoints: ["slow CI"],
          frustrations: ["Has to refresh multiple tools"],
          goals: ["fast builds"],
          successCriteria: ["Find blockers within 30 seconds"],
          quote: "I need signal, not noise.",
        },
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
      personas: [{ name: 123, behaviors: "not-an-array" }],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = userScenarioSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
