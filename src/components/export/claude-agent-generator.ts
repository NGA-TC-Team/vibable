import type { PhaseData, Project } from "@/types/phases";

function slugify(name: string, fallback: string) {
  const s = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return s || fallback;
}

function yamlEscape(s: string) {
  return JSON.stringify(s);
}

/** Phase 데이터 → .claude/agents/*.md 본문 맵 (경로 → UTF-8 문자열) */
export function buildClaudeAgentFiles(project: Project): Record<string, string> {
  const phases = project.phases;
  const arch = phases.agentArchitecture;
  const behavior = phases.agentBehavior;
  const tools = phases.agentTools;

  if (!arch || arch.kind !== "claude-subagent") {
    return {
      "CLAUDE-delegation-hint.md": `# ${project.name}\n\nagentArchitecture가 Claude 서브에이전트 형식이 아닙니다. Phase 3를 채운 뒤 다시보내세요.\n`,
    };
  }

  const behaviors =
    behavior?.kind === "claude-subagent" ? behavior.behaviors : [];
  const claudeTools = tools?.kind === "claude-subagent" ? tools.claude : null;

  const out: Record<string, string> = {};

  for (const agent of arch.claude.agents) {
    const beh = behaviors.find((b) => b.agentId === agent.id);
    const agentToolsOverride =
      claudeTools?.agentTools.find((t) => t.agentId === agent.id)?.tools ?? agent.toolAccess;
    const mergedTools = [...new Set([...claudeTools?.globalTools ?? [], ...agentToolsOverride])];
    const hooksForAgent =
      claudeTools?.hooks.filter((h) => h.agentId === agent.id || h.agentId === "") ?? [];

    const name = agent.name.trim() || slugify(agent.role, agent.id.slice(0, 8));
    const fileBase = slugify(name, agent.id.slice(0, 8));

    const toolsYaml =
      mergedTools.length > 0
        ? `tools:\n${mergedTools.map((t) => `  - ${t}`).join("\n")}`
        : "tools: []";

    const fm = [
      "---",
      `name: ${yamlEscape(name)}`,
      `description: ${yamlEscape(agent.description || agent.role)}`,
      `model: ${agent.model}`,
      toolsYaml,
      `color: ${yamlEscape(beh?.color ?? "cyan")}`,
      `permissionMode: ${agent.permissionMode}`,
      `memory: ${agent.memoryScope === "none" ? "project" : agent.memoryScope}`,
      "---",
      "",
    ].join("\n");

    const bodyParts = [
      `# ${agent.role || name}`,
      "",
      beh?.systemPrompt ?? "_시스템 프롬프트를 Phase 4에서 작성하세요._",
      "",
      "## Core Expertise",
      ...(beh?.coreExpertise?.length
        ? beh.coreExpertise.map((x) => `- ${x}`)
        : ["- (없음)"]),
      "",
      "## Responsibilities",
      ...(beh?.responsibilities?.length
        ? beh.responsibilities.map((x) => `- ${x}`)
        : ["- (없음)"]),
      "",
      "## Output Format",
      beh?.outputFormat || "_자유 서술_",
      "",
      "## Constraints",
      ...(beh?.constraints?.length ? beh.constraints.map((x) => `- ${x}`) : ["- (없음)"]),
      "",
    ];

    if (hooksForAgent.length > 0) {
      bodyParts.push(
        "## Hooks (참고 — YAML 훅은 Claude Code 문서에 맞게 조정)",
        "",
        ...hooksForAgent.map(
          (h) =>
            `- **${h.hookType}** matcher \`${h.matcher}\`: ${h.purpose}\n  - action: \`${h.action}\``,
        ),
        "",
      );
    }

    out[`.claude/agents/${fileBase}.md`] = fm + bodyParts.join("\n");
  }

  const delegation = [
    `# ${project.name} — 위임 힌트 (CLAUDE.md용 스니펫)`,
    "",
    "## Subagents",
    ...arch.claude.agents.map(
      (a) =>
        `- **${a.name || a.id}**: ${a.description || a.role} (model: ${a.model}, tools: ${a.toolAccess.join(", ") || "—"})`,
    ),
    "",
    "## Delegation rules",
    ...arch.claude.delegationRules.map((r) => `- ${r}`),
    "",
  ].join("\n");
  out["DELEGATION_SNIPPET.md"] = delegation;

  return out;
}

export function buildClaudeAgentZipEntries(project: Project): Record<string, string> {
  return buildClaudeAgentFiles(project);
}
