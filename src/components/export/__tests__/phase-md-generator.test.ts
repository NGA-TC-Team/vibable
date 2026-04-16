import { describe, expect, it } from "vitest";
import { generatePhaseMarkdown } from "../phase-md-generator";
import { createDefaultPhaseData } from "@/lib/schemas/phase-data";

describe("generatePhaseMarkdown", () => {
  it("generates overview markdown with core sections", () => {
    const phases = createDefaultPhaseData();
    phases.overview.projectName = "Vibable";
    phases.overview.businessGoals = ["PMF 검증", "초기 유저 확보"];

    const markdown = generatePhaseMarkdown("Vibable", phases, "overview");

    expect(markdown).toContain("# Vibable - 기획 개요");
    expect(markdown).toContain("## 비즈니스 목표");
    expect(markdown).toContain("- PMF 검증");
    expect(markdown).toContain("- 초기 유저 확보");
  });

  it("reuses design markdown generator for design system phase", () => {
    const phases = createDefaultPhaseData();
    phases.designSystem.visualTheme.mood = "Minimal";

    const markdown = generatePhaseMarkdown("Vibable", phases, "designSystem");

    expect(markdown).toContain("# DESIGN.md");
    expect(markdown).toContain("Minimal");
  });
});
