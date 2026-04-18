"use client";

import { useMemo, useState } from "react";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { TerminalBlock } from "@/components/preview/terminal/terminal-block";
import { flattenCommands } from "@/lib/cli/command-to-signature";

export function CliContractPreview() {
  const { data } = usePhaseData("cliContract");
  const { data: tree } = usePhaseData("commandTree");
  const [activeIdx, setActiveIdx] = useState(0);

  const labels = useMemo(() => {
    if (!tree) return new Map<string, string>();
    const m = new Map<string, string>();
    for (const { node, parents } of flattenCommands(tree.commands)) {
      m.set(node.id, [...parents, node.name].filter(Boolean).join(" "));
    }
    return m;
  }, [tree]);

  if (!data) return null;

  const active = data.contracts[activeIdx];

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {data.contracts.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActiveIdx(i)}
            className={`rounded-md border px-2 py-1 text-xs ${
              activeIdx === i
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {labels.get(c.commandId) ?? "(unknown)"}
          </button>
        ))}
      </div>
      {active ? (
        <div className="space-y-3">
          <section className="rounded border p-3 text-xs">
            <h4 className="mb-1 font-semibold">I/O 요약</h4>
            <dl className="grid grid-cols-2 gap-1">
              <dt className="text-muted-foreground">stdin</dt>
              <dd>{active.stdinFormat}</dd>
              <dt className="text-muted-foreground">stdout 모드</dt>
              <dd>{active.stdoutModes.join(", ")}</dd>
              <dt className="text-muted-foreground">기본 모드</dt>
              <dd>{active.defaultMode}</dd>
              <dt className="text-muted-foreground">schema version</dt>
              <dd>{active.stdoutSchemaVersion || "—"}</dd>
              <dt className="text-muted-foreground">스트리밍</dt>
              <dd>{active.streaming}</dd>
              <dt className="text-muted-foreground">멱등 / 재시도</dt>
              <dd>
                {active.idempotent ? "멱등" : "비멱등"} ·{" "}
                {active.safeToRetry ? "retry-safe" : "no-retry"}
              </dd>
            </dl>
          </section>

          <section>
            <h4 className="mb-1 text-sm font-semibold">Exit Codes</h4>
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="p-1 text-left">코드</th>
                  <th className="p-1 text-left">카테고리</th>
                  <th className="p-1 text-left">조건</th>
                </tr>
              </thead>
              <tbody>
                {active.exitCodes.map((ec, i) => (
                  <tr key={i} className="border-b">
                    <td className="p-1 font-mono">{ec.code}</td>
                    <td className="p-1 text-muted-foreground">{ec.category}</td>
                    <td className="p-1">{ec.when}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {active.samples.length > 0 && (
            <section className="space-y-2">
              <h4 className="text-sm font-semibold">샘플</h4>
              {active.samples.map((s, i) => (
                <div key={i}>
                  <TerminalBlock
                    title={s.label || s.invocation}
                    mode={s.mode}
                  >
                    {[
                      `$ ${s.invocation}`,
                      s.stdout,
                      s.stderr ? `# stderr\n${s.stderr}` : "",
                      `# exit ${s.exitCode}`,
                    ]
                      .filter(Boolean)
                      .join("\n")}
                  </TerminalBlock>
                </div>
              ))}
            </section>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">계약을 추가하세요.</p>
      )}
    </div>
  );
}
