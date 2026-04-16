import { describe, expect, it } from "vitest";
import { generatePhaseMarkdown } from "../phase-md-generator";
import { createDefaultPhaseData } from "@/lib/schemas/phase-data";
import type { PhaseData } from "@/types/phases";

describe("generatePhaseMarkdown", () => {
  it("generates overview markdown with core sections", () => {
    const phases = createDefaultPhaseData() as PhaseData;
    phases.overview.projectName = "Vibable";
    phases.overview.businessGoals = ["PMF 검증", "초기 유저 확보"];

    const markdown = generatePhaseMarkdown("Vibable", phases, "overview");

    expect(markdown).toContain("# Vibable - 기획 개요");
    expect(markdown).toContain("## 비즈니스 목표");
    expect(markdown).toContain("- PMF 검증");
    expect(markdown).toContain("- 초기 유저 확보");
  });

  it("reuses design markdown generator for design system phase", () => {
    const phases = createDefaultPhaseData() as PhaseData;
    phases.designSystem.visualTheme.mood = "Minimal";

    const markdown = generatePhaseMarkdown("Vibable", phases, "designSystem");

    expect(markdown).toContain("# DESIGN.md");
    expect(markdown).toContain("Minimal");
  });

  it("includes detailed persona fields in user scenario markdown", () => {
    const phases = createDefaultPhaseData() as PhaseData;
    phases.userScenario.personaDetailLevel = "detailed";
    phases.userScenario.personas = [
      {
        id: "p1",
        name: "김하늘",
        role: "운영 매니저",
        demographics: "30대 초반, 스타트업 근무",
        context: "오전 CS 응대 중 여러 도구를 동시에 사용한다.",
        techProficiency: "협업툴은 익숙하지만 자동화 설정은 어려워함",
        behaviors: ["먼저 요약 대시보드를 확인한다."],
        motivations: ["실수를 줄이고 팀 신뢰를 얻고 싶다."],
        needs: ["지금 처리해야 할 일을 바로 파악하고 싶다."],
        painPoints: ["상태 확인을 위해 여러 화면을 오가야 한다."],
        frustrations: ["작은 설정 차이로 같은 작업을 반복한다."],
        goals: ["핵심 업무를 1분 안에 판단하고 싶다."],
        successCriteria: ["신규 팀원도 첫날부터 같은 흐름을 따라갈 수 있어야 한다."],
        quote: "무엇을 먼저 해야 하는지만 바로 보여주세요.",
      },
    ];

    const markdown = generatePhaseMarkdown("Vibable", phases, "userScenario");

    expect(markdown).toContain("## 페르소나 작성 모드");
    expect(markdown).toContain("- 모드: 상세형");
    expect(markdown).toContain("- 배경 정보: 30대 초반, 스타트업 근무");
    expect(markdown).toContain("- 사용 맥락: 오전 CS 응대 중 여러 도구를 동시에 사용한다.");
    expect(markdown).toContain("- 대표 발화: \"무엇을 먼저 해야 하는지만 바로 보여주세요.\"");
  });
});
