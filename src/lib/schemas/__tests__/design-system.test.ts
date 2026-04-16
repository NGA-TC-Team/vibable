import { describe, it, expect } from "vitest";
import { designSystemSchema } from "../design-system";

describe("designSystemSchema", () => {
  it("produces valid default values from empty input", () => {
    const result = designSystemSchema.parse({});

    expect(result.visualTheme).toBeDefined();
    expect(result.visualTheme.density).toBe("comfortable");
    expect(result.colorPalette).toEqual([]);
    expect(result.typography).toBeDefined();
    expect(result.components).toEqual([]);
    expect(result.layout).toBeDefined();
    expect(result.layout.gridColumns).toBe(12);
    expect(result.elevation).toBeDefined();
    expect(result.guidelines).toBeDefined();
    expect(result.responsive).toBeDefined();
    expect(result.responsive.touchTargetMin).toBe("44px");
    expect(result.uxWriting).toBeDefined();
    expect(result.uxWriting.toneLevel).toBe(3);
    expect(result.uxWriting.errorMessageStyle).toBe("friendly");
  });

  it("parses valid design system data", () => {
    const valid = {
      visualTheme: { mood: "Minimal", density: "compact" as const, philosophy: "Less is more" },
      colorPalette: [{ name: "Primary", hex: "#2563EB", role: "CTA" }],
      typography: {
        fontFamilies: [{ role: "body", family: "Inter", fallback: "sans-serif" }],
        scale: [{ name: "h1", size: "2rem", lineHeight: "1.2", weight: "700" }],
      },
      components: [{ component: "Button", variants: "primary, ghost", borderRadius: "8px" }],
    };

    const result = designSystemSchema.safeParse(valid);
    expect(result.success).toBe(true);
  });

  it("rejects invalid density enum", () => {
    const result = designSystemSchema.safeParse({
      visualTheme: { density: "tight" },
    });

    expect(result.success).toBe(false);
  });

  it("invariant: JSON roundtrip preserves structure", () => {
    const original = designSystemSchema.parse({});
    const roundtripped = JSON.parse(JSON.stringify(original));
    expect(roundtripped).toEqual(original);
  });
});
