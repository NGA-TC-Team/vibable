"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

export function ScreenDesignPreview() {
  const { data } = usePhaseData("screenDesign");
  if (!data) return null;

  return (
    <div className="space-y-4 text-sm">
      <h2 className="text-base font-semibold">화면 설계</h2>
      {data.pages.length === 0 ? (
        <p className="text-muted-foreground/50 italic">화면을 추가하세요</p>
      ) : (
        data.pages.map((page) => (
          <div key={page.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-baseline gap-2">
              <span className="font-medium">{page.name || "이름 없음"}</span>
              {page.route && <span className="text-xs text-muted-foreground">{page.route}</span>}
            </div>
            {(page.uxIntent.userGoal || page.uxIntent.businessIntent) && (
              <div className="text-muted-foreground">
                {page.uxIntent.userGoal && <p>유저 목표: {page.uxIntent.userGoal}</p>}
                {page.uxIntent.businessIntent && <p>비즈니스: {page.uxIntent.businessIntent}</p>}
              </div>
            )}
            {page.interactions.length > 0 && (
              <div>
                <p className="text-xs font-medium">인터랙션</p>
                <ul className="ml-4 list-disc text-muted-foreground">
                  {page.interactions.map((int, i) => (
                    <li key={i}>{int.element} [{int.trigger}] → {int.action}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
