import { describe, it, expect } from "vitest";
import { buildOpenClawWorkspaceFiles } from "../openclaw-workspace-generator";
import { createAgentProjectPhaseData } from "@/lib/schemas/phase-data";
import type { Project, PhaseData } from "@/types/phases";

function makeOpenClawProject(): Project {
  const phases = createAgentProjectPhaseData("openclaw") as unknown as PhaseData;
  return {
    id: "test-id",
    workspaceId: "default",
    name: "OpenClawProject",
    type: "agent",
    agentSubType: "openclaw",
    currentPhase: 0,
    phases,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

function makeClaudeAgentProject(): Project {
  const phases = createAgentProjectPhaseData("claude-subagent") as unknown as PhaseData;
  return {
    id: "test-id",
    workspaceId: "default",
    name: "ClaudeProject",
    type: "agent",
    agentSubType: "claude-subagent",
    currentPhase: 0,
    phases,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

const EXPECTED_OPENCLAW_FILES = [
  "SOUL.md",
  "IDENTITY.md",
  "AGENTS.md",
  "USER.md",
  "TOOLS.md",
  "HEARTBEAT.md",
  "BOOT.md",
  "MEMORY.md",
  "openclaw.json.snippet",
] as const;

describe("buildOpenClawWorkspaceFiles", () => {
  it("정상: openclaw 프로젝트는 9개 파일을 반환함", () => {
    const project = makeOpenClawProject();

    const result = buildOpenClawWorkspaceFiles(project);

    expect(Object.keys(result)).toHaveLength(EXPECTED_OPENCLAW_FILES.length);
    for (const filename of EXPECTED_OPENCLAW_FILES) {
      expect(result[filename]).toBeDefined();
    }
  });

  it("정상: claude-subagent 프로젝트이면 에러 README 하나만 반환", () => {
    const project = makeClaudeAgentProject();

    const result = buildOpenClawWorkspaceFiles(project);

    expect(Object.keys(result)).toHaveLength(1);
    expect(result["README-openclaw-export.md"]).toBeDefined();
    expect(result["README-openclaw-export.md"]).toContain("OpenClaw Phase 4·5 데이터가 없습니다");
  });

  it("정상: agentBehavior가 없으면 에러 README를 반환", () => {
    const project = makeOpenClawProject();
    (project.phases as Record<string, unknown>).agentBehavior = undefined;

    const result = buildOpenClawWorkspaceFiles(project);

    expect(result["README-openclaw-export.md"]).toBeDefined();
  });

  it("정상: SOUL.md는 # SOUL 헤딩을 포함함", () => {
    const project = makeOpenClawProject();

    const result = buildOpenClawWorkspaceFiles(project);

    expect(result["SOUL.md"]).toContain("# SOUL");
    expect(result["SOUL.md"]).toContain("## Personality");
    expect(result["SOUL.md"]).toContain("## Communication style");
    expect(result["SOUL.md"]).toContain("## Values");
    expect(result["SOUL.md"]).toContain("## Boundaries");
  });

  it("정상: IDENTITY.md는 이름·역할 필드를 포함함", () => {
    const project = makeOpenClawProject();

    const result = buildOpenClawWorkspaceFiles(project);

    expect(result["IDENTITY.md"]).toContain("# IDENTITY");
    expect(result["IDENTITY.md"]).toContain("- Name:");
    expect(result["IDENTITY.md"]).toContain("- Role:");
  });

  it("정상: openclaw.json.snippet은 유효한 JSON임", () => {
    const project = makeOpenClawProject();

    const result = buildOpenClawWorkspaceFiles(project);

    expect(() => JSON.parse(result["openclaw.json.snippet"])).not.toThrow();
    const parsed = JSON.parse(result["openclaw.json.snippet"]);
    expect(parsed).toHaveProperty("agents");
    expect(parsed).toHaveProperty("channels");
    expect(parsed).toHaveProperty("gateway");
    expect(parsed).toHaveProperty("skills");
  });

  it("정상: openclaw.json.snippet의 gateway는 bindHost, port를 가짐", () => {
    const project = makeOpenClawProject();

    const result = buildOpenClawWorkspaceFiles(project);
    const parsed = JSON.parse(result["openclaw.json.snippet"]);

    expect(parsed.gateway).toHaveProperty("bindHost");
    expect(parsed.gateway).toHaveProperty("port");
  });

  it("엣지: skills는 enabled=true인 것만 포함됨", () => {
    const project = makeOpenClawProject();
    const tools = (project.phases as Record<string, unknown>).agentTools;
    if (tools && typeof tools === "object" && "openclaw" in tools) {
      const oc = (tools as Record<string, unknown>).openclaw as Record<string, unknown>;
      oc.skills = [
        { id: "s1", name: "skill-a", source: "", description: "", enabled: true },
        { id: "s2", name: "skill-b", source: "", description: "", enabled: false },
      ];
    }

    const result = buildOpenClawWorkspaceFiles(project);
    const parsed = JSON.parse(result["openclaw.json.snippet"]);

    expect(parsed.skills).toHaveLength(1);
    expect(parsed.skills[0].name).toBe("skill-a");
  });

  it("엣지: authToken이 있으면 gateway에 auth 필드가 포함됨", () => {
    const project = makeOpenClawProject();
    const tools = (project.phases as Record<string, unknown>).agentTools;
    if (tools && typeof tools === "object" && "openclaw" in tools) {
      const oc = (tools as Record<string, unknown>).openclaw as Record<string, unknown>;
      (oc.gatewayConfig as Record<string, unknown>).authToken = "secret-token";
    }

    const result = buildOpenClawWorkspaceFiles(project);
    const parsed = JSON.parse(result["openclaw.json.snippet"]);

    expect(parsed.gateway.auth).toBeDefined();
    expect(parsed.gateway.auth.token).toBe("secret-token");
  });

  it("불변성: 결과 파일의 내용은 문자열임", () => {
    const project = makeOpenClawProject();

    const result = buildOpenClawWorkspaceFiles(project);

    for (const [, content] of Object.entries(result)) {
      expect(typeof content).toBe("string");
    }
  });
});
