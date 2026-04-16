"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function ClaudeBehaviorPreview() {
  const { data } = usePhaseData("agentBehavior");

  if (!data || data.kind !== "claude-subagent") {
    return <p className="text-sm text-muted-foreground">행동 설계 데이터가 없습니다.</p>;
  }

  return (
    <div className="space-y-4">
      {data.behaviors.map((b, i) => (
        <div key={i} className="rounded-md border p-3 text-sm">
          <p className="font-medium">
            agentId: {b.agentId} · color: {b.color}
          </p>
          <pre className="mt-2 max-h-48 overflow-auto whitespace-pre-wrap text-xs text-muted-foreground">
            {b.systemPrompt || "(프롬프트 없음)"}
          </pre>
        </div>
      ))}
    </div>
  );
}
