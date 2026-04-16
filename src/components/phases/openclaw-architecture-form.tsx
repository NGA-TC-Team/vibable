"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { ChannelRoute, OpenClawAgentConfig } from "@/types/phases";

export function OpenClawArchitectureForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData } = usePhaseData("agentArchitecture");

  if (!data || data.kind !== "openclaw") return null;

  const { openclaw: oc } = data;

  const setOc = (next: typeof oc) => {
    setData({ kind: "openclaw", openclaw: next });
  };

  const addAgentCfg = () => {
    const a: OpenClawAgentConfig = {
      id: crypto.randomUUID(),
      name: "",
      workspace: "",
      channels: [],
    };
    setOc({ ...oc, agents: [...(oc.agents ?? []), a] });
  };

  const updateAgentCfg = (index: number, patch: Partial<OpenClawAgentConfig>) => {
    const agents = [...(oc.agents ?? [])];
    agents[index] = { ...agents[index], ...patch };
    setOc({ ...oc, agents });
  };

  const removeAgentCfg = (index: number) => {
    setOc({ ...oc, agents: (oc.agents ?? []).filter((_, i) => i !== index) });
  };

  const addRoute = () => {
    const r: ChannelRoute = {
      id: crypto.randomUUID(),
      channel: "",
      agentId: "",
      sessionType: "private",
    };
    setOc({ ...oc, channelRouting: [...(oc.channelRouting ?? []), r] });
  };

  const updateRoute = (index: number, patch: Partial<ChannelRoute>) => {
    const channelRouting = [...(oc.channelRouting ?? [])];
    channelRouting[index] = { ...channelRouting[index], ...patch };
    setOc({ ...oc, channelRouting });
  };

  const removeRoute = (index: number) => {
    setOc({
      ...oc,
      channelRouting: (oc.channelRouting ?? []).filter((_, i) => i !== index),
    });
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="워크스페이스 경로">
        <Input
          disabled={disabled}
          value={oc.workspacePath}
          onChange={(e) => setOc({ ...oc, workspacePath: e.target.value })}
        />
      </SectionGroup>

      <SectionGroup title="샌드박스">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled}
            checked={oc.sandboxConfig.enabled}
            onChange={(e) =>
              setOc({
                ...oc,
                sandboxConfig: { ...oc.sandboxConfig, enabled: e.target.checked },
              })
            }
          />
          활성화
        </label>
        <div className="mt-3 flex flex-wrap gap-4">
          <div className="space-y-1">
            <FieldLabel>워크스페이스 접근</FieldLabel>
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              disabled={disabled}
              value={oc.sandboxConfig.workspaceAccess}
              onChange={(e) =>
                setOc({
                  ...oc,
                  sandboxConfig: {
                    ...oc.sandboxConfig,
                    workspaceAccess: e.target.value as "ro" | "rw",
                  },
                })
              }
            >
              <option value="ro">ro</option>
              <option value="rw">rw</option>
            </select>
          </div>
          <label className="flex items-center gap-2 self-end text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={oc.sandboxConfig.networkAccess}
              onChange={(e) =>
                setOc({
                  ...oc,
                  sandboxConfig: { ...oc.sandboxConfig, networkAccess: e.target.checked },
                })
              }
            />
            네트워크 허용
          </label>
        </div>
      </SectionGroup>

      <SectionGroup title="다중 에이전트">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled}
            checked={oc.multiAgent}
            onChange={(e) => setOc({ ...oc, multiAgent: e.target.checked })}
          />
          다중 에이전트 구성
        </label>
      </SectionGroup>

      <SectionGroup title="에이전트별 워크스페이스">
        {(oc.agents ?? []).map((a, i) => (
          <div key={a.id} className="mb-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-3">
            <Input
              disabled={disabled}
              placeholder="이름"
              value={a.name}
              onChange={(e) => updateAgentCfg(i, { name: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="workspace 경로"
              value={a.workspace}
              onChange={(e) => updateAgentCfg(i, { workspace: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="채널 (쉼표)"
              value={a.channels.join(", ")}
              onChange={(e) =>
                updateAgentCfg(i, {
                  channels: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeAgentCfg(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addAgentCfg}>
          <Plus className="mr-1 size-4" />
          에이전트 행 추가
        </Button>
      </SectionGroup>

      <SectionGroup title="채널 라우팅">
        {(oc.channelRouting ?? []).map((r, i) => (
          <div key={r.id} className="mb-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-4">
            <Input
              disabled={disabled}
              placeholder="채널 식별자"
              value={r.channel}
              onChange={(e) => updateRoute(i, { channel: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="agentId"
              value={r.agentId}
              onChange={(e) => updateRoute(i, { agentId: e.target.value })}
            />
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              disabled={disabled}
              value={r.sessionType}
              onChange={(e) =>
                updateRoute(i, { sessionType: e.target.value as ChannelRoute["sessionType"] })
              }
            >
              <option value="private">private</option>
              <option value="group">group</option>
            </select>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeRoute(i)}>
              삭제
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addRoute}>
          라우트 추가
        </Button>
      </SectionGroup>
    </div>
  );
}
