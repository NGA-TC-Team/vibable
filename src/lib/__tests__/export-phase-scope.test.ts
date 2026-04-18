import { describe, it, expect } from "vitest";
import { getPhaseExportScope } from "../export-phase-scope";
import { PHASE_KEYS, AGENT_PHASE_KEYS, CLI_PHASE_KEYS } from "@/types/phases";
import type { Project, PhaseData } from "@/types/phases";
import { createDefaultPhaseData } from "@/lib/schemas/phase-data";

function makeProject(type: "web" | "agent" | "cli"): Project {
  return {
    id: "test-id",
    workspaceId: "default",
    name: "Test",
    type,
    currentPhase: 0,
    phases: createDefaultPhaseData() as unknown as PhaseData,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

describe("getPhaseExportScope", () => {
  it("정상: web 프로젝트는 PHASE_KEYS 인덱스를 반환", () => {
    const project = makeProject("web");

    PHASE_KEYS.forEach((key, index) => {
      expect(getPhaseExportScope(project, index)).toBe(key);
    });
  });

  it("정상: agent 프로젝트는 AGENT_PHASE_KEYS 인덱스를 반환", () => {
    const project = makeProject("agent");

    AGENT_PHASE_KEYS.forEach((key, index) => {
      expect(getPhaseExportScope(project, index)).toBe(key);
    });
  });

  it("정상: web 프로젝트 인덱스 0은 overview를 반환", () => {
    const project = makeProject("web");

    expect(getPhaseExportScope(project, 0)).toBe("overview");
  });

  it("정상: agent 프로젝트 인덱스 2는 agentRequirements를 반환", () => {
    const project = makeProject("agent");

    expect(getPhaseExportScope(project, 2)).toBe("agentRequirements");
  });

  it("구분: web과 agent의 인덱스 2 값이 다름", () => {
    const webProject = makeProject("web");
    const agentProject = makeProject("agent");

    const webScope = getPhaseExportScope(webProject, 2);
    const agentScope = getPhaseExportScope(agentProject, 2);

    expect(webScope).toBe("requirements");
    expect(agentScope).toBe("agentRequirements");
    expect(webScope).not.toBe(agentScope);
  });

  it("정상: cli 프로젝트는 CLI_PHASE_KEYS 인덱스를 반환", () => {
    const project = makeProject("cli");
    CLI_PHASE_KEYS.forEach((key, index) => {
      expect(getPhaseExportScope(project, index)).toBe(key);
    });
  });

  it("정상: cli 프로젝트 인덱스 3은 commandTree를 반환", () => {
    const project = makeProject("cli");
    expect(getPhaseExportScope(project, 3)).toBe("commandTree");
  });
});
