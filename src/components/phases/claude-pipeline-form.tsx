"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { AgentDefinition, PipelineStep } from "@/types/phases";

export function ClaudePipelineForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData } = usePhaseData("agentArchitecture");

  if (!data || data.kind !== "claude-subagent") return null;

  const { claude } = data;

  const setClaude = (next: typeof claude) => {
    setData({ kind: "claude-subagent", claude: next });
  };

  const addAgent = () => {
    const id = crypto.randomUUID();
    const agent: AgentDefinition = {
      id,
      name: "",
      role: "",
      description: "",
      model: "inherit",
      toolAccess: [],
      permissionMode: "default",
      memoryScope: "project",
    };
    setClaude({ ...claude, agents: [...claude.agents, agent] });
  };

  const updateAgent = (index: number, patch: Partial<AgentDefinition>) => {
    const agents = [...claude.agents];
    agents[index] = { ...agents[index], ...patch };
    setClaude({ ...claude, agents });
  };

  const removeAgent = (index: number) => {
    setClaude({
      ...claude,
      agents: claude.agents.filter((_, i) => i !== index),
    });
  };

  const addStep = () => {
    const step: PipelineStep = {
      id: crypto.randomUUID(),
      from: "",
      to: "",
      trigger: "",
      dataFormat: "",
    };
    setClaude({ ...claude, dataFlow: [...claude.dataFlow, step] });
  };

  const updateStep = (index: number, patch: Partial<PipelineStep>) => {
    const dataFlow = [...claude.dataFlow];
    dataFlow[index] = { ...dataFlow[index], ...patch };
    setClaude({ ...claude, dataFlow });
  };

  const removeStep = (index: number) => {
    setClaude({
      ...claude,
      dataFlow: claude.dataFlow.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="파이프라인 패턴">
        <select
          className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
          disabled={disabled}
          value={claude.pattern}
          onChange={(e) =>
            setClaude({
              ...claude,
              pattern: e.target.value as typeof claude.pattern,
            })
          }
        >
          <option value="single">single</option>
          <option value="orchestrator-subagent">orchestrator-subagent</option>
          <option value="explore-plan-execute">explore-plan-execute</option>
          <option value="custom">custom</option>
        </select>
      </SectionGroup>

      <SectionGroup title="에이전트 정의">
        <div className="space-y-4">
          {claude.agents.map((ag, i) => (
            <div key={ag.id} className="space-y-3 rounded-xl border p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">에이전트 {i + 1}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  disabled={disabled}
                  onClick={() => removeAgent(i)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <FieldLabel>이름 (파일명에 사용)</FieldLabel>
                  <Input
                    disabled={disabled}
                    value={ag.name}
                    onChange={(e) => updateAgent(i, { name: e.target.value })}
                    placeholder="reviewer"
                  />
                </div>
                <div className="space-y-1">
                  <FieldLabel>역할</FieldLabel>
                  <Input
                    disabled={disabled}
                    value={ag.role}
                    onChange={(e) => updateAgent(i, { role: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <FieldLabel>description (위임 판단용)</FieldLabel>
                <Textarea
                  disabled={disabled}
                  value={ag.description}
                  onChange={(e) => updateAgent(i, { description: e.target.value })}
                  rows={2}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <FieldLabel>model</FieldLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    disabled={disabled}
                    value={ag.model}
                    onChange={(e) =>
                      updateAgent(i, { model: e.target.value as AgentDefinition["model"] })
                    }
                  >
                    <option value="inherit">inherit</option>
                    <option value="opus">opus</option>
                    <option value="sonnet">sonnet</option>
                    <option value="haiku">haiku</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <FieldLabel>permissionMode</FieldLabel>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    disabled={disabled}
                    value={ag.permissionMode}
                    onChange={(e) =>
                      updateAgent(i, {
                        permissionMode: e.target.value as AgentDefinition["permissionMode"],
                      })
                    }
                  >
                    <option value="default">default</option>
                    <option value="plan">plan</option>
                    <option value="bypassPermissions">bypassPermissions</option>
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <FieldLabel>도구 (쉼표 구분)</FieldLabel>
                <Input
                  disabled={disabled}
                  value={ag.toolAccess.join(", ")}
                  onChange={(e) =>
                    updateAgent(i, {
                      toolAccess: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Read, Grep, Glob"
                />
              </div>
              <div className="space-y-1">
                <FieldLabel>memoryScope</FieldLabel>
                <select
                  className="flex h-10 max-w-xs rounded-md border border-input bg-background px-3 text-sm"
                  disabled={disabled}
                  value={ag.memoryScope}
                  onChange={(e) =>
                    updateAgent(i, {
                      memoryScope: e.target.value as AgentDefinition["memoryScope"],
                    })
                  }
                >
                  <option value="none">none</option>
                  <option value="project">project</option>
                  <option value="user">user</option>
                </select>
              </div>
            </div>
          ))}
          <Button type="button" variant="outline" disabled={disabled} onClick={addAgent}>
            <Plus className="mr-1 size-4" />
            에이전트 추가
          </Button>
        </div>
      </SectionGroup>

      <SectionGroup title="위임 규칙">
        <StringList
          disabled={disabled}
          items={claude.delegationRules}
          onChange={(delegationRules) => setClaude({ ...claude, delegationRules })}
          placeholder="규칙 한 줄"
        />
      </SectionGroup>

      <SectionGroup title="데이터 플로우 (에이전트 간)">
        <div className="space-y-3">
          {claude.dataFlow.map((step, i) => (
            <div key={step.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-5">
              <Input
                disabled={disabled}
                placeholder="from agent id"
                value={step.from}
                onChange={(e) => updateStep(i, { from: e.target.value })}
              />
              <Input
                disabled={disabled}
                placeholder="to agent id"
                value={step.to}
                onChange={(e) => updateStep(i, { to: e.target.value })}
              />
              <Input
                disabled={disabled}
                placeholder="trigger"
                value={step.trigger}
                onChange={(e) => updateStep(i, { trigger: e.target.value })}
              />
              <Input
                disabled={disabled}
                placeholder="data format"
                value={step.dataFormat}
                onChange={(e) => updateStep(i, { dataFormat: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() => removeStep(i)}
              >
                삭제
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addStep}>
            단계 추가
          </Button>
        </div>
      </SectionGroup>
    </div>
  );
}
