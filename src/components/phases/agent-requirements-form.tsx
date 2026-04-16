"use client";

import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SectionGroup } from "@/components/editor/section-group";
import { SECTION_TOOLTIPS } from "@/lib/constants";
import { useEditorStore } from "@/services/store/editor-store";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { RequirementsForm } from "@/components/phases/requirements-form";

/** 에이전트 Phase 2: 공통 요구사항 + 하위 유형 확장 필드 */
export function AgentRequirementsForm({ disabled = false }: { disabled?: boolean }) {
  const agentSubType = useEditorStore((s) => s.agentSubType);
  const { data, patchData } = usePhaseData("agentRequirements");

  if (!data) return null;

  return (
    <div className="space-y-8">
      <RequirementsForm disabled={disabled} phaseSlice="agentRequirements" />

      {agentSubType === "claude-subagent" && (
        <SectionGroup title="Claude Subagent 확장">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel tooltip={SECTION_TOOLTIPS["phase.agentRequirements"]}>
                자율성 수준
              </FieldLabel>
              <select
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
                disabled={disabled}
                value={data.claude?.autonomyLevel ?? "suggest"}
                onChange={(e) =>
                  patchData({
                    claude: {
                      ...data.claude,
                      autonomyLevel: e.target.value as
                        | "read-only"
                        | "suggest"
                        | "plan-then-execute"
                        | "autonomous",
                      permissionBoundary: data.claude?.permissionBoundary ?? "",
                      contextScope: data.claude?.contextScope ?? "project",
                    },
                  })
                }
              >
                <option value="read-only">read-only</option>
                <option value="suggest">suggest</option>
                <option value="plan-then-execute">plan-then-execute</option>
                <option value="autonomous">autonomous</option>
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel>권한 경계</FieldLabel>
              <Textarea
                disabled={disabled}
                value={data.claude?.permissionBoundary ?? ""}
                onChange={(e) =>
                  patchData({
                    claude: {
                      autonomyLevel: data.claude?.autonomyLevel ?? "suggest",
                      permissionBoundary: e.target.value,
                      contextScope: data.claude?.contextScope ?? "project",
                    },
                  })
                }
                placeholder="예: 프로덕션 배포 전 사람 승인"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>컨텍스트 스코프</FieldLabel>
              <select
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
                disabled={disabled}
                value={data.claude?.contextScope ?? "project"}
                onChange={(e) =>
                  patchData({
                    claude: {
                      autonomyLevel: data.claude?.autonomyLevel ?? "suggest",
                      permissionBoundary: data.claude?.permissionBoundary ?? "",
                      contextScope: e.target.value as "project" | "user" | "both",
                    },
                  })
                }
              >
                <option value="project">project</option>
                <option value="user">user</option>
                <option value="both">both</option>
              </select>
            </div>
            <div className="space-y-2">
              <FieldLabel>최대 동시 서브에이전트 (선택)</FieldLabel>
              <Input
                type="number"
                min={1}
                disabled={disabled}
                value={data.claude?.maxConcurrentAgents ?? ""}
                onChange={(e) =>
                  patchData({
                    claude: {
                      autonomyLevel: data.claude?.autonomyLevel ?? "suggest",
                      permissionBoundary: data.claude?.permissionBoundary ?? "",
                      contextScope: data.claude?.contextScope ?? "project",
                      maxConcurrentAgents: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    },
                  })
                }
              />
            </div>
          </div>
        </SectionGroup>
      )}

      {agentSubType === "openclaw" && (
        <SectionGroup title="OpenClaw 확장">
          <div className="space-y-4">
            <div className="space-y-2">
              <FieldLabel>자율성 수준</FieldLabel>
              <select
                className="flex h-10 w-full max-w-md rounded-md border border-input bg-background px-3 text-sm"
                disabled={disabled}
                value={data.openclaw?.autonomyLevel ?? "reactive"}
                onChange={(e) =>
                  patchData({
                    openclaw: {
                      ...data.openclaw,
                      autonomyLevel: e.target.value as
                        | "passive"
                        | "reactive"
                        | "proactive"
                        | "autonomous",
                      alwaysOnRequired: data.openclaw?.alwaysOnRequired ?? false,
                      messagingChannels: data.openclaw?.messagingChannels ?? [],
                      hardwareTarget: data.openclaw?.hardwareTarget ?? "",
                      sandboxRequired: data.openclaw?.sandboxRequired ?? false,
                    },
                  })
                }
              >
                <option value="passive">passive</option>
                <option value="reactive">reactive</option>
                <option value="proactive">proactive</option>
                <option value="autonomous">autonomous</option>
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={disabled}
                checked={data.openclaw?.alwaysOnRequired ?? false}
                onChange={(e) =>
                  patchData({
                    openclaw: {
                      autonomyLevel: data.openclaw?.autonomyLevel ?? "reactive",
                      alwaysOnRequired: e.target.checked,
                      messagingChannels: data.openclaw?.messagingChannels ?? [],
                      hardwareTarget: data.openclaw?.hardwareTarget ?? "",
                      sandboxRequired: data.openclaw?.sandboxRequired ?? false,
                    },
                  })
                }
              />
              24/7 상시 구동 필요
            </label>
            <div className="space-y-2">
              <FieldLabel>메신저 채널 (줄바꿈으로 구분)</FieldLabel>
              <Textarea
                disabled={disabled}
                value={(data.openclaw?.messagingChannels ?? []).join("\n")}
                onChange={(e) =>
                  patchData({
                    openclaw: {
                      autonomyLevel: data.openclaw?.autonomyLevel ?? "reactive",
                      alwaysOnRequired: data.openclaw?.alwaysOnRequired ?? false,
                      messagingChannels: e.target.value
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                      hardwareTarget: data.openclaw?.hardwareTarget ?? "",
                      sandboxRequired: data.openclaw?.sandboxRequired ?? false,
                    },
                  })
                }
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <FieldLabel>하드웨어 타깃</FieldLabel>
              <Input
                disabled={disabled}
                value={data.openclaw?.hardwareTarget ?? ""}
                onChange={(e) =>
                  patchData({
                    openclaw: {
                      autonomyLevel: data.openclaw?.autonomyLevel ?? "reactive",
                      alwaysOnRequired: data.openclaw?.alwaysOnRequired ?? false,
                      messagingChannels: data.openclaw?.messagingChannels ?? [],
                      hardwareTarget: e.target.value,
                      sandboxRequired: data.openclaw?.sandboxRequired ?? false,
                    },
                  })
                }
                placeholder="예: Mac Mini M4"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                disabled={disabled}
                checked={data.openclaw?.sandboxRequired ?? false}
                onChange={(e) =>
                  patchData({
                    openclaw: {
                      autonomyLevel: data.openclaw?.autonomyLevel ?? "reactive",
                      alwaysOnRequired: data.openclaw?.alwaysOnRequired ?? false,
                      messagingChannels: data.openclaw?.messagingChannels ?? [],
                      hardwareTarget: data.openclaw?.hardwareTarget ?? "",
                      sandboxRequired: e.target.checked,
                    },
                  })
                }
              />
              샌드박스 필수
            </label>
          </div>
        </SectionGroup>
      )}
    </div>
  );
}
