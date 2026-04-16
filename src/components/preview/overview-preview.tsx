"use client";

import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePhaseData } from "@/hooks/use-phase.hook";
import {
  overviewHasSuccessMetricContent,
  overviewHasTimelineContent,
} from "@/lib/overview-groups";

function Placeholder({ text }: { text: string }) {
  return (
    <span className="italic text-muted-foreground/50">{text}</span>
  );
}

const scopeLabels: Record<string, string> = {
  mvp: "MVP",
  full: "Full",
  prototype: "Prototype",
};

export function OverviewPreview() {
  const { data } = usePhaseData("overview");
  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">
          {data.projectName || <Placeholder text="프로젝트명을 입력하세요" />}
        </h1>
        {data.elevatorPitch && (
          <p className="mt-1 text-sm text-muted-foreground">{data.elevatorPitch}</p>
        )}
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

      {data.coreValueProposition && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-muted-foreground">
            핵심 가치 제안
          </h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {data.coreValueProposition}
          </p>
        </section>
      )}

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

      {data.scope && data.scope.details && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-muted-foreground">
            프로젝트 범위
          </h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">{scopeLabels[data.scope.type] ?? data.scope.type}</Badge>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {data.scope.details}
          </p>
        </section>
      )}

      {(data.competitors?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-muted-foreground">
            경쟁사 / 대안
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>서비스명</TableHead>
                <TableHead>강점</TableHead>
                <TableHead>약점</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.competitors!.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.url ? (
                      <a href={c.url} target="_blank" rel="noopener noreferrer" className="underline">
                        {c.name}
                      </a>
                    ) : (
                      c.name
                    )}
                  </TableCell>
                  <TableCell>{c.strength}</TableCell>
                  <TableCell>{c.weakness}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}

      {(data.constraints?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-muted-foreground">
            제약사항
          </h2>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            {data.constraints!.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
        </section>
      )}

      {overviewHasSuccessMetricContent(data) && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-muted-foreground">
            성공 지표
          </h2>
          <div className="space-y-3">
            {(data.successMetricGroups?.length ?? 0) > 0
              ? data.successMetricGroups!.map((group) => (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-lg border border-border/80 bg-muted/10"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>구분</TableHead>
                          <TableHead>지표</TableHead>
                          <TableHead>목표</TableHead>
                          <TableHead>측정 방법</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="w-24 text-muted-foreground">상위</TableCell>
                          <TableCell className="font-medium">{group.parent.metric}</TableCell>
                          <TableCell>{group.parent.target}</TableCell>
                          <TableCell>{group.parent.measurement}</TableCell>
                        </TableRow>
                        {group.children.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="text-muted-foreground">하위</TableCell>
                            <TableCell className="font-medium">{m.metric}</TableCell>
                            <TableCell>{m.target}</TableCell>
                            <TableCell>{m.measurement}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>지표</TableHead>
                        <TableHead>목표</TableHead>
                        <TableHead>측정 방법</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data.successMetrics ?? []).map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.metric}</TableCell>
                          <TableCell>{m.target}</TableCell>
                          <TableCell>{m.measurement}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
          </div>
        </section>
      )}

      {overviewHasTimelineContent(data) && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-muted-foreground">
            일정
          </h2>
          <div className="space-y-3">
            {(data.milestoneGroups?.length ?? 0) > 0
              ? data.milestoneGroups!.map((group) => (
                  <div
                    key={group.id}
                    className="overflow-hidden rounded-lg border border-border/80 bg-muted/10"
                  >
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>구분</TableHead>
                          <TableHead>마일스톤</TableHead>
                          <TableHead>일정</TableHead>
                          <TableHead>설명</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        <TableRow>
                          <TableCell className="w-24 text-muted-foreground">상위</TableCell>
                          <TableCell className="font-medium">{group.parent.milestone}</TableCell>
                          <TableCell>{group.parent.date}</TableCell>
                          <TableCell>{group.parent.description}</TableCell>
                        </TableRow>
                        {group.children.map((m) => (
                          <TableRow key={m.id}>
                            <TableCell className="text-muted-foreground">하위</TableCell>
                            <TableCell className="font-medium">{m.milestone}</TableCell>
                            <TableCell>{m.date}</TableCell>
                            <TableCell>{m.description}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ))
              : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>마일스톤</TableHead>
                        <TableHead>일정</TableHead>
                        <TableHead>설명</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data.timeline ?? []).map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.milestone}</TableCell>
                          <TableCell>{m.date}</TableCell>
                          <TableCell>{m.description}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
          </div>
        </section>
      )}

      {(data.references?.length ?? 0) > 0 && (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-muted-foreground">
            참고 자료
          </h2>
          <ul className="ml-4 list-disc space-y-1 text-sm">
            {data.references!.map((r) => (
              <li key={r.id}>
                {r.url ? (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="underline">
                    {r.title}
                  </a>
                ) : (
                  <span>{r.title}</span>
                )}
                {r.notes && <span className="ml-2 text-muted-foreground">— {r.notes}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

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
