import { describe, expect, it } from "vitest";
import { cliRequirementsSchema } from "../cli-requirements";
import { commandTreeSchema } from "../command-tree";
import { cliContractSchema } from "../cli-contract";
import { cliConfigSchema } from "../cli-config";
import { cliTerminalUxSchema } from "../cli-terminal-ux";
import { createCliProjectPhaseData } from "../phase-data";

describe("CLI 스키마 — 빈 객체 파싱 (defaults)", () => {
  it("cliRequirements는 기본값으로 파싱된다", () => {
    const v = cliRequirementsSchema.parse({});
    expect(v.functional).toEqual([]);
    expect(v.nonFunctional).toEqual([]);
  });

  it("commandTree는 기본값 + 빈 커맨드로 파싱된다", () => {
    const v = commandTreeSchema.parse({});
    expect(v.rootBinary).toBe("");
    expect(v.convention).toBe("verb-noun");
    expect(v.commands).toEqual([]);
    expect(v.completions.shells).toContain("bash");
  });

  it("cliContract는 빈 contracts로 파싱된다", () => {
    const v = cliContractSchema.parse({});
    expect(v.contracts).toEqual([]);
    expect(v.globalConventions.jsonFlag).toBe("--json");
  });

  it("cliConfig는 기본 XDG 레이아웃으로 파싱된다", () => {
    const v = cliConfigSchema.parse({});
    expect(v.fsLayout.configDir).toBe("$XDG_CONFIG_HOME");
    expect(v.secrets.preferredStore).toBe("env-var");
  });

  it("cliTerminalUx는 기본 팔레트·체크리스트로 파싱된다", () => {
    const v = cliTerminalUxSchema.parse({});
    expect(v.palette.primary).toBe("cyan");
    expect(v.palette.respectNoColor).toBe(true);
    expect(v.agentChecklist.respectsTtyAndNoColor).toBe(true);
  });
});

describe("createCliProjectPhaseData — 서브타입별 기본값", () => {
  it("human-first는 --json을 기본 글로벌 플래그에서 제외한다", () => {
    const data = createCliProjectPhaseData("human-first");
    const flagLongs =
      data.commandTree?.globalFlags.map((f: { long: string }) => f.long) ?? [];
    expect(flagLongs).toContain("--help");
    expect(flagLongs).toContain("--verbose");
    expect(flagLongs).not.toContain("--json");
    expect(data.cliTerminalUx?.agentChecklist.mcpBridge).toBe("none");
  });

  it("agent-first는 --json/--no-input을 포함하고 MCP native를 설정한다", () => {
    const data = createCliProjectPhaseData("agent-first");
    const flagLongs =
      data.commandTree?.globalFlags.map((f: { long: string }) => f.long) ?? [];
    expect(flagLongs).toContain("--json");
    expect(flagLongs).toContain("--no-input");
    expect(data.cliTerminalUx?.agentChecklist.mcpBridge).toBe("native");
    expect(data.cliRequirements?.destructivePolicy?.requiresConfirmation).toBe(
      false,
    );
  });

  it("hybrid는 두 플래그 세트를 합쳐 중복 제거한다", () => {
    const data = createCliProjectPhaseData("hybrid");
    const flagLongs =
      data.commandTree?.globalFlags.map((f: { long: string }) => f.long) ?? [];
    expect(flagLongs).toContain("--help");
    expect(flagLongs).toContain("--json");
    expect(flagLongs).toContain("--no-color");
    const helpCount = flagLongs.filter((l: string) => l === "--help").length;
    expect(helpCount).toBe(1);
    expect(data.cliTerminalUx?.agentChecklist.mcpBridge).toBe("wrapper");
  });
});
