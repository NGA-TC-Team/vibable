import { describe, it, expect } from "vitest";
import { overviewSchema } from "../overview";

describe("overviewSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = overviewSchema.parse({});

    expect(result).toEqual({
      projectName: "",
      elevatorPitch: "",
      background: "",
      coreValueProposition: "",
      businessGoals: [],
      targetUsers: "",
      scope: { type: "mvp", details: "" },
      competitors: [],
      constraints: [],
      successMetrics: [],
      successMetricGroups: [],
      timeline: [],
      milestoneGroups: [],
      references: [],
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

  it("migrates legacy flat successMetrics into groups (one row per group)", () => {
    const result = overviewSchema.parse({
      successMetrics: [
        { id: "a", metric: "MAU", target: "1k", measurement: "analytics" },
        { id: "b", metric: "NPS", target: "40", measurement: "survey" },
      ],
    });

    expect(result.successMetrics).toEqual([]);
    expect(result.successMetricGroups).toHaveLength(2);
    expect(result.successMetricGroups[0].id).toBe("grp-a");
    expect(result.successMetricGroups[0].parent.metric).toBe("MAU");
    expect(result.successMetricGroups[0].children).toEqual([]);
    expect(result.successMetricGroups[1].parent.id).toBe("b");
  });

  it("migrates legacy flat timeline into milestoneGroups", () => {
    const result = overviewSchema.parse({
      timeline: [{ id: "m1", milestone: "MVP", date: "Q2", description: "ship" }],
    });

    expect(result.timeline).toEqual([]);
    expect(result.milestoneGroups).toHaveLength(1);
    expect(result.milestoneGroups[0].parent.milestone).toBe("MVP");
  });
});
