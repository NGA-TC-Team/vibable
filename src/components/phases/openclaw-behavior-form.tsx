"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { HeartbeatTask, OpenClawBehaviorPhase } from "@/types/phases";

export function OpenClawBehaviorForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData } = usePhaseData("agentBehavior");

  if (!data || data.kind !== "openclaw") return null;

  const oc = data.openclaw;

  const setOc = (next: OpenClawBehaviorPhase) => {
    setData({ kind: "openclaw", openclaw: next });
  };

  const patchSoul = (patch: Partial<typeof oc.soul>) =>
    setOc({ ...oc, soul: { ...oc.soul, ...patch } });
  const patchIdentity = (patch: Partial<typeof oc.identity>) =>
    setOc({ ...oc, identity: { ...oc.identity, ...patch } });
  const patchAgents = (patch: Partial<typeof oc.agents>) =>
    setOc({ ...oc, agents: { ...oc.agents, ...patch } });
  const patchUser = (patch: Partial<typeof oc.user>) =>
    setOc({ ...oc, user: { ...oc.user, ...patch } });

  const addHeartbeat = () => {
    const t: HeartbeatTask = {
      id: crypto.randomUUID(),
      name: "",
      schedule: "",
      action: "",
      enabled: true,
    };
    setOc({ ...oc, heartbeat: [...oc.heartbeat, t] });
  };

  const updateHb = (index: number, patch: Partial<HeartbeatTask>) => {
    const heartbeat = [...oc.heartbeat];
    heartbeat[index] = { ...heartbeat[index], ...patch };
    setOc({ ...oc, heartbeat });
  };

  const removeHb = (index: number) => {
    setOc({ ...oc, heartbeat: oc.heartbeat.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="SOUL — 성격·경계">
        <div className="space-y-3">
          <Textarea
            disabled={disabled}
            placeholder="성격·가치관·톤"
            value={oc.soul.personality}
            onChange={(e) => patchSoul({ personality: e.target.value })}
            rows={4}
          />
          <FieldLabel>톤 프리셋</FieldLabel>
          <select
            className="h-10 max-w-xs rounded-md border border-input bg-background px-3 text-sm"
            disabled={disabled}
            value={oc.soul.tonePreset ?? "efficient"}
            onChange={(e) =>
              patchSoul({
                tonePreset: e.target.value as NonNullable<typeof oc.soul.tonePreset>,
              })
            }
          >
            <option value="efficient">efficient</option>
            <option value="thoughtful">thoughtful</option>
            <option value="friendly">friendly</option>
            <option value="custom">custom</option>
          </select>
          <StringList
            disabled={disabled}
            items={oc.soul.communicationStyle}
            onChange={(communicationStyle) => patchSoul({ communicationStyle })}
            placeholder="커뮤니케이션 스타일"
          />
          <StringList
            disabled={disabled}
            items={oc.soul.values}
            onChange={(values) => patchSoul({ values })}
            placeholder="가치"
          />
          <StringList
            disabled={disabled}
            items={oc.soul.boundaries}
            onChange={(boundaries) => patchSoul({ boundaries })}
            placeholder="경계 (금지)"
          />
        </div>
      </SectionGroup>

      <SectionGroup title="IDENTITY">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            disabled={disabled}
            placeholder="에이전트 이름"
            value={oc.identity.agentName}
            onChange={(e) => patchIdentity({ agentName: e.target.value })}
          />
          <Input
            disabled={disabled}
            placeholder="역할"
            value={oc.identity.role}
            onChange={(e) => patchIdentity({ role: e.target.value })}
          />
        </div>
        <Textarea
          className="mt-3"
          disabled={disabled}
          placeholder="자기소개"
          value={oc.identity.selfIntroduction}
          onChange={(e) => patchIdentity({ selfIntroduction: e.target.value })}
          rows={3}
        />
      </SectionGroup>

      <SectionGroup title="AGENTS.md 규칙">
        <FieldLabel>안전 기본값</FieldLabel>
        <StringList
          disabled={disabled}
          items={oc.agents.safetyDefaults}
          onChange={(safetyDefaults) => patchAgents({ safetyDefaults })}
        />
        <FieldLabel className="mt-3">세션 시작</FieldLabel>
        <StringList
          disabled={disabled}
          items={oc.agents.sessionStartRules}
          onChange={(sessionStartRules) => patchAgents({ sessionStartRules })}
        />
        <FieldLabel className="mt-3">메모리</FieldLabel>
        <StringList
          disabled={disabled}
          items={oc.agents.memoryRules}
          onChange={(memoryRules) => patchAgents({ memoryRules })}
        />
        <FieldLabel className="mt-3">공유 공간 (그룹)</FieldLabel>
        <StringList
          disabled={disabled}
          items={oc.agents.sharedSpaceRules}
          onChange={(sharedSpaceRules) => patchAgents({ sharedSpaceRules })}
        />
      </SectionGroup>

      <SectionGroup title="USER.md">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            disabled={disabled}
            placeholder="사용자 이름"
            value={oc.user.name}
            onChange={(e) => patchUser({ name: e.target.value })}
          />
          <Input
            disabled={disabled}
            placeholder="시간대"
            value={oc.user.timezone}
            onChange={(e) => patchUser({ timezone: e.target.value })}
          />
        </div>
        <Textarea
          className="mt-3"
          disabled={disabled}
          placeholder="배경"
          value={oc.user.background}
          onChange={(e) => patchUser({ background: e.target.value })}
          rows={2}
        />
        <div className="mt-3">
          <StringList
            disabled={disabled}
            items={oc.user.preferences}
            onChange={(preferences) => patchUser({ preferences })}
            placeholder="선호"
          />
        </div>
        <Textarea
          className="mt-3"
          disabled={disabled}
          placeholder="업무 맥락"
          value={oc.user.workContext}
          onChange={(e) => patchUser({ workContext: e.target.value })}
          rows={2}
        />
      </SectionGroup>

      <SectionGroup title="HEARTBEAT">
        {oc.heartbeat.map((h, i) => (
          <div key={h.id} className="mb-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
            <Input
              disabled={disabled}
              placeholder="이름"
              value={h.name}
              onChange={(e) => updateHb(i, { name: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="스케줄"
              value={h.schedule}
              onChange={(e) => updateHb(i, { schedule: e.target.value })}
            />
            <Textarea
              className="sm:col-span-2"
              disabled={disabled}
              placeholder="수행 작업"
              value={h.action}
              onChange={(e) => updateHb(i, { action: e.target.value })}
              rows={2}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={disabled}
                checked={h.enabled}
                onChange={(e) => updateHb(i, { enabled: e.target.checked })}
              />
              활성
            </label>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeHb(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addHeartbeat}>
          <Plus className="mr-1 size-4" />
          HEARTBEAT 추가
        </Button>
      </SectionGroup>
    </div>
  );
}
