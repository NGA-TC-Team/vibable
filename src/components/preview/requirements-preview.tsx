"use client";

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
            <div key={r.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{r.id}</span>
                <Badge variant={priorityColor[r.priority]}>{r.priority.toUpperCase()}</Badge>
              </div>
              <p className="font-medium">{r.title}</p>
              <p className="text-muted-foreground">{r.description}</p>
              {r.acceptanceCriteria.length > 0 && (
                <ul className="ml-4 list-disc text-muted-foreground">
                  {r.acceptanceCriteria.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
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
