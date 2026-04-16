"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function UserScenarioPreview() {
  const { data } = usePhaseData("userScenario");
  if (!data) return null;

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <h2 className="text-base font-semibold">페르소나</h2>
        {data.personas.length === 0 ? (
          <p className="text-muted-foreground/50 italic">페르소나를 추가하세요</p>
        ) : (
          data.personas.map((p) => (
            <div key={p.id} className="rounded-lg border p-3 space-y-1">
              <p className="font-medium">{p.name || "이름 없음"} — {p.role}</p>
              {p.painPoints.length > 0 && (
                <ul className="ml-4 list-disc text-muted-foreground">
                  {p.painPoints.map((pp, i) => <li key={i}>{pp}</li>)}
                </ul>
              )}
              {p.goals.length > 0 && (
                <ul className="ml-4 list-[circle] text-muted-foreground">
                  {p.goals.map((g, i) => <li key={i}>{g}</li>)}
                </ul>
              )}
            </div>
          ))
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">유저 스토리</h2>
        {data.userStories.map((s) => (
          <div key={s.id} className="rounded-lg border p-3">
            <p><strong>As a</strong> {s.asA}, <strong>I want</strong> {s.iWant}, <strong>so that</strong> {s.soThat}</p>
          </div>
        ))}
      </section>

      {data.successScenarios.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">성공 시나리오</h2>
          <ul className="ml-4 list-disc">{data.successScenarios.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}
      {data.failureScenarios.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold">실패 시나리오</h2>
          <ul className="ml-4 list-disc">{data.failureScenarios.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </section>
      )}
    </div>
  );
}
