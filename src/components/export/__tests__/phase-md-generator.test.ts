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

  it("includes all 5 requirement sections (functional, glossary, constraints, non-functional, clarifications)", () => {
    const phases = createDefaultPhaseData() as PhaseData;
    phases.requirements.functional = [
      {
        id: "REQ-001",
        title: "소셜 로그인",
        description: "카카오 또는 구글로 로그인",
        priority: "must",
        acceptanceCriteria: ["OAuth 완료 후 세션 생성"],
        statement: "시스템은 사용자가 카카오 또는 구글로 로그인할 수 있어야 한다.",
        rationale: "가입 전환율 향상",
        source: "유저 인터뷰 #3",
        relatedGoalIds: ["goal-1"],
      },
    ];
    phases.requirements.nonFunctional = [
      { id: "NFR-001", category: "performance", description: "3초 이내 로드" },
    ];
    phases.requirements.constraints = [
      {
        id: "CON-001",
        category: "legal",
        description: "GDPR 준수",
        source: "EU 규정",
        impact: "데이터 이전 지역 제약",
      },
    ];
    phases.requirements.glossary = [
      {
        id: "GLS-001",
        term: "핵심 지표",
        definition: "재방문·전환 요약 수치",
        kind: "term",
        aliases: ["KPI"],
      },
    ];
    phases.requirements.clarifications = [
      {
        id: "CLR-001",
        question: "네이버 로그인을 포함할지",
        context: "REQ-001 관련",
        owner: "PM",
        status: "open",
        answer: "",
        blocksRequirementIds: ["REQ-001"],
      },
    ];

    const markdown = generatePhaseMarkdown("Vibable", phases, "requirements");

    expect(markdown).toContain("## 기능 요구사항");
    expect(markdown).toContain("### 소셜 로그인");
    expect(markdown).toContain("- 규격 문장: 시스템은 사용자가 카카오 또는 구글로 로그인할 수 있어야 한다.");
    expect(markdown).toContain("- 근거: 가입 전환율 향상");
    expect(markdown).toContain("- 출처: 유저 인터뷰 #3");
    expect(markdown).toContain("- 관련 비즈니스 목표: goal-1");
    expect(markdown).toContain("## 용어 정의");
    expect(markdown).toContain("**핵심 지표** (term)");
    expect(markdown).toContain("(KPI)");
    expect(markdown).toContain("## 제약조건");
    expect(markdown).toContain("[legal] GDPR 준수");
    expect(markdown).toContain("출처: EU 규정");
    expect(markdown).toContain("영향: 데이터 이전 지역 제약");
    expect(markdown).toContain("## 비기능 요구사항");
    expect(markdown).toContain("- performance: 3초 이내 로드");
    expect(markdown).toContain("## 미해결 · 확인 필요");
    expect(markdown).toContain("[open] 네이버 로그인을 포함할지");
    expect(markdown).toContain("담당: PM");
    expect(markdown).toContain("영향: REQ-001");
  });

  it("emits '- 없음' for empty requirement sections", () => {
    const phases = createDefaultPhaseData() as PhaseData;
    const markdown = generatePhaseMarkdown("Vibable", phases, "requirements");
    expect(markdown).toContain("## 제약조건");
    expect(markdown).toContain("## 용어 정의");
    expect(markdown).toContain("## 미해결 · 확인 필요");
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
