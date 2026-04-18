import type {
  CliFlag,
  CommandNode,
  CommandTreePhase,
  EnvVarSpec,
  ExitCodeMapping,
  HelpTemplate,
} from "@/types/phases";
import { commandToSignature } from "./command-to-signature";

interface HelpOpts {
  command?: CommandNode;
  commandParents?: string[];
  globalFlags?: CliFlag[];
  envVars?: EnvVarSpec[];
  exitCodes?: ExitCodeMapping[];
  description?: string;
  examples?: string[];
  seeAlso?: string[];
  template: HelpTemplate;
  rootBinary: string;
  agentSection?: string;
}

function header(label: string, style: HelpTemplate["headerStyle"]): string {
  if (style === "uppercase") return label.toUpperCase();
  if (style === "bold") return `**${label}**`;
  return label;
}

export function renderHelp(opts: HelpOpts): string {
  const { template, command, commandParents = [], rootBinary } = opts;
  const lines: string[] = [];

  for (const section of template.sections) {
    if (section === "usage") {
      lines.push(header("Usage", template.headerStyle));
      const usage = command
        ? `  ${commandToSignature(rootBinary, command, commandParents)}`
        : `  ${rootBinary} <command> [flags]`;
      lines.push(usage, "");
    }
    if (section === "description") {
      const desc = opts.description ?? command?.description ?? "";
      if (desc) {
        lines.push(header("Description", template.headerStyle));
        lines.push(`  ${desc}`, "");
      }
    }
    if (section === "flags") {
      const flags = [
        ...(command?.localFlags ?? []),
        ...(opts.globalFlags ?? []),
      ].filter((f) => !f.hiddenFromHelp);
      if (flags.length > 0) {
        lines.push(header("Flags", template.headerStyle));
        for (const f of flags) {
          const head = f.short ? `${f.short}, ${f.long}` : `    ${f.long}`;
          const kind = f.kind !== "boolean" ? ` <${f.kind}>` : "";
          lines.push(`  ${head}${kind}  ${f.description}`);
        }
        lines.push("");
      }
    }
    if (section === "commands") {
      const children = command?.children ?? [];
      if (children.length > 0) {
        lines.push(header("Commands", template.headerStyle));
        for (const child of children) {
          lines.push(`  ${child.name.padEnd(18)}${child.summary}`);
        }
        lines.push("");
      }
    }
    if (section === "examples") {
      const examples = (opts.examples ?? []).slice(0, template.exampleCount);
      if (examples.length > 0) {
        lines.push(header("Examples", template.headerStyle));
        for (const ex of examples) lines.push(`  ${ex}`);
        lines.push("");
      }
    }
    if (section === "env-vars" && template.sections.includes("env-vars")) {
      const envs = opts.envVars ?? [];
      if (envs.length > 0) {
        lines.push(header("Environment", template.headerStyle));
        for (const e of envs) {
          lines.push(`  ${e.name}${e.required ? " (required)" : ""}  ${e.purpose}`);
        }
        lines.push("");
      }
    }
    if (section === "exit-codes") {
      const codes = opts.exitCodes ?? [];
      if (codes.length > 0) {
        lines.push(header("Exit Codes", template.headerStyle));
        for (const c of codes) lines.push(`  ${c.code}  ${c.when}`);
        lines.push("");
      }
    }
    if (section === "see-also") {
      const seeAlso = opts.seeAlso ?? [];
      if (seeAlso.length > 0) {
        lines.push(header("See Also", template.headerStyle));
        for (const s of seeAlso) lines.push(`  ${s}`);
        lines.push("");
      }
    }
  }

  if (template.includeAgentSection && opts.agentSection) {
    lines.push(header("For Agents", template.headerStyle));
    lines.push(`  ${opts.agentSection}`, "");
  }

  return lines.join("\n");
}

export function renderRootHelp(tree: CommandTreePhase): string {
  const topLevelCommands = tree.commands.map(
    (c) => `  ${c.name.padEnd(18)}${c.summary}`,
  );
  const globalFlags = tree.globalFlags
    .filter((f) => !f.hiddenFromHelp)
    .map((f) => {
      const head = f.short ? `${f.short}, ${f.long}` : `    ${f.long}`;
      return `  ${head.padEnd(26)}${f.description}`;
    });
  const parts = [
    `USAGE\n  ${tree.rootBinary || "<binary>"} <command> [flags]`,
    "",
    topLevelCommands.length > 0
      ? `COMMANDS\n${topLevelCommands.join("\n")}`
      : "COMMANDS\n  (커맨드를 추가하세요)",
    "",
    globalFlags.length > 0 ? `GLOBAL FLAGS\n${globalFlags.join("\n")}` : "",
  ];
  return parts.filter(Boolean).join("\n");
}
