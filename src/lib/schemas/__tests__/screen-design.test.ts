import { describe, it, expect } from "vitest";
import { screenDesignSchema } from "../screen-design";

describe("screenDesignSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = screenDesignSchema.parse({});

    expect(result).toEqual({ pages: [] });
  });

  it("parses valid page data", () => {
    const valid = {
      pages: [
        {
          id: "p1",
          name: "Dashboard",
          route: "/dashboard",
          uxIntent: { userGoal: "See overview", businessIntent: "Engagement" },
          states: {
            idle: "Shows data",
            loading: "Skeleton",
            offline: "Cached",
            errors: [{ type: "network" as const, description: "Retry" }],
          },
          interactions: [{ element: "btn", trigger: "click", action: "navigate" }],
          inPages: [],
          outPages: ["p2"],
        },
      ],
    };

    const result = screenDesignSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid error type enum", () => {
    const result = screenDesignSchema.safeParse({
      pages: [{ id: "p1", states: { errors: [{ type: "unknown_type" }] } }],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = screenDesignSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
