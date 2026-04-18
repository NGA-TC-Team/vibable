import type { CommandNode, CommandTreePhase } from "@/types/phases";
import { commandToSignature, flattenCommands } from "./command-to-signature";

/** 매우 경량 man(1) 스타일 텍스트 프리뷰 (실 roff 아님) */
export function renderManpage(tree: CommandTreePhase): string {
  const binary = tree.rootBinary || "<binary>";
  const lines: string[] = [];
  lines.push(`${binary.toUpperCase()}(1)`);
  lines.push("");
  lines.push("NAME");
  lines.push(`    ${binary} - ${tree.commands[0]?.summary ?? "command line tool"}`);
  lines.push("");
  lines.push("SYNOPSIS");
  lines.push(`    ${binary} [GLOBAL-FLAGS] <command> [ARGS]`);
  lines.push("");

  lines.push("DESCRIPTION");
  lines.push(`    ${tree.commands[0]?.description ?? ""}`);
  lines.push("");

  const all = flattenCommands(tree.commands);
  if (all.length > 0) {
    lines.push("COMMANDS");
    for (const { node, parents } of all) {
      lines.push(`    ${commandToSignature(binary, node, parents)}`);
      if (node.summary) lines.push(`        ${node.summary}`);
    }
    lines.push("");
  }

  if (tree.globalFlags.length > 0) {
    lines.push("GLOBAL FLAGS");
    for (const f of tree.globalFlags.filter((x) => !x.hiddenFromHelp)) {
      const head = f.short ? `${f.short}, ${f.long}` : f.long;
      lines.push(`    ${head}`);
      if (f.description) lines.push(`        ${f.description}`);
    }
  }

  return lines.join("\n");
}

export function renderCommandManSection(
  binary: string,
  command: CommandNode,
  parents: string[] = [],
): string {
  const lines: string[] = [];
  lines.push(`    ${commandToSignature(binary, command, parents)}`);
  if (command.description) lines.push(`        ${command.description}`);
  if (command.aliases.length > 0) {
    lines.push(`        ALIAS: ${command.aliases.join(", ")}`);
  }
  return lines.join("\n");
}
