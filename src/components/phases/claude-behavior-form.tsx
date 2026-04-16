"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { ClaudeAgentBehavior } from "@/types/phases";

export function ClaudeBehaviorForm({ disabled = false }: { disabled?: boolean }) {
  const { data: arch } = usePhaseData("agentArchitecture");
  const { data, setData } = usePhaseData("agentBehavior");

  if (!data || data.kind !== "claude-subagent") return null;

  const agentIds =
    arch?.kind === "claude-subagent"
      ? arch.claude.agents.map((a) => ({ id: a.id, label: a.name || a.id }))
      : [];

  const { behaviors } = data;

  const setBehaviors = (next: ClaudeAgentBehavior[]) => {
    setData({ kind: "claude-subagent", behaviors: next });
  };

  const addBehavior = () => {
    const firstId = agentIds[0]?.id ?? "";
    setBehaviors([
      ...behaviors,
      {
        agentId: firstId,
        systemPrompt: "",
        coreExpertise: [],
        responsibilities: [],
        outputFormat: "",
        constraints: [],
        color: "cyan",
      },
    ]);
  };

  const updateBehavior = (index: number, patch: Partial<ClaudeAgentBehavior>) => {
    const next = [...behaviors];
    next[index] = { ...next[index], ...patch };
    setBehaviors(next);
  };

  const removeBehavior = (index: number) => {
    setBehaviors(behaviors.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="에이전트별 시스템 프롬프트">
        <div className="space-y-6">
          {behaviors.map((b, i) => (
            <div key={i} className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">행동 프로필 {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => removeBehavior(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="space-y-1">
                <FieldLabel>연결 에이전트</FieldLabel>
                <select
                  className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
                  disabled={disabled}
                  value={b.agentId}
                  onChange={(e) => updateBehavior(i, { agentId: e.target.value })}
                >
                  {agentIds.length === 0 && <option value="">(Phase3에서 에이전트 추가)</option>}
                  {agentIds.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <FieldLabel>터미널 color</FieldLabel>
                <Input
                  disabled={disabled}
                  value={b.color}
                  onChange={(e) => updateBehavior(i, { color: e.target.value })}
                  placeholder="cyan"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>시스템 프롬프트 (마크다운)</FieldLabel>
                <Textarea
                  disabled={disabled}
                  value={b.systemPrompt}
                  onChange={(e) => updateBehavior(i, { systemPrompt: e.target.value })}
                  rows={8}
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>출력 포맷</FieldLabel>
                <Textarea
                  disabled={disabled}
                  value={b.outputFormat}
                  onChange={(e) => updateBehavior(i, { outputFormat: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>전문 영역 태그</FieldLabel>
                <StringList
                  disabled={disabled}
                  items={b.coreExpertise}
                  onChange={(items) => updateBehavior(i, { coreExpertise: items })}
                  placeholder="태그"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>핵심 책임</FieldLabel>
                <StringList
                  disabled={disabled}
                  items={b.responsibilities}
                  onChange={(items) => updateBehavior(i, { responsibilities: items })}
                  placeholder="책임 한 줄"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>금지 사항</FieldLabel>
                <StringList
                  disabled={disabled}
                  items={b.constraints}
                  onChange={(items) => updateBehavior(i, { constraints: items })}
                  placeholder="금지 항목"
                />
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" disabled={disabled} onClick={addBehavior}>
            <Plus className="mr-1 size-4" />
            행동 프로필 추가
          </Button>
        </div>
      </SectionGroup>
    </div>
  );
}
