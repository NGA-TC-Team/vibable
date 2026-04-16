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
import type { Persona } from "@/types/phases";

function normalizePersona(persona: Persona): Persona {
  return {
    ...persona,
    demographics: persona.demographics ?? "",
    context: persona.context ?? "",
    techProficiency: persona.techProficiency ?? "",
    behaviors: persona.behaviors ?? [],
    motivations: persona.motivations ?? [],
    needs: persona.needs ?? [],
    painPoints: persona.painPoints ?? [],
    frustrations: persona.frustrations ?? [],
    goals: persona.goals ?? [],
    successCriteria: persona.successCriteria ?? [],
    quote: persona.quote ?? "",
  };
}

export function UserScenarioPreview() {
  const { data } = usePhaseData("userScenario");
  if (!data) return null;
  const personas = data.personas.map((persona) => normalizePersona(persona));

  const personaName = (personaId: string) =>
    personas.find((p) => p.id === personaId)?.name ?? "—";
  const hasDetailedPersonaData = personas.some(
    (persona) =>
      Boolean(persona.demographics || persona.context || persona.techProficiency || persona.quote) ||
      persona.behaviors.some(Boolean) ||
      persona.motivations.some(Boolean) ||
      persona.needs.some(Boolean) ||
      persona.frustrations.some(Boolean) ||
      persona.successCriteria.some(Boolean),
  );

  return (
    <div className="space-y-6 text-sm">
      <section className="space-y-3">
        <h2 className="text-base font-semibold">페르소나</h2>
        {personas.length === 0 ? (
          <p className="text-muted-foreground/50 italic">페르소나를 추가하세요</p>
        ) : (
          <div className="space-y-3">
            {personas.map((p) => (
              <div key={p.id} className="space-y-3 rounded-xl border border-border/70 bg-background/70 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm font-semibold">{p.name || "이름 없음"}</h3>
                  <Badge variant="secondary">{p.role || "역할 없음"}</Badge>
                  {data.personaDetailLevel === "detailed" || hasDetailedPersonaData ? (
                    <Badge variant="outline">상세형</Badge>
                  ) : null}
                </div>

                {(p.demographics || p.techProficiency) ? (
                  <div className="grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                    {p.demographics ? <p><span className="font-medium text-foreground">배경:</span> {p.demographics}</p> : null}
                    {p.techProficiency ? <p><span className="font-medium text-foreground">디지털 숙련도:</span> {p.techProficiency}</p> : null}
                  </div>
                ) : null}

                {p.context ? (
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-foreground">사용 맥락</p>
                    <p className="text-xs leading-5 text-muted-foreground">{p.context}</p>
                  </div>
                ) : null}

                {p.quote ? (
                  <blockquote className="rounded-lg border-l-2 border-primary/40 bg-muted/20 px-3 py-2 text-xs italic text-muted-foreground">
                    &ldquo;{p.quote}&rdquo;
                  </blockquote>
                ) : null}

                <div className="grid gap-3 md:grid-cols-2">
                  <PersonaList title="목표" items={p.goals} />
                  <PersonaList title="페인 포인트" items={p.painPoints} />
                  <PersonaList title="핵심 니즈" items={p.needs} />
                  <PersonaList title="행동 패턴" items={p.behaviors} />
                  <PersonaList title="동기" items={p.motivations} />
                  <PersonaList title="좌절 포인트" items={p.frustrations} />
                  <PersonaList title="성공 기준" items={p.successCriteria} />
                </div>
              </div>
            ))}
          </div>
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

function PersonaList({ title, items }: { title: string; items: string[] }) {
  const visibleItems = items.filter(Boolean);
  if (visibleItems.length === 0) return null;

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-foreground">{title}</p>
      <ul className="list-disc pl-4 text-xs leading-5 text-muted-foreground">
        {visibleItems.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
