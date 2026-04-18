"use client";

import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { SectionGroup } from "@/components/editor/section-group";
import { RequirementsForm } from "@/components/phases/requirements-form";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type {
  CliAuthMethod,
  CliPlatformMatrix,
  DestructiveActionPolicy,
  CliPerformanceSlo,
  CliTelemetry,
} from "@/types/phases";

const OS_OPTIONS = ["macos", "linux", "windows", "bsd"] as const;
const ARCH_OPTIONS = ["x86_64", "arm64", "riscv64"] as const;
const SHELL_OPTIONS = ["bash", "zsh", "fish", "powershell", "nushell", "pwsh"] as const;
const AUTH_OPTIONS: CliAuthMethod[] = [
  "env-var",
  "config-file",
  "oauth-device-code",
  "oauth-browser",
  "static-token",
  "none",
];

function MultiCheckbox<T extends string>({
  options,
  value,
  onChange,
  disabled,
}: {
  options: readonly T[];
  value: T[];
  onChange: (v: T[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const checked = value.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange(checked ? value.filter((v) => v !== opt) : [...value, opt]);
            }}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              checked
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-muted-foreground/50"
            }`}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function CliRequirementsForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { data, patchData } = usePhaseData("cliRequirements");

  if (!data) return null;

  const platform: CliPlatformMatrix = data.platformMatrix ?? {
    os: [],
    arch: [],
    shells: [],
  };
  const policy: DestructiveActionPolicy = data.destructivePolicy ?? {
    requiresConfirmation: true,
    confirmationFlag: "--yes",
    dryRunSupported: true,
    auditTrail: "stderr-log",
  };
  const slo: CliPerformanceSlo = data.performance ?? {};
  const telemetry: CliTelemetry = data.telemetry ?? {
    enabled: false,
    optOutMechanism: "",
    collects: [],
  };

  return (
    <div className="space-y-8">
      <RequirementsForm disabled={disabled} phaseSlice="cliRequirements" />

      <SectionGroup title="실행 환경 매트릭스">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <FieldLabel>OS</FieldLabel>
            <MultiCheckbox
              options={OS_OPTIONS}
              value={platform.os}
              onChange={(os) => patchData({ platformMatrix: { ...platform, os } })}
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>아키텍처</FieldLabel>
            <MultiCheckbox
              options={ARCH_OPTIONS}
              value={platform.arch}
              onChange={(arch) =>
                patchData({ platformMatrix: { ...platform, arch } })
              }
              disabled={disabled}
            />
          </div>
          <div className="space-y-1.5">
            <FieldLabel>쉘</FieldLabel>
            <MultiCheckbox
              options={SHELL_OPTIONS}
              value={platform.shells}
              onChange={(shells) =>
                patchData({ platformMatrix: { ...platform, shells } })
              }
              disabled={disabled}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel>최소 Node 버전</FieldLabel>
              <Input
                disabled={disabled}
                placeholder="예: 20.10"
                value={platform.minNodeVersion ?? ""}
                onChange={(e) =>
                  patchData({
                    platformMatrix: { ...platform, minNodeVersion: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <FieldLabel>최소 Bun 버전</FieldLabel>
              <Input
                disabled={disabled}
                placeholder="예: 1.2"
                value={platform.minBunVersion ?? ""}
                onChange={(e) =>
                  patchData({
                    platformMatrix: { ...platform, minBunVersion: e.target.value },
                  })
                }
              />
            </div>
          </div>
        </div>
      </SectionGroup>

      <SectionGroup title="파괴적 작업 정책">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={policy.requiresConfirmation}
              onChange={(e) =>
                patchData({
                  destructivePolicy: {
                    ...policy,
                    requiresConfirmation: e.target.checked,
                  },
                })
              }
            />
            확인 요구 (기본 ON)
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel>확인 플래그</FieldLabel>
              <Input
                disabled={disabled}
                value={policy.confirmationFlag}
                onChange={(e) =>
                  patchData({
                    destructivePolicy: { ...policy, confirmationFlag: e.target.value },
                  })
                }
              />
            </div>
            <div className="space-y-1">
              <FieldLabel>감사 로그</FieldLabel>
              <select
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={policy.auditTrail}
                onChange={(e) =>
                  patchData({
                    destructivePolicy: {
                      ...policy,
                      auditTrail: e.target.value as DestructiveActionPolicy["auditTrail"],
                    },
                  })
                }
              >
                <option value="stderr-log">stderr-log</option>
                <option value="file">file</option>
                <option value="none">none</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={policy.dryRunSupported}
              onChange={(e) =>
                patchData({
                  destructivePolicy: {
                    ...policy,
                    dryRunSupported: e.target.checked,
                  },
                })
              }
            />
            --dry-run 지원
          </label>
        </div>
      </SectionGroup>

      <SectionGroup title="성능 SLO">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel>Cold Start (ms)</FieldLabel>
            <Input
              type="number"
              disabled={disabled}
              value={slo.coldStartMs ?? ""}
              onChange={(e) =>
                patchData({
                  performance: {
                    ...slo,
                    coldStartMs: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>P95 명령 실행 (ms)</FieldLabel>
            <Input
              type="number"
              disabled={disabled}
              value={slo.p95CommandMs ?? ""}
              onChange={(e) =>
                patchData({
                  performance: {
                    ...slo,
                    p95CommandMs: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>스트리밍 레이턴시 (ms)</FieldLabel>
            <Input
              type="number"
              disabled={disabled}
              value={slo.streamingLatencyMs ?? ""}
              onChange={(e) =>
                patchData({
                  performance: {
                    ...slo,
                    streamingLatencyMs: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>바이너리 크기 (MB)</FieldLabel>
            <Input
              type="number"
              disabled={disabled}
              value={slo.binarySizeMb ?? ""}
              onChange={(e) =>
                patchData({
                  performance: {
                    ...slo,
                    binarySizeMb: e.target.value ? Number(e.target.value) : undefined,
                  },
                })
              }
            />
          </div>
        </div>
      </SectionGroup>

      <SectionGroup title="인증 방식">
        <MultiCheckbox
          options={AUTH_OPTIONS}
          value={data.authMethods ?? []}
          onChange={(authMethods) => patchData({ authMethods })}
          disabled={disabled}
        />
      </SectionGroup>

      <SectionGroup title="기타">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={data.offlineFirst ?? false}
              onChange={(e) => patchData({ offlineFirst: e.target.checked })}
            />
            오프라인 우선
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={telemetry.enabled}
              onChange={(e) =>
                patchData({
                  telemetry: { ...telemetry, enabled: e.target.checked },
                })
              }
            />
            텔레메트리 수집
          </label>
          {telemetry.enabled && (
            <>
              <div className="space-y-1">
                <FieldLabel>옵트아웃 메커니즘</FieldLabel>
                <Input
                  disabled={disabled}
                  placeholder="예: --no-telemetry 또는 ENV=0"
                  value={telemetry.optOutMechanism}
                  onChange={(e) =>
                    patchData({
                      telemetry: { ...telemetry, optOutMechanism: e.target.value },
                    })
                  }
                />
              </div>
            </>
          )}
        </div>
      </SectionGroup>
    </div>
  );
}
