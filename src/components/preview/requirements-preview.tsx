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

const clarificationColor = {
  open: "destructive",
  answered: "default",
  deferred: "secondary",
} as const;

const constraintCategoryLabel = {
  policy: "정책",
  legal: "법/규제",
  budget: "예산",
  schedule: "일정",
  legacySystem: "레거시",
  other: "기타",
} as const;

const glossaryKindLabel = {
  role: "역할",
  state: "상태",
  entity: "객체",
  rule: "규칙",
  term: "용어",
} as const;

const clarificationStatusLabel = {
  open: "미해결",
  answered: "확인됨",
  deferred: "보류",
} as const;

export function RequirementsPreview() {
  const { data } = usePhaseData("requirements");
  if (!data) return null;

  const constraints = data.constraints ?? [];
  const glossary = data.glossary ?? [];
  const clarifications = data.clarifications ?? [];

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
              {r.statement?.trim() && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">규격 문장</p>
                  <p className="italic">{r.statement}</p>
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground">설명</p>
                <p className="text-muted-foreground">{r.description}</p>
              </div>
              {r.rationale?.trim() && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">근거</p>
                  <p className="text-muted-foreground">{r.rationale}</p>
                </div>
              )}
              {r.source?.trim() && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">출처</p>
                  <p className="text-muted-foreground">{r.source}</p>
                </div>
              )}
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

      {glossary.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">용어 정의</h2>
          <dl className="space-y-2">
            {glossary.map((g) => (
              <div key={g.id} className="rounded-lg border p-3">
                <dt className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{g.id}</span>
                  <Badge variant="outline">{glossaryKindLabel[g.kind]}</Badge>
                  <span className="font-semibold">{g.term}</span>
                </dt>
                <dd className="mt-1 text-muted-foreground">{g.definition}</dd>
                {g.aliases.length > 0 && (
                  <dd className="mt-1 text-xs text-muted-foreground">
                    동의어: {g.aliases.join(", ")}
                  </dd>
                )}
              </div>
            ))}
          </dl>
        </section>
      )}

      {constraints.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">제약조건</h2>
          {constraints.map((c) => (
            <div key={c.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                <Badge variant="outline">{constraintCategoryLabel[c.category]}</Badge>
              </div>
              <p>{c.description}</p>
              {c.source?.trim() && (
                <p className="text-xs text-muted-foreground">출처: {c.source}</p>
              )}
              {c.impact?.trim() && (
                <p className="text-xs text-muted-foreground">영향: {c.impact}</p>
              )}
            </div>
          ))}
        </section>
      )}

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

      {clarifications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">미해결 · 확인 필요</h2>
          {clarifications.map((c) => (
            <div key={c.id} className="rounded-lg border p-3 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-muted-foreground">{c.id}</span>
                <Badge variant={clarificationColor[c.status]}>
                  {clarificationStatusLabel[c.status]}
                </Badge>
                {c.owner?.trim() && (
                  <span className="text-xs text-muted-foreground">담당: {c.owner}</span>
                )}
              </div>
              <p className="font-medium">{c.question}</p>
              {c.context?.trim() && (
                <p className="text-xs text-muted-foreground">맥락: {c.context}</p>
              )}
              {c.answer?.trim() && (
                <p className="text-sm text-muted-foreground">→ {c.answer}</p>
              )}
              {c.blocksRequirementIds.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  영향: {c.blocksRequirementIds.join(", ")}
                </p>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
