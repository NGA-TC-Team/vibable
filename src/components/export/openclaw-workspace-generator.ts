import type { Project } from "@/types/phases";

/** OpenClaw 워크스페이스 루트에 둘 마크다운/JSON 파일 맵 */
export function buildOpenClawWorkspaceFiles(project: Project): Record<string, string> {
  const b = project.phases.agentBehavior;
  const t = project.phases.agentTools;
  const a = project.phases.agentArchitecture;

  if (!b || b.kind !== "openclaw" || !t || t.kind !== "openclaw") {
    return {
      "README-openclaw-export.md": `# ${project.name}\n\nOpenClaw Phase 4·5 데이터가 없습니다.\n`,
    };
  }

  const oc = b.openclaw;
  const tools = t.openclaw;
  const arch = a?.kind === "openclaw" ? a.openclaw : null;

  const soulMd = [
    "# SOUL",
    "",
    "## Personality",
    oc.soul.personality || "_작성 필요_",
    "",
    "## Communication style",
    ...oc.soul.communicationStyle.map((x) => `- ${x}`),
    "",
    "## Values",
    ...oc.soul.values.map((x) => `- ${x}`),
    "",
    "## Boundaries",
    ...oc.soul.boundaries.map((x) => `- ${x}`),
    "",
  ].join("\n");

  const identityMd = [
    "# IDENTITY",
    "",
    `- Name: ${oc.identity.agentName}`,
    `- Role: ${oc.identity.role}`,
    "",
    oc.identity.selfIntroduction,
    "",
  ].join("\n");

  const agentsMd = [
    "# AGENTS",
    "",
    "## Safety defaults",
    ...oc.agents.safetyDefaults.map((x) => `- ${x}`),
    "",
    "## Session start",
    ...oc.agents.sessionStartRules.map((x) => `- ${x}`),
    "",
    "## Memory",
    ...oc.agents.memoryRules.map((x) => `- ${x}`),
    "",
    "## Shared space",
    ...oc.agents.sharedSpaceRules.map((x) => `- ${x}`),
    "",
  ].join("\n");

  const userMd = [
    "# USER",
    "",
    `- Name: ${oc.user.name}`,
    `- Timezone: ${oc.user.timezone}`,
    "",
    "## Background",
    oc.user.background,
    "",
    "## Preferences",
    ...oc.user.preferences.map((x) => `- ${x}`),
    "",
    "## Work context",
    oc.user.workContext,
    "",
  ].join("\n");

  const toolsMd = [
    "# TOOLS",
    "",
    "## Enabled",
    ...tools.tools.enabled.map((x) => `- ${x}`),
    "",
    "## Disabled",
    ...tools.tools.disabled.map((x) => `- ${x}`),
    "",
    "## Notes",
    tools.tools.notes || "_없음_",
    "",
  ].join("\n");

  const heartbeatMd = [
    "# HEARTBEAT",
    "",
    ...oc.heartbeat.map(
      (h) =>
        `## ${h.name || "task"} (${h.enabled ? "on" : "off"})\n- Schedule: ${h.schedule}\n- Action: ${h.action}\n`,
    ),
  ].join("\n");

  const openclawJson = JSON.stringify(
    {
      agents: { defaults: { workspace: arch?.workspacePath ?? "~/.openclaw/workspace" } },
      channels: tools.channels.map((c) => ({
        platform: c.platform,
        identifier: c.identifier,
        purpose: c.purpose,
      })),
      gateway: {
        bindHost: tools.gatewayConfig.bindHost,
        port: tools.gatewayConfig.port,
        ...(tools.gatewayConfig.authToken ? { auth: { token: tools.gatewayConfig.authToken } } : {}),
      },
      skills: tools.skills.filter((s) => s.enabled),
    },
    null,
    2,
  );

  return {
    "SOUL.md": soulMd,
    "IDENTITY.md": identityMd,
    "AGENTS.md": agentsMd,
    "USER.md": userMd,
    "TOOLS.md": toolsMd,
    "HEARTBEAT.md": heartbeatMd,
    "BOOT.md": "# BOOT\n\n첫 실행 시 체크리스트를 여기에 작성하세요.\n",
    "MEMORY.md": "# MEMORY\n\n장기 기억 요약을 여기에 작성하세요.\n",
    "openclaw.json.snippet": openclawJson,
  };
}
