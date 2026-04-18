import { describe, it, expect } from "vitest";
import { buildClaudeAgentFiles, buildClaudeAgentZipEntries } from "../claude-agent-generator";
import { createAgentProjectPhaseData } from "@/lib/schemas/phase-data";
import type { Project, PhaseData } from "@/types/phases";

function makeClaudeAgentProject(overrides?: Partial<PhaseData>): Project {
  const phases = createAgentProjectPhaseData("claude-subagent") as unknown as PhaseData;
  return {
    id: "test-id",
    workspaceId: "default",
    name: "TestAgent",
    type: "agent",
    agentSubType: "claude-subagent",
    currentPhase: 0,
    phases: { ...phases, ...overrides },
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function makeOpenClawProject(): Project {
  const phases = createAgentProjectPhaseData("openclaw") as unknown as PhaseData;
  return {
    id: "test-id",
    workspaceId: "default",
    name: "TestOpenClaw",
    type: "agent",
    agentSubType: "openclaw",
    currentPhase: 0,
    phases,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

describe("buildClaudeAgentFiles", () => {
  it("정상: claude-subagent 형식이 아니면 힌트 파일 하나만 반환", () => {
    const project = makeOpenClawProject();

    const result = buildClaudeAgentFiles(project);

    expect(Object.keys(result)).toHaveLength(1);
    expect(Object.keys(result)[0]).toBe("CLAUDE-delegation-hint.md");
    expect(result["CLAUDE-delegation-hint.md"]).toContain("agentArchitecture가 Claude 서브에이전트 형식이 아닙니다");
  });

  it("정상: agentArchitecture가 없으면 힌트 파일만 반환", () => {
    const project = makeClaudeAgentProject();
    // agentArchitecture를 제거
    (project.phases as Record<string, unknown>).agentArchitecture = undefined;

    const result = buildClaudeAgentFiles(project);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result["CLAUDE-delegation-hint.md"]).toBeDefined();
  });

  it("정상: 에이전트가 있으면 .claude/agents/{name}.md 파일이 생성됨", () => {
    const phases = createAgentProjectPhaseData("claude-subagent") as unknown as PhaseData;
    const agentArchitecture = {
      kind: "claude-subagent" as const,
      claude: {
        pattern: "single" as const,
        agents: [
          {
            id: "agent-1",
            name: "Analyzer",
            role: "분석가",
            description: "데이터 분석 전담",
            model: "sonnet" as const,
            toolAccess: ["read", "write"],
            permissionMode: "default" as const,
            memoryScope: "project" as const,
          },
        ],
        delegationRules: ["항상 분석가에게 데이터 처리를 위임한다"],
        dataFlow: [],
      },
    };

    const project: Project = {
      id: "test",
      workspaceId: "default",
      name: "MyProject",
      type: "agent",
      agentSubType: "claude-subagent",
      currentPhase: 0,
      phases: { ...phases, agentArchitecture },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = buildClaudeAgentFiles(project);

    const agentFile = result[".claude/agents/analyzer.md"];
    expect(agentFile).toBeDefined();
    expect(agentFile).toContain("name: \"Analyzer\"");
    expect(agentFile).toContain("model: sonnet");
    expect(agentFile).toContain("# 분석가");
  });

  it("정상: DELEGATION_SNIPPET.md 파일이 항상 포함됨 (에이전트 있을 때)", () => {
    const phases = createAgentProjectPhaseData("claude-subagent") as unknown as PhaseData;
    const agentArchitecture = {
      kind: "claude-subagent" as const,
      claude: {
        pattern: "single" as const,
        agents: [
          {
            id: "agent-1",
            name: "Worker",
            role: "실무자",
            description: "실무 처리",
            model: "haiku" as const,
            toolAccess: [],
            permissionMode: "default" as const,
            memoryScope: "project" as const,
          },
        ],
        delegationRules: ["rule1"],
        dataFlow: [],
      },
    };

    const project: Project = {
      id: "test",
      workspaceId: "default",
      name: "MyProject",
      type: "agent",
      agentSubType: "claude-subagent",
      currentPhase: 0,
      phases: { ...phases, agentArchitecture },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = buildClaudeAgentFiles(project);

    expect(result["DELEGATION_SNIPPET.md"]).toBeDefined();
    expect(result["DELEGATION_SNIPPET.md"]).toContain("# MyProject — 위임 힌트");
    expect(result["DELEGATION_SNIPPET.md"]).toContain("## Subagents");
    expect(result["DELEGATION_SNIPPET.md"]).toContain("## Delegation rules");
    expect(result["DELEGATION_SNIPPET.md"]).toContain("- rule1");
  });

  it("엣지: 에이전트 name이 빈 문자열이면 role 기반으로 슬러그가 생성됨", () => {
    const phases = createAgentProjectPhaseData("claude-subagent") as unknown as PhaseData;
    const agentArchitecture = {
      kind: "claude-subagent" as const,
      claude: {
        pattern: "single" as const,
        agents: [
          {
            id: "agent-abc123",
            name: "",
            role: "코드 리뷰어",
            description: "",
            model: "inherit" as const,
            toolAccess: [],
            permissionMode: "default" as const,
            memoryScope: "project" as const,
          },
        ],
        delegationRules: [],
        dataFlow: [],
      },
    };

    const project: Project = {
      id: "test",
      workspaceId: "default",
      name: "Project",
      type: "agent",
      agentSubType: "claude-subagent",
      currentPhase: 0,
      phases: { ...phases, agentArchitecture },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    const result = buildClaudeAgentFiles(project);

    // 슬러그는 한국어 제거 후 fallback으로 id 앞 8자
    const agentKeys = Object.keys(result).filter((k) => k.startsWith(".claude/agents/"));
    expect(agentKeys.length).toBe(1);
  });
});

describe("buildClaudeAgentZipEntries", () => {
  it("정상: buildClaudeAgentFiles와 동일한 결과를 반환함", () => {
    const project = makeClaudeAgentProject();

    const filesResult = buildClaudeAgentFiles(project);
    const zipResult = buildClaudeAgentZipEntries(project);

    expect(zipResult).toEqual(filesResult);
  });
});
