import { describe, it, expect } from "vitest";
import { overviewSchema } from "../overview";

describe("overviewSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = overviewSchema.parse({});

    expect(result).toEqual({
      projectName: "",
      background: "",
      businessGoals: [],
      targetUsers: "",
      techStack: "",
    });
  });

  it("parses valid data successfully", () => {
    const valid = {
      projectName: "My App",
      background: "Some background",
      businessGoals: ["goal1", "goal2"],
      targetUsers: "developers",
      techStack: "Next.js",
    };

    const result = overviewSchema.safeParse(valid);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.projectName).toBe("My App");
      expect(result.data.businessGoals).toHaveLength(2);
    }
  });

  it("rejects invalid data types", () => {
    const result = overviewSchema.safeParse({
      projectName: 123,
      businessGoals: "not-an-array",
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = overviewSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));

    expect(roundtripped).toEqual(original);
  });
});
