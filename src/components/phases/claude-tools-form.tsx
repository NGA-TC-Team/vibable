"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { HookDefinition, McpServerConfig } from "@/types/phases";

export function ClaudeToolsForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData } = usePhaseData("agentTools");

  if (!data || data.kind !== "claude-subagent") return null;

  const { claude } = data;

  const setClaude = (next: typeof claude) => {
    setData({ kind: "claude-subagent", claude: next });
  };

  const addHook = () => {
    const h: HookDefinition = {
      id: crypto.randomUUID(),
      agentId: "",
      hookType: "PreToolUse",
      matcher: "",
      action: "",
      purpose: "",
    };
    setClaude({ ...claude, hooks: [...claude.hooks, h] });
  };

  const updateHook = (index: number, patch: Partial<HookDefinition>) => {
    const hooks = [...claude.hooks];
    hooks[index] = { ...hooks[index], ...patch };
    setClaude({ ...claude, hooks });
  };

  const removeHook = (index: number) => {
    setClaude({ ...claude, hooks: claude.hooks.filter((_, i) => i !== index) });
  };

  const addMcp = () => {
    const m: McpServerConfig = {
      id: crypto.randomUUID(),
      name: "",
      url: "",
      description: "",
    };
    setClaude({ ...claude, mcpServers: [...(claude.mcpServers ?? []), m] });
  };

  const updateMcp = (index: number, patch: Partial<McpServerConfig>) => {
    const list = [...(claude.mcpServers ?? [])];
    list[index] = { ...list[index], ...patch };
    setClaude({ ...claude, mcpServers: list });
  };

  const removeMcp = (index: number) => {
    setClaude({
      ...claude,
      mcpServers: (claude.mcpServers ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="전역 도구 (쉼표)">
        <Input
          disabled={disabled}
          value={claude.globalTools.join(", ")}
          onChange={(e) =>
            setClaude({
              ...claude,
              globalTools: e.target.value
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean),
            })
          }
          placeholder="Read, Grep, Glob, Bash"
        />
      </SectionGroup>

      <SectionGroup title="에이전트별 도구 오버라이드">
        <div className="space-y-3">
          {claude.agentTools.map((at, i) => (
            <div key={`${at.agentId}-${i}`} className="flex flex-wrap gap-2 rounded-lg border p-3">
              <Input
                className="max-w-xs"
                disabled={disabled}
                placeholder="agentId"
                value={at.agentId}
                onChange={(e) => {
                  const next = [...claude.agentTools];
                  next[i] = { ...next[i], agentId: e.target.value };
                  setClaude({ ...claude, agentTools: next });
                }}
              />
              <Input
                className="min-w-[12rem] flex-1"
                disabled={disabled}
                placeholder="도구 쉼표 구분"
                value={at.tools.join(", ")}
                onChange={(e) => {
                  const next = [...claude.agentTools];
                  next[i] = {
                    ...next[i],
                    tools: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  };
                  setClaude({ ...claude, agentTools: next });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={() =>
                  setClaude({
                    ...claude,
                    agentTools: claude.agentTools.filter((_, j) => j !== i),
                  })
                }
              >
                삭제
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() =>
              setClaude({
                ...claude,
                agentTools: [...claude.agentTools, { agentId: "", tools: [] }],
              })
            }
          >
            <Plus className="mr-1 size-4" />
            오버라이드 행 추가
          </Button>
        </div>
      </SectionGroup>

      <SectionGroup title="훅">
        <div className="space-y-3">
          {claude.hooks.map((h, i) => (
            <div key={h.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-2">
              <Input
                disabled={disabled}
                placeholder="agentId"
                value={h.agentId}
                onChange={(e) => updateHook(i, { agentId: e.target.value })}
              />
              <select
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                disabled={disabled}
                value={h.hookType}
                onChange={(e) =>
                  updateHook(i, { hookType: e.target.value as HookDefinition["hookType"] })
                }
              >
                <option value="PreToolUse">PreToolUse</option>
                <option value="PostToolUse">PostToolUse</option>
              </select>
              <Input
                disabled={disabled}
                placeholder="matcher (도구 이름)"
                value={h.matcher}
                onChange={(e) => updateHook(i, { matcher: e.target.value })}
              />
              <Input
                disabled={disabled}
                placeholder="action (스크립트/설명)"
                value={h.action}
                onChange={(e) => updateHook(i, { action: e.target.value })}
              />
              <Textarea
                className="md:col-span-2"
                disabled={disabled}
                placeholder="목적"
                value={h.purpose}
                onChange={(e) => updateHook(i, { purpose: e.target.value })}
                rows={2}
              />
              <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeHook(i)}>
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addHook}>
            훅 추가
          </Button>
        </div>
      </SectionGroup>

      <SectionGroup title="MCP 서버 (선택)">
        <div className="space-y-3">
          {(claude.mcpServers ?? []).map((m, i) => (
            <div key={m.id} className="grid gap-2 rounded-lg border p-3 sm:grid-cols-3">
              <Input
                disabled={disabled}
                placeholder="이름"
                value={m.name}
                onChange={(e) => updateMcp(i, { name: e.target.value })}
              />
              <Input
                disabled={disabled}
                placeholder="URL"
                value={m.url}
                onChange={(e) => updateMcp(i, { url: e.target.value })}
              />
              <Input
                disabled={disabled}
                placeholder="설명"
                value={m.description}
                onChange={(e) => updateMcp(i, { description: e.target.value })}
              />
              <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeMcp(i)}>
                삭제
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addMcp}>
            MCP 추가
          </Button>
        </div>
      </SectionGroup>
    </div>
  );
}
