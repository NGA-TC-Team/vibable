"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function OpenClawToolsPreview() {
  const { data } = usePhaseData("agentTools");

  if (!data || data.kind !== "openclaw") {
    return <p className="text-sm text-muted-foreground">연동·도구 데이터가 없습니다.</p>;
  }

  return (
    <pre className="max-h-[28rem] overflow-auto text-xs">
      {JSON.stringify(data.openclaw, null, 2)}
    </pre>
  );
}
