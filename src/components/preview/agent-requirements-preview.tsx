"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";

export function AgentRequirementsPreview() {
  const { data } = usePhaseData("agentRequirements");
  const agentSubType = useEditorStore((s) => s.agentSubType);

  if (!data) {
    return <p className="text-sm text-muted-foreground">에이전트 요구사항 데이터가 없습니다.</p>;
  }

  return (
    <div className="space-y-4 text-sm">
      <div>
        <h3 className="mb-2 font-semibold">기능 요구사항</h3>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          {data.functional.map((f) => (
            <li key={f.id}>{f.title || f.id}</li>
          ))}
        </ul>
      </div>
      {agentSubType === "claude-subagent" && data.claude && (
        <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">
          {JSON.stringify(data.claude, null, 2)}
        </pre>
      )}
      {agentSubType === "openclaw" && data.openclaw && (
        <pre className="overflow-x-auto rounded-md bg-muted/50 p-3 text-xs">
          {JSON.stringify(data.openclaw, null, 2)}
        </pre>
      )}
    </div>
  );
}
