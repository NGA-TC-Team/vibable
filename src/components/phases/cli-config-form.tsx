"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type {
  ConfigFileSpec,
  ConfigFormat,
  EnvVarSpec,
  OutputSchemaSpec,
  SecretStore,
} from "@/types/phases";

const CONFIG_FORMATS: ConfigFormat[] = ["toml", "yaml", "json", "ini", "dotenv"];
const SECRET_STORES: SecretStore[] = [
  "os-keychain",
  "env-var",
  "plain-file",
  "encrypted-file",
  "external-vault",
];

function newConfigFile(): ConfigFileSpec {
  return {
    id: crypto.randomUUID(),
    locationPriority: [],
    format: "toml",
    jsonSchema: "",
    description: "",
    mergeStrategy: "deep",
  };
}

function newEnvVar(): EnvVarSpec {
  return {
    id: crypto.randomUUID(),
    name: "",
    purpose: "",
    required: false,
    sensitive: false,
  };
}

function newOutputSchema(): OutputSchemaSpec {
  return {
    id: crypto.randomUUID(),
    version: "0.1.0",
    describes: "",
    jsonSchema: "",
    stabilityGuarantee: "experimental",
  };
}

export function CliConfigForm({ disabled = false }: { disabled?: boolean }) {
  const { data, setData, patchData } = usePhaseData("cliConfig");

  if (!data) return null;

  return (
    <div className="space-y-6">
      <SectionGroup title="파일시스템 레이아웃 (XDG Base Directory)">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel>configDir</FieldLabel>
            <Input
              disabled={disabled}
              value={data.fsLayout.configDir}
              onChange={(e) =>
                patchData({ fsLayout: { ...data.fsLayout, configDir: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>cacheDir</FieldLabel>
            <Input
              disabled={disabled}
              value={data.fsLayout.cacheDir}
              onChange={(e) =>
                patchData({ fsLayout: { ...data.fsLayout, cacheDir: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>stateDir</FieldLabel>
            <Input
              disabled={disabled}
              value={data.fsLayout.stateDir}
              onChange={(e) =>
                patchData({ fsLayout: { ...data.fsLayout, stateDir: e.target.value } })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>logsDir</FieldLabel>
            <Input
              disabled={disabled}
              value={data.fsLayout.logsDir}
              onChange={(e) =>
                patchData({ fsLayout: { ...data.fsLayout, logsDir: e.target.value } })
              }
            />
          </div>
        </div>
        <label className="mt-2 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled}
            checked={data.fsLayout.ensureCreated}
            onChange={(e) =>
              patchData({
                fsLayout: { ...data.fsLayout, ensureCreated: e.target.checked },
              })
            }
          />
          첫 실행 시 디렉토리 자동 생성
        </label>
      </SectionGroup>

      <SectionGroup title="설정 파일">
        {data.configFiles.map((cf, i) => (
          <div key={cf.id} className="mb-3 space-y-2 rounded-lg border p-3">
            <div className="grid grid-cols-2 gap-2">
              <Input
                disabled={disabled}
                placeholder="설명 (예: 기본 사용자 설정)"
                value={cf.description}
                onChange={(e) => {
                  const next = [...data.configFiles];
                  next[i] = { ...cf, description: e.target.value };
                  setData({ ...data, configFiles: next });
                }}
              />
              <select
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={cf.format}
                onChange={(e) => {
                  const next = [...data.configFiles];
                  next[i] = { ...cf, format: e.target.value as ConfigFormat };
                  setData({ ...data, configFiles: next });
                }}
              >
                {CONFIG_FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <FieldLabel>경로 우선순위 (위가 높음)</FieldLabel>
              <StringList
                disabled={disabled}
                items={cf.locationPriority}
                onChange={(locationPriority) => {
                  const next = [...data.configFiles];
                  next[i] = { ...cf, locationPriority };
                  setData({ ...data, configFiles: next });
                }}
                placeholder="$XDG_CONFIG_HOME/tool/config.toml"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <FieldLabel>병합 전략</FieldLabel>
                <select
                  disabled={disabled}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={cf.mergeStrategy}
                  onChange={(e) => {
                    const next = [...data.configFiles];
                    next[i] = {
                      ...cf,
                      mergeStrategy: e.target.value as ConfigFileSpec["mergeStrategy"],
                    };
                    setData({ ...data, configFiles: next });
                  }}
                >
                  <option value="deep">deep</option>
                  <option value="override">override</option>
                  <option value="array-append">array-append</option>
                </select>
              </div>
            </div>
            <Textarea
              disabled={disabled}
              placeholder="JSON Schema 또는 $ref"
              rows={3}
              className="font-mono text-xs"
              value={cf.jsonSchema}
              onChange={(e) => {
                const next = [...data.configFiles];
                next[i] = { ...cf, jsonSchema: e.target.value };
                setData({ ...data, configFiles: next });
              }}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() =>
                setData({
                  ...data,
                  configFiles: data.configFiles.filter((_, j) => j !== i),
                })
              }
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            setData({ ...data, configFiles: [...data.configFiles, newConfigFile()] })
          }
        >
          <Plus className="mr-1 size-4" />
          설정 파일
        </Button>
      </SectionGroup>

      <SectionGroup title="환경 변수">
        {data.envVars.map((ev, i) => (
          <div key={ev.id} className="mb-3 grid grid-cols-[180px_1fr_auto] gap-2 rounded border p-2">
            <Input
              disabled={disabled}
              placeholder="VAR_NAME"
              className="font-mono"
              value={ev.name}
              onChange={(e) => {
                const next = [...data.envVars];
                next[i] = { ...ev, name: e.target.value };
                setData({ ...data, envVars: next });
              }}
            />
            <Input
              disabled={disabled}
              placeholder="용도"
              value={ev.purpose}
              onChange={(e) => {
                const next = [...data.envVars];
                next[i] = { ...ev, purpose: e.target.value };
                setData({ ...data, envVars: next });
              }}
            />
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-1 text-[10px]">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={ev.required}
                  onChange={(e) => {
                    const next = [...data.envVars];
                    next[i] = { ...ev, required: e.target.checked };
                    setData({ ...data, envVars: next });
                  }}
                />
                req
              </label>
              <label className="flex items-center gap-1 text-[10px]">
                <input
                  type="checkbox"
                  disabled={disabled}
                  checked={ev.sensitive}
                  onChange={(e) => {
                    const next = [...data.envVars];
                    next[i] = { ...ev, sensitive: e.target.checked };
                    setData({ ...data, envVars: next });
                  }}
                />
                secret
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() =>
                  setData({
                    ...data,
                    envVars: data.envVars.filter((_, j) => j !== i),
                  })
                }
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            setData({ ...data, envVars: [...data.envVars, newEnvVar()] })
          }
        >
          <Plus className="mr-1 size-4" />
          환경 변수
        </Button>
      </SectionGroup>

      <SectionGroup title="시크릿 정책">
        <div className="space-y-2">
          <div className="space-y-1">
            <FieldLabel>지원 저장소</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {SECRET_STORES.map((s) => {
                const active = data.secrets.supportedStores.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      const supportedStores = active
                        ? data.secrets.supportedStores.filter((x) => x !== s)
                        : [...data.secrets.supportedStores, s];
                      patchData({ secrets: { ...data.secrets, supportedStores } });
                    }}
                    className={`rounded-md border px-2 py-0.5 text-xs ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel>선호 저장소</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm"
              value={data.secrets.preferredStore}
              onChange={(e) =>
                patchData({
                  secrets: {
                    ...data.secrets,
                    preferredStore: e.target.value as SecretStore,
                  },
                })
              }
            >
              {SECRET_STORES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <FieldLabel>회전 정책</FieldLabel>
            <Input
              disabled={disabled}
              placeholder="예: 90일마다 수동 회전"
              value={data.secrets.rotationPolicy}
              onChange={(e) =>
                patchData({
                  secrets: { ...data.secrets, rotationPolicy: e.target.value },
                })
              }
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={data.secrets.redactInLogs}
              onChange={(e) =>
                patchData({
                  secrets: { ...data.secrets, redactInLogs: e.target.checked },
                })
              }
            />
            로그에서 자동 마스킹
          </label>
        </div>
      </SectionGroup>

      <SectionGroup title="--json 출력 스키마 (버전드)">
        {data.outputSchemas.map((os, i) => (
          <div key={os.id} className="mb-3 space-y-2 rounded border p-3">
            <div className="grid grid-cols-[1fr_100px_120px_auto] gap-2">
              <Input
                disabled={disabled}
                placeholder="설명 (예: project list --json)"
                value={os.describes}
                onChange={(e) => {
                  const next = [...data.outputSchemas];
                  next[i] = { ...os, describes: e.target.value };
                  setData({ ...data, outputSchemas: next });
                }}
              />
              <Input
                disabled={disabled}
                placeholder="버전"
                value={os.version}
                onChange={(e) => {
                  const next = [...data.outputSchemas];
                  next[i] = { ...os, version: e.target.value };
                  setData({ ...data, outputSchemas: next });
                }}
              />
              <select
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-2 text-xs"
                value={os.stabilityGuarantee}
                onChange={(e) => {
                  const next = [...data.outputSchemas];
                  next[i] = {
                    ...os,
                    stabilityGuarantee: e.target.value as OutputSchemaSpec["stabilityGuarantee"],
                  };
                  setData({ ...data, outputSchemas: next });
                }}
              >
                <option value="experimental">experimental</option>
                <option value="beta">beta</option>
                <option value="stable">stable</option>
              </select>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() =>
                  setData({
                    ...data,
                    outputSchemas: data.outputSchemas.filter((_, j) => j !== i),
                  })
                }
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
            <Textarea
              disabled={disabled}
              placeholder="JSON Schema"
              rows={3}
              className="font-mono text-xs"
              value={os.jsonSchema}
              onChange={(e) => {
                const next = [...data.outputSchemas];
                next[i] = { ...os, jsonSchema: e.target.value };
                setData({ ...data, outputSchemas: next });
              }}
            />
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={() =>
            setData({ ...data, outputSchemas: [...data.outputSchemas, newOutputSchema()] })
          }
        >
          <Plus className="mr-1 size-4" />
          출력 스키마
        </Button>
      </SectionGroup>

      <SectionGroup title="기타">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled}
            checked={data.entityReuse}
            onChange={(e) => patchData({ entityReuse: e.target.checked })}
          />
          Phase 5 데이터 엔티티를 내부 모델로 재사용 (dataModel 슬라이스 참조)
        </label>
      </SectionGroup>
    </div>
  );
}
