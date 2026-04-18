import type { CliFlag, CommandNode } from "@/types/phases";

function formatFlag(flag: CliFlag): string {
  const head = flag.short ? `${flag.short}/${flag.long}` : flag.long;
  if (flag.kind === "boolean") return `[${head}]`;
  const valueHint =
    flag.kind === "enum" && flag.enumValues
      ? flag.enumValues.join("|")
      : flag.kind.toUpperCase();
  const token = `${head} <${valueHint}>`;
  return flag.required ? token : `[${token}]`;
}

function formatPositional(p: {
  name: string;
  kind: "required" | "optional" | "variadic";
}): string {
  if (p.kind === "required") return `<${p.name}>`;
  if (p.kind === "optional") return `[${p.name}]`;
  return `[${p.name}...]`;
}

export function commandToSignature(
  rootBinary: string,
  command: CommandNode,
  parents: string[] = [],
): string {
  const chain = [rootBinary, ...parents, command.name].filter(Boolean).join(" ");
  const positional = command.positional.map(formatPositional).join(" ");
  const flags = command.localFlags
    .filter((f) => !f.hiddenFromHelp)
    .map(formatFlag)
    .join(" ");
  return [chain, positional, flags].filter(Boolean).join(" ");
}

export function flattenCommands(
  nodes: CommandNode[],
  parents: string[] = [],
): { node: CommandNode; parents: string[] }[] {
  const out: { node: CommandNode; parents: string[] }[] = [];
  for (const node of nodes) {
    out.push({ node, parents });
    if (node.children.length > 0) {
      out.push(...flattenCommands(node.children, [...parents, node.name]));
    }
  }
  return out;
}
