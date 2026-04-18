"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { flattenCommands } from "@/lib/cli/command-to-signature";
import type {
  CliSample,
  CommandContract,
  ExitCodeCategory,
  ExitCodeMapping,
  StdinFormat,
  StdoutMode,
} from "@/types/phases";

const STDIN_FORMATS: StdinFormat[] = ["none", "text", "json", "ndjson", "binary"];
const STDOUT_MODES: StdoutMode[] = [
  "human-pretty",
  "human-plain",
  "json",
  "ndjson",
  "yaml",
  "custom-template",
];
const EXIT_CATEGORIES: ExitCodeCategory[] = [
  "success",
  "usage",
  "input",
  "unavailable",
  "software",
  "config",
  "temporary",
  "permission",
];

function newContract(commandId: string): CommandContract {
  return {
    commandId,
    stdinFormat: "none",
    stdoutModes: ["human-pretty"],
    defaultMode: "human-pretty",
    stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
    exitCodes: [{ code: 0, when: "성공", category: "success" }],
    streaming: "none",
    interactivity: {
      promptsIfTTY: false,
      nonInteractiveFallback: "",
      respectsNoInput: true,
    },
    progressReporting: "none",
    idempotent: false,
    safeToRetry: false,
    samples: [],
  };
}

function newExitCode(): ExitCodeMapping {
  return { code: 1, when: "", category: "software" };
}

function newSample(mode: "human" | "agent"): CliSample {
  return {
    label: "",
    mode,
    invocation: "",
    stdout: "",
    exitCode: 0,
  };
}

