"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function OpenClawBehaviorPreview() {
  const { data } = usePhaseData("agentBehavior");

  if (!data || data.kind !== "openclaw") {
    return <p className="text-sm text-muted-foreground">OpenClaw 행동 데이터가 없습니다.</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="font-semibold">SOUL</h3>
        <p className="mt-1 whitespace-pre-wrap text-muted-foreground">
          {data.openclaw.soul.personality || "—"}
        </p>
      </div>
      <div>
        <h3 className="font-semibold">IDENTITY</h3>
        <p>{data.openclaw.identity.agentName}</p>
        <p className="text-muted-foreground">{data.openclaw.identity.selfIntroduction}</p>
      </div>
      <pre className="max-h-48 overflow-auto rounded-md bg-muted/50 p-3 text-xs">
        {JSON.stringify({ heartbeat: data.openclaw.heartbeat }, null, 2)}
      </pre>
    </div>
  );
}
