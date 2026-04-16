"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { ChannelConfig, SkillConfig } from "@/types/phases";

export function OpenClawToolsForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData } = usePhaseData("agentTools");

  if (!data || data.kind !== "openclaw") return null;

  const { openclaw: oc } = data;

  const setOc = (next: typeof oc) => {
    setData({ kind: "openclaw", openclaw: next });
  };

  const addChannel = () => {
    const c: ChannelConfig = {
      id: crypto.randomUUID(),
      platform: "other",
      identifier: "",
      purpose: "",
    };
    setOc({ ...oc, channels: [...oc.channels, c] });
  };

  const updateChannel = (index: number, patch: Partial<ChannelConfig>) => {
    const channels = [...oc.channels];
    channels[index] = { ...channels[index], ...patch };
    setOc({ ...oc, channels });
  };

  const removeChannel = (index: number) => {
    setOc({ ...oc, channels: oc.channels.filter((_, i) => i !== index) });
  };

  const addSkill = () => {
    const s: SkillConfig = {
      id: crypto.randomUUID(),
      name: "",
      source: "",
      description: "",
      enabled: true,
    };
    setOc({ ...oc, skills: [...oc.skills, s] });
  };

  const updateSkill = (index: number, patch: Partial<SkillConfig>) => {
    const skills = [...oc.skills];
    skills[index] = { ...skills[index], ...patch };
    setOc({ ...oc, skills });
  };

  const removeSkill = (index: number) => {
    setOc({ ...oc, skills: oc.skills.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-8">
      <SectionGroup title="채널">
        {oc.channels.map((c, i) => (
          <div key={c.id} className="mb-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
            <select
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              disabled={disabled}
              value={c.platform}
              onChange={(e) =>
                updateChannel(i, { platform: e.target.value as ChannelConfig["platform"] })
              }
            >
              <option value="whatsapp">whatsapp</option>
              <option value="telegram">telegram</option>
              <option value="discord">discord</option>
              <option value="slack">slack</option>
              <option value="signal">signal</option>
              <option value="teams">teams</option>
              <option value="irc">irc</option>
              <option value="other">other</option>
            </select>
            <Input
              disabled={disabled}
              placeholder="식별자 / 토큰 참조"
              value={c.identifier}
              onChange={(e) => updateChannel(i, { identifier: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="용도"
              value={c.purpose}
              onChange={(e) => updateChannel(i, { purpose: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="허용 연락처 (쉼표)"
              value={(c.allowedContacts ?? []).join(", ")}
              onChange={(e) =>
                updateChannel(i, {
                  allowedContacts: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeChannel(i)}>
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addChannel}>
          <Plus className="mr-1 size-4" />
          채널 추가
        </Button>
      </SectionGroup>

      <SectionGroup title="도구 (TOOLS.md)">
        <FieldLabel>활성 도구 (쉼표)</FieldLabel>
        <Input
          disabled={disabled}
          value={oc.tools.enabled.join(", ")}
          onChange={(e) =>
            setOc({
              ...oc,
              tools: {
                ...oc.tools,
                enabled: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            })
          }
        />
        <FieldLabel className="mt-3">비활성 (쉼표)</FieldLabel>
        <Input
          disabled={disabled}
          value={oc.tools.disabled.join(", ")}
          onChange={(e) =>
            setOc({
              ...oc,
              tools: {
                ...oc.tools,
                disabled: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              },
            })
          }
        />
        <FieldLabel className="mt-3">메모</FieldLabel>
        <Textarea
          disabled={disabled}
          value={oc.tools.notes}
          onChange={(e) =>
            setOc({
              ...oc,
              tools: { ...oc.tools, notes: e.target.value },
            })
          }
          rows={4}
        />
      </SectionGroup>

      <SectionGroup title="스킬">
        {oc.skills.map((s, i) => (
          <div key={s.id} className="mb-3 grid gap-2 rounded-lg border p-3 sm:grid-cols-2">
            <Input
              disabled={disabled}
              placeholder="이름"
              value={s.name}
              onChange={(e) => updateSkill(i, { name: e.target.value })}
            />
            <Input
              disabled={disabled}
              placeholder="소스 URL/경로"
              value={s.source}
              onChange={(e) => updateSkill(i, { source: e.target.value })}
            />
            <Textarea
              className="sm:col-span-2"
              disabled={disabled}
              placeholder="설명"
              value={s.description}
              onChange={(e) => updateSkill(i, { description: e.target.value })}
              rows={2}
            />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={disabled}
                checked={s.enabled}
                onChange={(e) => updateSkill(i, { enabled: e.target.checked })}
              />
              사용
            </label>
            <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={() => removeSkill(i)}>
              삭제
            </Button>
          </div>
        ))}
        <Button type="button" variant="outline" size="sm" disabled={disabled} onClick={addSkill}>
          스킬 추가
        </Button>
      </SectionGroup>

      <SectionGroup title="게이트웨이">
        <div className="grid gap-3 sm:grid-cols-3">
          <Input
            disabled={disabled}
            placeholder="bindHost"
            value={oc.gatewayConfig.bindHost}
            onChange={(e) =>
              setOc({
                ...oc,
                gatewayConfig: { ...oc.gatewayConfig, bindHost: e.target.value },
              })
            }
          />
          <Input
            type="number"
            disabled={disabled}
            placeholder="port"
            value={oc.gatewayConfig.port}
            onChange={(e) =>
              setOc({
                ...oc,
                gatewayConfig: {
                  ...oc.gatewayConfig,
                  port: Number(e.target.value) || 18789,
                },
              })
            }
          />
          <Input
            disabled={disabled}
            placeholder="auth token (선택)"
            value={oc.gatewayConfig.authToken ?? ""}
            onChange={(e) =>
              setOc({
                ...oc,
                gatewayConfig: {
                  ...oc.gatewayConfig,
                  authToken: e.target.value || undefined,
                },
              })
            }
          />
        </div>
      </SectionGroup>
    </div>
  );
}
