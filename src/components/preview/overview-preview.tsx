"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";

function Placeholder({ text }: { text: string }) {
  return (
    <span className="italic text-muted-foreground/50">{text}</span>
  );
}

export function OverviewPreview() {
  const { data } = usePhaseData("overview");
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {data.projectName || <Placeholder text="프로젝트명을 입력하세요" />}
        </h1>
      </div>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-muted-foreground">
          개발 배경
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {data.background || (
            <Placeholder text="개발 배경을 입력하세요" />
          )}
        </p>
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-muted-foreground">
          비즈니스 목표
        </h2>
        {data.businessGoals.length > 0 ? (
          <ul className="ml-4 list-disc space-y-1 text-sm">
            {data.businessGoals.map((goal, i) => (
              <li key={i}>{goal || <Placeholder text="목표" />}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm">
            <Placeholder text="목표를 추가하세요" />
          </p>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-base font-semibold text-muted-foreground">
          타깃 유저
        </h2>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {data.targetUsers || (
            <Placeholder text="타깃 유저를 입력하세요" />
          )}
        </p>
      </section>

      {data.techStack && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-muted-foreground">
            기술 스택
          </h2>
          <p className="text-sm">{data.techStack}</p>
        </section>
      )}
    </div>
  );
}
