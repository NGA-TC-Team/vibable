"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function ClaudeToolsPreview() {
  const { data } = usePhaseData("agentTools");

  if (!data || data.kind !== "claude-subagent") {
    return <p className="text-sm text-muted-foreground">도구 데이터가 없습니다.</p>;
  }

  return (
    <pre className="max-h-[28rem] overflow-auto text-xs">
      {JSON.stringify(data.claude, null, 2)}
    </pre>
  );
}
