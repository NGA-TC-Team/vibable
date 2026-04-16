import { describe, it, expect } from "vitest";
import { generateDesignMd } from "../design-md-generator";
import { designSystemSchema } from "@/lib/schemas/design-system";
import type { DesignSystemPhase } from "@/types/phases";

function emptyDesignSystem(): DesignSystemPhase {
  return designSystemSchema.parse({}) as unknown as DesignSystemPhase;
}

describe("generateDesignMd", () => {
  it("starts with '# DESIGN.md — {name}'", () => {
    const md = generateDesignMd("TestApp", emptyDesignSystem());

    expect(md.startsWith("# DESIGN.md — TestApp")).toBe(true);
  });

  it("invariant: contains all 9 section headings", () => {
    const md = generateDesignMd("TestApp", emptyDesignSystem());

    for (let i = 1; i <= 9; i++) {
      expect(md).toContain(`## ${i}.`);
    }
  });

  it("renders placeholder text for empty color palette", () => {
    const md = generateDesignMd("TestApp", emptyDesignSystem());

    expect(md).toContain("_컬러 팔레트 미정_");
  });

  it("renders table rows when color palette has data", () => {
    const ds = emptyDesignSystem();
    ds.colorPalette = [
      { name: "Primary", hex: "#2563EB", role: "CTA 버튼" },
      { name: "Error", hex: "#ef4444", role: "에러" },
    ];

    const md = generateDesignMd("TestApp", ds);

    expect(md).toContain("| Primary | #2563EB | CTA 버튼 |");
    expect(md).toContain("| Error | #ef4444 | 에러 |");
    expect(md).not.toContain("_컬러 팔레트 미정_");
  });

  it("renders component sections when data exists", () => {
    const ds = emptyDesignSystem();
    ds.components = [
      { component: "Button", variants: "primary, ghost", borderRadius: "8px" },
    ];

    const md = generateDesignMd("TestApp", ds);

    expect(md).toContain("### Button");
    expect(md).toContain("primary, ghost");
    expect(md).toContain("Border radius: 8px");
  });
});
