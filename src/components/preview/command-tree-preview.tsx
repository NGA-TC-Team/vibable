"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";
import { TerminalBlock } from "@/components/preview/terminal/terminal-block";
import { renderRootHelp } from "@/lib/cli/help-renderer";
import { commandToSignature } from "@/lib/cli/command-to-signature";
import type { CommandNode } from "@/types/phases";

function TreeNode({
  node,
  depth,
  rootBinary,
  parents,
}: {
  node: CommandNode;
  depth: number;
  rootBinary: string;
  parents: string[];
}) {
  return (
    <div>
      <div className="flex items-center gap-2 py-0.5 text-xs">
        <span style={{ marginLeft: depth * 14 }}>
          {depth > 0 ? "└─ " : ""}
        </span>
        <code className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
          {node.name || "(이름 없음)"}
        </code>
        {node.stability !== "stable" && (
          <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[10px] text-amber-700 dark:text-amber-400">
            {node.stability}
          </span>
        )}
        {!node.agentSafe && (
          <span className="rounded bg-red-500/15 px-1 py-0.5 text-[10px] text-red-700 dark:text-red-400">
            agent-unsafe
          </span>
        )}
        {node.summary && (
          <span className="text-muted-foreground">— {node.summary}</span>
        )}
      </div>
      <div className="ml-6 font-mono text-[10px] text-muted-foreground">
        {commandToSignature(rootBinary, node, parents)}
      </div>
      {node.children.map((child) => (
        <TreeNode
          key={child.id}
          node={child}
          depth={depth + 1}
          rootBinary={rootBinary}
          parents={[...parents, node.name]}
        />
      ))}
    </div>
  );
}

export function CommandTreePreview() {
  const { data } = usePhaseData("commandTree");

  if (!data) return null;

  const rootBinary = data.rootBinary || "<binary>";

  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-1 text-base font-semibold">
          {rootBinary}{" "}
          <span className="text-xs font-normal text-muted-foreground">
            ({data.convention})
          </span>
        </h3>
        {data.commands.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            아직 커맨드가 없습니다.
          </p>
        ) : (
          <div className="rounded border p-2">
            {data.commands.map((c) => (
              <TreeNode
                key={c.id}
                node={c}
                depth={0}
                rootBinary={rootBinary}
                parents={[]}
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-1 text-base font-semibold">$ {rootBinary} --help</h3>
        <TerminalBlock title={`${rootBinary} --help`}>
          {renderRootHelp(data)}
        </TerminalBlock>
      </section>

      {data.globalFlags.length > 0 && (
        <section>
          <h3 className="mb-1 text-sm font-medium">글로벌 플래그</h3>
          <ul className="space-y-0.5 text-xs">
            {data.globalFlags.map((f) => (
              <li key={f.id} className="font-mono">
                <code className="text-primary">
                  {f.short ? `${f.short}, ${f.long}` : f.long}
                </code>
                <span className="ml-2 text-muted-foreground">{f.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
