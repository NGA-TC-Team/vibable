"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function AgentSafetyPreview() {
  const { data } = usePhaseData("agentSafety");

  if (!data) {
    return <p className="text-sm text-muted-foreground">안전·테스트 데이터가 없습니다.</p>;
  }

  return (
    <pre className="max-h-[28rem] overflow-auto text-xs">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
