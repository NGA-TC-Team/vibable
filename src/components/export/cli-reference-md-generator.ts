import { commandToSignature, flattenCommands } from "@/lib/cli/command-to-signature";
import type { Project } from "@/types/phases";

function section(title: string, body: string): string {
  return `## ${title}\n\n${body}\n`;
}

function codeBlock(lang: string, body: string): string {
  return `\`\`\`${lang}\n${body}\n\`\`\``;
}

export function generateCliReferenceMd(project: Project): string {
  const { overview, cliRequirements, commandTree, cliContract, cliConfig, cliTerminalUx } =
    project.phases;
  const binary =
    commandTree?.rootBinary || overview.cliMeta?.binaryName || project.name;
  const lines: string[] = [];

  lines.push(`# ${binary} — CLI Reference`);
  lines.push("");
  if (overview.elevatorPitch) lines.push(`> ${overview.elevatorPitch}`);
  if (overview.background) lines.push("", overview.background);
  lines.push("");

  // OVERVIEW
  if (overview.coreValueProposition) {
    lines.push(section("Overview", overview.coreValueProposition));
  }

  // INSTALL
  const channels = overview.cliMeta?.distributionChannels ?? [];
  if (channels.length > 0) {
    const installSamples = channels
      .map((c) => {
        if (c === "homebrew") return `brew install ${binary}`;
        if (c === "npm") return `npm install -g ${binary}`;
        if (c === "cargo") return `cargo install ${binary}`;
        if (c === "pip") return `pip install ${binary}`;
        if (c === "go-install") return `go install example.com/${binary}@latest`;
        if (c === "docker") return `docker run --rm ${binary}`;
        return `# ${c}: 설치 안내 필요`;
      })
      .join("\n");
    lines.push(section("Install", codeBlock("sh", installSamples)));
  }

  // USAGE
  lines.push(
    section(
      "Usage",
      codeBlock("sh", `${binary} [GLOBAL_FLAGS] <command> [ARGS]`),
    ),
  );

  // GLOBAL FLAGS
  if (commandTree && commandTree.globalFlags.length > 0) {
    const table = [
      "| Flag | Kind | Description |",
      "|------|------|-------------|",
      ...commandTree.globalFlags
        .filter((f) => !f.hiddenFromHelp)
        .map(
          (f) =>
            `| \`${f.short ? `${f.short}, ${f.long}` : f.long}\` | ${f.kind} | ${f.description} |`,
        ),
    ].join("\n");
    lines.push(section("Global Flags", table));
  }

  // COMMANDS
  if (commandTree && commandTree.commands.length > 0) {
    const commandLines: string[] = [];
    for (const { node, parents } of flattenCommands(commandTree.commands)) {
      const sig = commandToSignature(binary, node, parents);
      commandLines.push(`### \`${sig}\``);
      commandLines.push("");
      if (node.summary) commandLines.push(node.summary);
      if (node.description && node.description !== node.summary) {
        commandLines.push("", node.description);
      }
      if (node.aliases.length > 0) {
        commandLines.push("", `**Aliases:** ${node.aliases.map((a) => `\`${a}\``).join(", ")}`);
      }
      if (node.localFlags.length > 0) {
        commandLines.push("", "**Flags:**");
        for (const f of node.localFlags) {
          const head = f.short ? `\`${f.short}, ${f.long}\`` : `\`${f.long}\``;
          commandLines.push(`- ${head} — ${f.description}`);
        }
      }
      if (!node.agentSafe) {
        commandLines.push("", "> ⚠️  이 커맨드는 **agent-unsafe**로 표기되었습니다 (파괴적/비멱등).");
      }
      commandLines.push("");
    }
    lines.push(section("Commands", commandLines.join("\n")));
  }

  // CONFIGURATION
  if (cliConfig && cliConfig.configFiles.length > 0) {
    const body = cliConfig.configFiles
      .map(
        (cf) =>
          `### \`${cf.format}\` — ${cf.description}\n\n**Priority:**\n${cf.locationPriority
            .map((p, i) => `${i + 1}. \`${p}\``)
            .join("\n")}\n\n**Merge:** ${cf.mergeStrategy}`,
      )
      .join("\n\n");
    lines.push(section("Configuration", body));
  }

  // ENVIRONMENT VARIABLES
  if (cliConfig && cliConfig.envVars.length > 0) {
    const body = [
      "| Name | Required | Sensitive | Purpose |",
      "|------|----------|-----------|---------|",
      ...cliConfig.envVars.map(
        (ev) =>
          `| \`${ev.name}\` | ${ev.required ? "Yes" : "No"} | ${ev.sensitive ? "Yes" : "No"} | ${ev.purpose} |`,
      ),
    ].join("\n");
    lines.push(section("Environment Variables", body));
  }

  // EXIT CODES
  if (cliContract && cliContract.contracts.length > 0) {
    const codeMap = new Map<number, { when: string; category: string }>();
    for (const c of cliContract.contracts) {
      for (const ec of c.exitCodes) {
        if (!codeMap.has(ec.code)) codeMap.set(ec.code, { when: ec.when, category: ec.category });
      }
    }
    if (codeMap.size > 0) {
      const body = [
        "| Code | Category | When |",
        "|------|----------|------|",
        ...Array.from(codeMap.entries())
          .sort((a, b) => a[0] - b[0])
          .map(([code, v]) => `| ${code} | ${v.category} | ${v.when} |`),
      ].join("\n");
      lines.push(section("Exit Codes", body));
    }
  }

  // OUTPUT SCHEMAS
  if (cliConfig && cliConfig.outputSchemas.length > 0) {
    const body = cliConfig.outputSchemas
      .map(
        (os) =>
          `### ${os.describes} (v${os.version}, ${os.stabilityGuarantee})\n\n${codeBlock("json", os.jsonSchema)}`,
      )
      .join("\n\n");
    lines.push(section("Output Schemas (for --json)", body));
  }

  // EXAMPLES
  if (cliContract) {
    const samples = cliContract.contracts.flatMap((c) => c.samples);
    if (samples.length > 0) {
      const body = samples
        .map(
          (s) =>
            `### ${s.label || s.invocation} (${s.mode})\n\n${codeBlock("sh", `$ ${s.invocation}\n${s.stdout}\n# exit ${s.exitCode}`)}`,
        )
        .join("\n\n");
      lines.push(section("Examples", body));
    }
  }

  // AGENT GUIDE
  if (cliTerminalUx) {
    const cl = cliTerminalUx.agentChecklist;
    const bridge = cl.mcpBridge;
    const body = [
      `이 CLI는 AI 에이전트 호출에 대해 다음을 보장합니다:`,
      "",
      `- [${cl.stableJsonOutput ? "x" : " "}] --json 안정 스키마`,
      `- [${cl.nonInteractiveFallback ? "x" : " "}] 비대화식 경로`,
      `- [${cl.respectsTtyAndNoColor ? "x" : " "}] NO_COLOR/isatty 존중`,
      `- [${cl.semanticExitCodes ? "x" : " "}] 의미 있는 exit code (sysexits)`,
      `- [${cl.streamingEvents ? "x" : " "}] NDJSON 스트리밍`,
      `- [${cl.deterministicOutput ? "x" : " "}] 결정론적 출력`,
      `- [${cl.nonInteractiveAuth ? "x" : " "}] 비대화식 인증`,
      `- [${cl.tokenEfficient ? "x" : " "}] 토큰 효율`,
      ``,
      `**MCP Bridge:** ${bridge === "native" ? "네이티브 지원" : bridge === "wrapper" ? "래퍼 서브커맨드 제공" : "미제공"}`,
    ].join("\n");
    lines.push(section("Agent Guide", body));
  }

  return lines.join("\n");
}
