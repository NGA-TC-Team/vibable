"use client";

import { CheckSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePhaseData } from "@/hooks/use-phase.hook";

const priorityColor = {
  must: "default",
  should: "secondary",
  could: "outline",
  wont: "outline",
} as const;

export function RequirementsPreview() {
  const { data } = usePhaseData("requirements");
  if (!data) return null;

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <h2 className="text-base font-semibold">기능 요구사항</h2>
        {data.functional.length === 0 ? (
          <p className="text-muted-foreground/50 italic">요구사항을 추가하세요</p>
        ) : (
          data.functional.map((r) => (
            <div key={r.id} className="rounded-lg border p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <Badge variant={priorityColor[r.priority]}>{r.priority.toUpperCase()}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">제목</p>
                <p className="font-medium">{r.title}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">설명</p>
                <p className="text-muted-foreground">{r.description}</p>
              </div>
              {r.acceptanceCriteria.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">수용 기준</p>
                  <ul className="space-y-1">
                    {r.acceptanceCriteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-muted-foreground">
                        <CheckSquare className="mt-0.5 size-3.5 shrink-0 text-primary" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      {data.nonFunctional.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">비기능 요구사항</h2>
          {data.nonFunctional.map((r) => (
            <div key={r.id} className="flex gap-2 text-muted-foreground">
              <span className="font-mono text-xs">{r.id}</span>
              <Badge variant="outline">{r.category}</Badge>
              <span>{r.description}</span>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
