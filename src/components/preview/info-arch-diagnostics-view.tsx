"use client";

import { useMemo } from "react";
import { TriangleAlert, CircleCheck, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  diagnoseInfoArchitecture,
  groupDiagnostics,
  DIAGNOSTIC_LABELS,
  DIAGNOSTIC_SEVERITY,
  type IaDiagnostic,
  type IaDiagnosticKind,
} from "@/lib/info-arch-diagnostics";
import {
  computeIaQualityScore,
  BREAKDOWN_LABELS,
} from "@/lib/info-arch-score";
import type { InfoArchitecturePhase } from "@/types/phases";

function describe(d: IaDiagnostic): string {
  switch (d.kind) {
    case "orphan-sitemap-node":
      return `${d.label} (${d.nodeId}) — 어느 플로우에서도 사용되지 않음`;
    case "missing-screen-ref":
      return `${d.flowName} / ${d.stepId} — 연결 화면 비어있음`;
    case "unknown-screen-ref":
      return `${d.flowName} / ${d.stepId} — 사이트맵에 없는 ref: ${d.ref}`;
    case "dangling-next":
      return `${d.flowName} / ${d.stepId} → ${d.targetId} — 같은 플로우에 존재하지 않음`;
    case "flow-without-steps":
      return `${d.flowName} — 스텝이 하나도 없음`;
    case "unreachable-step":
      return `${d.flowName} / ${d.stepId} — 어느 스텝도 여기로 이어지지 않음`;
    case "node-missing-purpose":
      return `${d.label} (${d.nodeId}) — 존재 이유 미입력`;
    case "flow-missing-goal":
      return `${d.flowName} — 완료 정의(goal) 미입력`;
    case "flow-no-endings-marked":
      return `${d.flowName} — 성공/실패 종료 스텝이 하나도 표시되지 않음`;
    case "review-screen-unassigned":
      return `${d.label} (${d.nodeId}) — 검토/승인 화면인데 접근 대상(audience) 미지정`;
    case "nav-rule-missing-body":
      return `${d.ruleId} — 규칙 본문이 비어있음`;
    case "nav-rule-unknown-screen-type":
      return `${d.title} — 정의되지 않은 screenType을 적용 대상으로 지정`;
    case "unknown-role-ref":
      return `${d.where} — 등록되지 않은 역할 "${d.refName}" 참조 (${d.source})`;
    case "unknown-entity-ref":
      return `${d.label} (${d.nodeId}) — 등록되지 않은 엔티티 "${d.refName}" 참조`;
  }
}

export function InfoArchDiagnosticsView({
  ia,
}: {
  ia: InfoArchitecturePhase;
}) {
  const { diagnostics, grouped, warningCount, infoCount, score } = useMemo(() => {
    const list = diagnoseInfoArchitecture(ia);
    const grouped = groupDiagnostics(list);
    const warningCount = list.filter(
      (d) => DIAGNOSTIC_SEVERITY[d.kind] === "warning",
    ).length;
    const infoCount = list.length - warningCount;
    const score = computeIaQualityScore(ia);
    return { diagnostics: list, grouped, warningCount, infoCount, score };
  }, [ia]);

  const scoreTone =
    score.overall >= 80
      ? "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100"
      : score.overall >= 50
        ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100"
        : "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100";

  const scoreHeader = (
    <section className={`space-y-2 rounded-lg border p-3 ${scoreTone}`}>
      <div className="flex items-baseline justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide">
          IA 품질 점수
        </h3>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold tabular-nums">
            {score.overall}
          </span>
          <span className="text-xs opacity-70">/100</span>
        </div>
      </div>
      <p className="text-xs opacity-80">{score.hint}</p>
      <div className="grid grid-cols-2 gap-2 text-[11px] sm:grid-cols-5">
        {(Object.keys(score.breakdown) as Array<
          keyof typeof score.breakdown
        >).map((k) => (
          <div key={k} className="flex flex-col">
            <span className="opacity-70">{BREAKDOWN_LABELS[k]}</span>
            <span className="font-semibold tabular-nums">
              {score.breakdown[k]}
            </span>
          </div>
        ))}
      </div>
    </section>
  );

  if (diagnostics.length === 0) {
    return (
      <div className="space-y-4">
        {scoreHeader}
        <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-100">
          <CircleCheck className="size-4" />
          구조 진단 통과 — 연결·무결성·기획 의도 누락이 없습니다.
        </div>
      </div>
    );
  }

  const kinds = Object.keys(DIAGNOSTIC_LABELS) as IaDiagnosticKind[];

  return (
    <div className="space-y-4">
      {scoreHeader}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Badge variant="destructive" className="gap-1">
          <TriangleAlert className="size-3" />
          경고 {warningCount}
        </Badge>
        <Badge variant="secondary" className="gap-1">
          <Info className="size-3" />
          안내 {infoCount}
        </Badge>
      </div>

      {kinds.map((kind) => {
        const items = grouped[kind];
        if (items.length === 0) return null;
        const severity = DIAGNOSTIC_SEVERITY[kind];
        const isWarning = severity === "warning";
        return (
          <section
            key={kind}
            className={`space-y-2 rounded-lg border p-3 ${
              isWarning
                ? "border-destructive/30 bg-destructive/5"
                : "border-border bg-muted/30"
            }`}
          >
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide">
              {isWarning ? (
                <TriangleAlert className="size-3.5 text-destructive" />
              ) : (
                <Info className="size-3.5 text-muted-foreground" />
              )}
              {DIAGNOSTIC_LABELS[kind]}
              <span className="font-normal text-muted-foreground">
                · {items.length}
              </span>
            </h3>
            <ul className="space-y-1 text-xs">
              {items.map((d, i) => (
                <li key={i} className="text-muted-foreground">
                  {describe(d)}
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
