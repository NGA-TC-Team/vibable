"use client";

import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { Persona, UserStory } from "@/types/phases";

export function UserScenarioForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("userScenario");
  if (!data) return null;

  const addPersona = () => {
    const p: Persona = {
      id: crypto.randomUUID(),
      name: "",
      role: "",
      painPoints: [],
      goals: [],
    };
    patchData({ personas: [...data.personas, p] });
  };

  const updatePersona = (index: number, patch: Partial<Persona>) => {
    const personas = [...data.personas];
    personas[index] = { ...personas[index], ...patch };
    patchData({ personas });
  };

  const removePersona = (index: number) => {
    patchData({ personas: data.personas.filter((_, i) => i !== index) });
  };

  const addStory = () => {
    const s: UserStory = {
      id: crypto.randomUUID(),
      personaId: data.personas[0]?.id ?? "",
      asA: "",
      iWant: "",
      soThat: "",
    };
    patchData({ userStories: [...data.userStories, s] });
  };

  const updateStory = (index: number, patch: Partial<UserStory>) => {
    const stories = [...data.userStories];
    stories[index] = { ...stories[index], ...patch };
    patchData({ userStories: stories });
  };

  const removeStory = (index: number) => {
    patchData({ userStories: data.userStories.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      {/* Personas */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">페르소나</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addPersona}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </div>
        {data.personas.map((persona, i) => (
          <div key={persona.id} className="rounded-lg border p-3 space-y-3">
            <div className="flex items-start justify-between">
              <div className="grid flex-1 grid-cols-2 gap-2">
                <Input
                  placeholder="이름"
                  value={persona.name}
                  onChange={(e) => updatePersona(i, { name: e.target.value })}
                  disabled={disabled}
                />
                <Input
                  placeholder="역할"
                  value={persona.role}
                  onChange={(e) => updatePersona(i, { role: e.target.value })}
                  disabled={disabled}
                />
              </div>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removePersona(i)}
                  className="ml-2"
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">페인 포인트</Label>
              <StringList
                items={persona.painPoints}
                onChange={(painPoints) => updatePersona(i, { painPoints })}
                placeholder="페인 포인트"
                disabled={disabled}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">목표</Label>
              <StringList
                items={persona.goals}
                onChange={(goals) => updatePersona(i, { goals })}
                placeholder="목표"
                disabled={disabled}
              />
            </div>
          </div>
        ))}
      </section>

      {/* User Stories */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">유저 스토리</Label>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addStory}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </div>
        {data.userStories.map((story, i) => (
          <div key={story.id} className="rounded-lg border p-3 space-y-2">
            <div className="flex items-start justify-between">
              <Select
                value={story.personaId}
                onValueChange={(v) => updateStory(i, { personaId: v })}
                disabled={disabled}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="페르소나" />
                </SelectTrigger>
                <SelectContent>
                  {data.personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name || "이름 없음"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!disabled && (
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeStory(i)}
                >
                  <X className="size-3.5" />
                </Button>
              )}
            </div>
            <Input
              placeholder="As a (역할로서)"
              value={story.asA}
              onChange={(e) => updateStory(i, { asA: e.target.value })}
              disabled={disabled}
            />
            <Input
              placeholder="I want (원하는 것)"
              value={story.iWant}
              onChange={(e) => updateStory(i, { iWant: e.target.value })}
              disabled={disabled}
            />
            <Input
              placeholder="So that (달성하고 싶은 것)"
              value={story.soThat}
              onChange={(e) => updateStory(i, { soThat: e.target.value })}
              disabled={disabled}
            />
          </div>
        ))}
      </section>

      {/* Scenarios */}
      <section className="space-y-2">
        <Label className="text-base font-semibold">성공 시나리오</Label>
        <StringList
          items={data.successScenarios}
          onChange={(successScenarios) => patchData({ successScenarios })}
          placeholder="성공 시나리오"
          disabled={disabled}
        />
      </section>

      <section className="space-y-2">
        <Label className="text-base font-semibold">실패 시나리오</Label>
        <StringList
          items={data.failureScenarios}
          onChange={(failureScenarios) => patchData({ failureScenarios })}
          placeholder="실패 시나리오"
          disabled={disabled}
        />
      </section>
    </div>
  );
}
