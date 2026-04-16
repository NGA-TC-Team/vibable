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
          entityIds: ["entity-1"],
          uxIntent: { userGoal: "See overview", businessIntent: "Engagement" },
          states: {
            idle: "Shows data",
            loading: "Skeleton",
            offline: "Cached",
            errors: [{ type: "network" as const, description: "Retry" }],
          },
          interactions: [{ elementId: "btn", trigger: "click", actionKind: "navigate" }],
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

  it("normalizes legacy interaction fields", () => {
    const result = screenDesignSchema.parse({
      pages: [
        {
          id: "p1",
          interactions: [{ element: "legacy-btn", trigger: "tap", action: "navigate" }],
        },
      ],
    });

    expect(result.pages[0]?.interactions[0]).toEqual({
      elementId: "legacy-btn",
      trigger: "tap",
      actionKind: "navigate",
      actionCustom: undefined,
    });
  });

  it("preserves nested mockup metadata through JSON roundtrip", () => {
    const original = screenDesignSchema.parse({
      pages: [
        {
          id: "page-1",
          mockupByState: {
            idle: {
              mobile: [
                {
                  id: "layout-1",
                  type: "grid",
                  x: 10,
                  y: 20,
                  width: 320,
                  height: 240,
                  props: { columns: "2" },
                  children: ["child-1"],
                },
                {
                  id: "child-1",
                  type: "button",
                  x: 0,
                  y: 0,
                  width: 120,
                  height: 36,
                  props: { text: "저장" },
                  designNoteByContext: {
                    "idle:mobile": {
                      mode: "custom",
                      note: "모바일 저장 버튼",
                    },
                  },
                },
              ],
            },
          },
        },
      ],
    });

    const roundtripped = screenDesignSchema.parse(
      JSON.parse(JSON.stringify(original)),
    );

    expect(roundtripped).toEqual(original);
    expect(roundtripped.pages[0]?.mockupByState?.idle.mobile[0]?.children).toEqual([
      "child-1",
    ]);
    expect(
      roundtripped.pages[0]?.mockupByState?.idle.mobile[1]?.designNoteByContext?.[
        "idle:mobile"
      ],
    ).toEqual({
      mode: "custom",
      note: "모바일 저장 버튼",
    });
  });
});
