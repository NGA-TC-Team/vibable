"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";
import type { EntityField } from "@/types/phases";

const distributedStrategyLabels = {
  primaryReplica: "Primary + Replica",
  sharded: "Sharding",
  multiRegion: "Multi-region",
} as const;

function formatFieldType(field: EntityField) {
  if (field.type !== "relation") {
    return field.type;
  }

  const target =
    field.relationTarget && field.relationTargetField
      ? `${field.relationTarget}.${field.relationTargetField}`
      : field.relationTarget;

  const actions = [field.onDelete, field.onUpdate].filter(Boolean);

  return [
    field.type,
    target ? `-> ${target}` : "",
    field.relationType ? `(${field.relationType})` : "",
    actions.length > 0 ? `[${actions.join(" / ")}]` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export function DataModelPreview() {
  const { data } = usePhaseData("dataModel");
  if (!data) return null;

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-base font-semibold">데이터 모델</h2>
      {data.entities.length === 0 ? (
        <p className="text-muted-foreground/50 italic">엔티티를 추가하세요</p>
      ) : (
        data.entities.map((entity) => (
          <div key={entity.id} className="rounded-lg border overflow-hidden">
            <div className="bg-muted px-3 py-1.5 font-medium">{entity.name || "이름 없음"}</div>
            {entity.fields.length > 0 && (
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-muted-foreground">
                    <th className="px-3 py-1 text-left">필드</th>
                    <th className="px-3 py-1 text-left">타입</th>
                    <th className="px-3 py-1 text-left">필수</th>
                  </tr>
                </thead>
                <tbody>
                  {entity.fields.map((f, i) => (
                    <tr key={i} className="border-b last:border-0">
                      <td className="px-3 py-1">{f.name}</td>
                      <td className="px-3 py-1 font-mono">
                        {formatFieldType(f)}
                      </td>
                      <td className="px-3 py-1">{f.required ? "Y" : "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))
      )}
      <div className="text-muted-foreground">
        <p>
          저장 전략: {data.storageStrategy}
          {data.storageStrategy === "distributed" && data.distributedStrategy
            ? ` (${distributedStrategyLabels[data.distributedStrategy]})`
            : ""}
        </p>
        {data.storageNotes && <p>{data.storageNotes}</p>}
      </div>
    </div>
  );
}
