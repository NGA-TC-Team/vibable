"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function ClaudePipelinePreview() {
  const { data } = usePhaseData("agentArchitecture");

  if (!data || data.kind !== "claude-subagent") {
    return <p className="text-sm text-muted-foreground">Claude 파이프라인 데이터가 없습니다.</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      <p>
        <span className="font-medium">패턴:</span> {data.claude.pattern}
      </p>
      <div>
        <h3 className="mb-2 font-semibold">에이전트</h3>
        <ul className="space-y-2">
          {data.claude.agents.map((a) => (
            <li key={a.id} className="rounded-md border p-2 text-xs">
              <span className="font-medium">{a.name || a.id}</span> — {a.role}
              <p className="mt-1 text-muted-foreground">{a.description}</p>
            </li>
          ))}
        </ul>
      </div>
      <pre className="max-h-64 overflow-auto rounded-md bg-muted/50 p-3 text-xs">
        {JSON.stringify({ delegationRules: data.claude.delegationRules, dataFlow: data.claude.dataFlow }, null, 2)}
      </pre>
    </div>
  );
}