export function CliContractForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("cliContract");
  const { data: tree } = usePhaseData("commandTree");
  const [selectedIdx, setSelectedIdx] = useState(0);

  const availableCommands = useMemo(() => {
    if (!tree) return [];
    return flattenCommands(tree.commands).map(({ node, parents }) => ({
      id: node.id,
      label: [...parents, node.name].filter(Boolean).join(" "),
      agentSafe: node.agentSafe,
    }));
  }, [tree]);

  if (!data) return null;

  const contracts = data.contracts;
  const selected = contracts[selectedIdx];

  const updateSelected = (patch: Partial<CommandContract>) => {
    const next = [...contracts];
    next[selectedIdx] = { ...selected, ...patch };
    patchData({ contracts: next });
  };

  const addContract = () => {
    const firstCommand = availableCommands[0]?.id ?? "";
    patchData({ contracts: [...contracts, newContract(firstCommand)] });
    setSelectedIdx(contracts.length);
  };

  const removeContract = (idx: number) => {
    patchData({ contracts: contracts.filter((_, i) => i !== idx) });
    setSelectedIdx(0);
  };

  const toggleMode = (mode: StdoutMode) => {
    const has = selected.stdoutModes.includes(mode);
    const stdoutModes = has
      ? selected.stdoutModes.filter((m) => m !== mode)
      : [...selected.stdoutModes, mode];
    updateSelected({
      stdoutModes,
      defaultMode: stdoutModes.includes(selected.defaultMode)
        ? selected.defaultMode
        : (stdoutModes[0] ?? "human-pretty"),
    });
  };

  return (
    <div className="space-y-6">
      <SectionGroup title="글로벌 컨벤션">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel>JSON 플래그</FieldLabel>
            <Input
              disabled={disabled}
              value={data.globalConventions.jsonFlag}
              onChange={(e) =>
                patchData({
                  globalConventions: {
                    ...data.globalConventions,
                    jsonFlag: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>포맷 플래그</FieldLabel>
            <Input
              disabled={disabled}
              value={data.globalConventions.formatFlag}
              onChange={(e) =>
                patchData({
                  globalConventions: {
                    ...data.globalConventions,
                    formatFlag: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Quiet 플래그</FieldLabel>
            <Input
              disabled={disabled}
              value={data.globalConventions.quietFlag}
              onChange={(e) =>
                patchData({
                  globalConventions: {
                    ...data.globalConventions,
                    quietFlag: e.target.value,
                  },
                })
              }
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>Verbose 플래그</FieldLabel>
            <Input
              disabled={disabled}
              value={data.globalConventions.verboseFlag}
              onChange={(e) =>
                patchData({
                  globalConventions: {
                    ...data.globalConventions,
                    verboseFlag: e.target.value,
                  },
                })
              }
            />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            disabled={disabled}
            checked={data.globalConventions.piscesRule}
            onChange={(e) =>
              patchData({
                globalConventions: {
                  ...data.globalConventions,
                  piscesRule: e.target.checked,
                },
              })
            }
          />
          파이프될 때 색상 자동 제거 (NO_COLOR·isatty 존중)
        </label>
      </SectionGroup>

      <SectionGroup title="커맨드별 계약">
        <div className="grid grid-cols-[220px_1fr] gap-3">
          <div className="space-y-1 rounded-md border p-2">
            {contracts.map((c, i) => {
              const label =
                availableCommands.find((ac) => ac.id === c.commandId)?.label ??
                "(커맨드 선택 필요)";
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedIdx(i)}
                  className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs ${
                    selectedIdx === i
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <span className="truncate">{label}</span>
                  <Trash2
                    className="size-3 shrink-0 opacity-60 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeContract(i);
                    }}
                  />
                </button>
              );
            })}
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled || availableCommands.length === 0}
              onClick={addContract}
              className="mt-2 w-full"
            >
              <Plus className="mr-1 size-3" />
              계약 추가
            </Button>
            {availableCommands.length === 0 && (
              <p className="mt-2 text-[11px] text-muted-foreground">
                먼저 커맨드 구조(Phase 3)에서 커맨드를 추가하세요
              </p>
            )}
          </div>

          {selected ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <FieldLabel>대상 커맨드</FieldLabel>
                <select
                  disabled={disabled}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selected.commandId}
                  onChange={(e) => updateSelected({ commandId: e.target.value })}
                >
                  <option value="">— 선택 —</option>
                  {availableCommands.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                      {!c.agentSafe ? " (agent-unsafe)" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FieldLabel>stdin 포맷</FieldLabel>
                  <select
                    disabled={disabled}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={selected.stdinFormat}
                    onChange={(e) =>
                      updateSelected({
                        stdinFormat: e.target.value as StdinFormat,
                      })
                    }
                  >
                    {STDIN_FORMATS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <FieldLabel>stdin Schema 참조</FieldLabel>
                  <Input
                    disabled={disabled}
                    placeholder="예: #/schemas/createInput"
                    value={selected.stdinSchemaRef ?? ""}
                    onChange={(e) =>
                      updateSelected({ stdinSchemaRef: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel>stdout 모드 (다중 선택)</FieldLabel>
                <div className="flex flex-wrap gap-1.5">
                  {STDOUT_MODES.map((m) => {
                    const active = selected.stdoutModes.includes(m);
                    return (
                      <button
                        key={m}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleMode(m)}
                        className={`rounded-md border px-2 py-0.5 text-xs ${
                          active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border text-muted-foreground"
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <FieldLabel>기본 모드</FieldLabel>
                  <select
                    disabled={disabled}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    value={selected.defaultMode}
                    onChange={(e) =>
                      updateSelected({
                        defaultMode: e.target.value as StdoutMode,
                      })
                    }
                  >
                    {selected.stdoutModes.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <FieldLabel>Schema 버전</FieldLabel>
                  <Input
                    disabled={disabled}
                    placeholder="예: 1.0.0"
                    value={selected.stdoutSchemaVersion ?? ""}
                    onChange={(e) =>
                      updateSelected({ stdoutSchemaVersion: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1">
                <FieldLabel>스트리밍</FieldLabel>
                <select
                  disabled={disabled}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={selected.streaming}
                  onChange={(e) =>
                    updateSelected({
                      streaming: e.target.value as typeof selected.streaming,
                    })
                  }
                >
                  <option value="none">none</option>
                  <option value="stdout-ndjson">stdout-ndjson</option>
                  <option value="sse-like">sse-like</option>
                </select>
              </div>

              <div className="space-y-2 rounded border p-2">
                <FieldLabel>인터랙티브 / 비대화식</FieldLabel>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.interactivity.promptsIfTTY}
                    onChange={(e) =>
                      updateSelected({
                        interactivity: {
                          ...selected.interactivity,
                          promptsIfTTY: e.target.checked,
                        },
                      })
                    }
                  />
                  TTY일 때 프롬프트
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.interactivity.respectsNoInput}
                    onChange={(e) =>
                      updateSelected({
                        interactivity: {
                          ...selected.interactivity,
                          respectsNoInput: e.target.checked,
                        },
                      })
                    }
                  />
                  --no-input 존중
                </label>
                <Input
                  className="text-xs"
                  disabled={disabled}
                  placeholder="비대화식 대체 경로 설명"
                  value={selected.interactivity.nonInteractiveFallback}
                  onChange={(e) =>
                    updateSelected({
                      interactivity: {
                        ...selected.interactivity,
                        nonInteractiveFallback: e.target.value,
                      },
                    })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.idempotent}
                    onChange={(e) =>
                      updateSelected({ idempotent: e.target.checked })
                    }
                  />
                  멱등 (idempotent)
                </label>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    disabled={disabled}
                    checked={selected.safeToRetry}
                    onChange={(e) =>
                      updateSelected({ safeToRetry: e.target.checked })
                    }
                  />
                  재시도 안전
                </label>
              </div>

              <div className="space-y-2 rounded border p-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>Exit Codes</FieldLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    disabled={disabled}
                    onClick={() =>
                      updateSelected({
                        exitCodes: [...selected.exitCodes, newExitCode()],
                      })
                    }
                  >
                    <Plus className="size-3" />
                  </Button>
                </div>
                {selected.exitCodes.map((ec, i) => (
                  <div key={i} className="grid grid-cols-[60px_120px_1fr_auto] gap-1.5">
                    <Input
                      type="number"
                      className="h-8 text-xs"
                      disabled={disabled}
                      value={ec.code}
                      onChange={(e) => {
                        const next = [...selected.exitCodes];
                        next[i] = { ...ec, code: Number(e.target.value) };
                        updateSelected({ exitCodes: next });
                      }}
                    />
                    <select
                      className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      disabled={disabled}
                      value={ec.category}
                      onChange={(e) => {
                        const next = [...selected.exitCodes];
                        next[i] = {
                          ...ec,
                          category: e.target.value as ExitCodeCategory,
                        };
                        updateSelected({ exitCodes: next });
                      }}
                    >
                      {EXIT_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <Input
                      className="h-8 text-xs"
                      disabled={disabled}
                      placeholder="언제 발생?"
                      value={ec.when}
                      onChange={(e) => {
                        const next = [...selected.exitCodes];
                        next[i] = { ...ec, when: e.target.value };
                        updateSelected({ exitCodes: next });
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      disabled={disabled}
                      onClick={() =>
                        updateSelected({
                          exitCodes: selected.exitCodes.filter((_, j) => j !== i),
                        })
                      }
                    >
                      <Trash2 className="size-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2 rounded border p-2">
                <div className="flex items-center justify-between">
                  <FieldLabel>샘플 (human·agent 각 1개 이상 권장)</FieldLabel>
                  <div className="flex gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={disabled}
                      onClick={() =>
                        updateSelected({
                          samples: [...selected.samples, newSample("human")],
                        })
                      }
                    >
                      + human
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      disabled={disabled}
                      onClick={() =>
                        updateSelected({
                          samples: [...selected.samples, newSample("agent")],
                        })
                      }
                    >
                      + agent
                    </Button>
                  </div>
                </div>
                {selected.samples.map((s, i) => (
                  <div key={i} className="space-y-1 rounded border p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        {s.mode}
                      </span>
                      <Input
                        className="h-7 text-xs"
                        disabled={disabled}
                        placeholder="라벨"
                        value={s.label}
                        onChange={(e) => {
                          const next = [...selected.samples];
                          next[i] = { ...s, label: e.target.value };
                          updateSelected({ samples: next });
                        }}
                      />
                      <Input
                        type="number"
                        className="h-7 w-16 text-xs"
                        disabled={disabled}
                        value={s.exitCode}
                        onChange={(e) => {
                          const next = [...selected.samples];
                          next[i] = { ...s, exitCode: Number(e.target.value) };
                          updateSelected({ samples: next });
                        }}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        disabled={disabled}
                        onClick={() =>
                          updateSelected({
                            samples: selected.samples.filter((_, j) => j !== i),
                          })
                        }
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                    <Input
                      className="font-mono text-xs"
                      disabled={disabled}
                      placeholder="invocation (예: mytool create --json)"
                      value={s.invocation}
                      onChange={(e) => {
                        const next = [...selected.samples];
                        next[i] = { ...s, invocation: e.target.value };
                        updateSelected({ samples: next });
                      }}
                    />
                    <Textarea
                      className="font-mono text-xs"
                      rows={2}
                      disabled={disabled}
                      placeholder="stdout"
                      value={s.stdout}
                      onChange={(e) => {
                        const next = [...selected.samples];
                        next[i] = { ...s, stdout: e.target.value };
                        updateSelected({ samples: next });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center rounded border p-6 text-sm text-muted-foreground">
              커맨드 계약을 추가하세요
            </div>
          )}
        </div>
      </SectionGroup>
    </div>
  );
}
