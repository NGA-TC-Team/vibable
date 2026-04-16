import { describe, it, expect } from "vitest";
import { infoArchitectureSchema } from "../info-architecture";

describe("infoArchitectureSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = infoArchitectureSchema.parse({});

    expect(result).toEqual({
      sitemap: [],
      userFlows: [],
      globalNavRules: [],
    });
  });

  it("parses valid data with nested sitemap nodes", () => {
    const valid = {
      sitemap: [
        {
          id: "root",
          label: "Home",
          path: "/",
          children: [
            { id: "about", label: "About", path: "/about", children: [] },
          ],
        },
      ],
      userFlows: [
        {
          id: "uf1",
          name: "Onboarding",
          steps: [{ id: "s1", screenRef: "home", action: "click", next: ["s2"] }],
        },
      ],
      globalNavRules: ["Always show back button"],
    };

    const result = infoArchitectureSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid sitemap node (missing id)", () => {
    const result = infoArchitectureSchema.safeParse({
      sitemap: [{ label: "No ID" }],
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = infoArchitectureSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
