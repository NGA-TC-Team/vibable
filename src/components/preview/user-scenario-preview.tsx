"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePhaseData } from "@/hooks/use-phase.hook";

export function UserScenarioPreview() {
  const { data } = usePhaseData("userScenario");
  if (!data) return null;

  const personaName = (personaId: string) =>
    data.personas.find((p) => p.id === personaId)?.name ?? "—";

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <h2 className="text-base font-semibold">페르소나</h2>
        {data.personas.length === 0 ? (
          <p className="text-muted-foreground/50 italic">페르소나를 추가하세요</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>이름</TableHead>
                <TableHead>역할</TableHead>
                <TableHead>페인 포인트</TableHead>
                <TableHead>목표</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.personas.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name || "이름 없음"}</TableCell>
                  <TableCell>{p.role}</TableCell>
                  <TableCell>
                    {p.painPoints.filter(Boolean).length > 0 ? (
                      <ul className="list-disc pl-4">
                        {p.painPoints.filter(Boolean).map((pp, i) => (
                          <li key={i}>{pp}</li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                  <TableCell>
                    {p.goals.filter(Boolean).length > 0 ? (
                      <ul className="list-disc pl-4">
                        {p.goals.filter(Boolean).map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    ) : (
                      "—"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">유저 스토리</h2>
        {data.userStories.length === 0 ? (
          <p className="text-muted-foreground/50 italic">유저 스토리를 추가하세요</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">#</TableHead>
                <TableHead>페르소나</TableHead>
                <TableHead>As a…</TableHead>
                <TableHead>I want…</TableHead>
                <TableHead>So that…</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.userStories.map((s, i) => (
                <TableRow key={s.id}>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    US-{String(i + 1).padStart(3, "0")}
                  </TableCell>
                  <TableCell className="font-medium">{personaName(s.personaId)}</TableCell>
                  <TableCell>{s.asA}</TableCell>
                  <TableCell>{s.iWant}</TableCell>
                  <TableCell>{s.soThat}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </section>

      {(data.successScenarios.filter(Boolean).length > 0 ||
        data.failureScenarios.filter(Boolean).length > 0) && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold">시나리오</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">유형</TableHead>
                <TableHead className="w-16">#</TableHead>
                <TableHead>시나리오</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.successScenarios.filter(Boolean).map((s, i) => (
                <TableRow key={`s-${i}`}>
                  <TableCell>✅</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    S-{i + 1}
                  </TableCell>
                  <TableCell>{s}</TableCell>
                </TableRow>
              ))}
              {data.failureScenarios.filter(Boolean).map((s, i) => (
                <TableRow key={`f-${i}`}>
                  <TableCell>❌</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    F-{i + 1}
                  </TableCell>
                  <TableCell>{s}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </section>
      )}
    </div>
  );
}
