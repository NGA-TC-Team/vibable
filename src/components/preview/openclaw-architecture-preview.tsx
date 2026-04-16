"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function OpenClawArchitecturePreview() {
  const { data } = usePhaseData("agentArchitecture");

  if (!data || data.kind !== "openclaw") {
    return <p className="text-sm text-muted-foreground">OpenClaw 아키텍처 데이터가 없습니다.</p>;
  }

  return (
    <pre className="max-h-[28rem] overflow-auto text-xs">
      {JSON.stringify(data.openclaw, null, 2)}
    </pre>
  );
}
