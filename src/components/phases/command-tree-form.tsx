"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { StringList } from "@/components/editor/dynamic-list";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { CLI_COMMAND_PRESETS } from "@/lib/presets/cli-command-presets";
import type {
  CliFlag,
  CliPositional,
  CommandConvention,
  CommandNode,
  CommandStability,
  FlagKind,
} from "@/types/phases";

const CONVENTION_OPTIONS: { value: CommandConvention; label: string }[] = [
  { value: "posix-minimal", label: "POSIX minimal" },
  { value: "verb-noun", label: "verb-noun (git-style)" },
  { value: "noun-verb", label: "noun-verb (docker-style)" },
  { value: "kubernetes-style", label: "kubectl-style" },
  { value: "rust-clap", label: "rust clap" },
  { value: "cobra-go", label: "cobra (Go)" },
  { value: "custom", label: "custom" },
];

const FLAG_KINDS: FlagKind[] = [
  "boolean",
  "string",
  "number",
  "enum",
  "path",
  "duration",
  "count",
  "stringArray",
];

const STABILITY_OPTIONS: CommandStability[] = [
  "experimental",
  "beta",
  "stable",
  "deprecated",
];

function updateNodeAtPath(
  nodes: CommandNode[],
  path: number[],
  updater: (n: CommandNode) => CommandNode,
): CommandNode[] {
  if (path.length === 0) return nodes;
  const [head, ...rest] = path;
  return nodes.map((node, i) => {
    if (i !== head) return node;
    if (rest.length === 0) return updater(node);
    return { ...node, children: updateNodeAtPath(node.children, rest, updater) };
  });
}

function removeNodeAtPath(nodes: CommandNode[], path: number[]): CommandNode[] {
  if (path.length === 0) return nodes;
  const [head, ...rest] = path;
  if (rest.length === 0) return nodes.filter((_, i) => i !== head);
  return nodes.map((node, i) =>
    i === head ? { ...node, children: removeNodeAtPath(node.children, rest) } : node,
  );
}

function addChildAtPath(nodes: CommandNode[], path: number[], child: CommandNode): CommandNode[] {
  if (path.length === 0) return [...nodes, child];
  const [head, ...rest] = path;
  return nodes.map((node, i) => {
    if (i !== head) return node;
    return { ...node, children: addChildAtPath(node.children, rest, child) };
  });
}

function newCommand(): CommandNode {
  return {
    id: crypto.randomUUID(),
    name: "",
    aliases: [],
    summary: "",
    description: "",
    positional: [],
    localFlags: [],
    inheritedFlags: [],
    hidden: false,
    stability: "experimental",
    agentSafe: true,
    children: [],
  };
}

function newFlag(): CliFlag {
  return {
    id: crypto.randomUUID(),
    long: "",
    kind: "boolean",
    required: false,
    repeatable: false,
    description: "",
  };
}

function newPositional(): CliPositional {
  return {
    id: crypto.randomUUID(),
    name: "",
    kind: "required",
    description: "",
  };
}

function FlagEditor({
  flags,
  onChange,
  disabled,
  label,
}: {
  flags: CliFlag[];
  onChange: (flags: CliFlag[]) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={() => onChange([...flags, newFlag()])}
        >
          <Plus className="size-3" />
          플래그
        </Button>
      </div>
      {flags.map((flag, i) => (
        <div key={flag.id} className="space-y-1.5 rounded border p-2">
          <div className="grid grid-cols-6 gap-1.5">
            <Input
              className="col-span-2 text-xs"
              disabled={disabled}
              placeholder="--long"
              value={flag.long}
              onChange={(e) => {
                const next = [...flags];
                next[i] = { ...flag, long: e.target.value };
                onChange(next);
              }}
            />
            <Input
              className="text-xs"
              disabled={disabled}
              placeholder="-s"
              value={flag.short ?? ""}
              onChange={(e) => {
                const next = [...flags];
                next[i] = { ...flag, short: e.target.value };
                onChange(next);
              }}
            />
            <select
              className="col-span-2 h-8 rounded-md border border-input bg-background px-2 text-xs"
              disabled={disabled}
              value={flag.kind}
              onChange={(e) => {
                const next = [...flags];
                next[i] = { ...flag, kind: e.target.value as FlagKind };
                onChange(next);
              }}
            >
              {FLAG_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              disabled={disabled}
              onClick={() => onChange(flags.filter((_, j) => j !== i))}
            >
              <Trash2 className="size-3" />
            </Button>
          </div>
          <Input
            className="text-xs"
            disabled={disabled}
            placeholder="설명"
            value={flag.description}
            onChange={(e) => {
              const next = [...flags];
              next[i] = { ...flag, description: e.target.value };
              onChange(next);
            }}
          />
          <div className="flex flex-wrap gap-3 text-[11px]">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={disabled}
                checked={flag.required}
                onChange={(e) => {
                  const next = [...flags];
                  next[i] = { ...flag, required: e.target.checked };
                  onChange(next);
                }}
              />
              required
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={disabled}
                checked={flag.repeatable}
                onChange={(e) => {
                  const next = [...flags];
                  next[i] = { ...flag, repeatable: e.target.checked };
                  onChange(next);
                }}
              />
              repeatable
            </label>
            {flag.kind === "enum" && (
              <Input
                className="h-6 flex-1 text-xs"
                disabled={disabled}
                placeholder="enum 값 (쉼표)"
                value={(flag.enumValues ?? []).join(", ")}
                onChange={(e) => {
                  const next = [...flags];
                  next[i] = {
                    ...flag,
                    enumValues: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
                  };
                  onChange(next);
                }}
              />
            )}
            <Input
              className="h-6 w-36 text-xs"
              disabled={disabled}
              placeholder="ENV_VAR"
              value={flag.envVar ?? ""}
              onChange={(e) => {
                const next = [...flags];
                next[i] = { ...flag, envVar: e.target.value };
                onChange(next);
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function PositionalEditor({
  items,
  onChange,
  disabled,
}: {
  items: CliPositional[];
  onChange: (items: CliPositional[]) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>Positional 인자</FieldLabel>
        <Button
          type="button"
          variant="outline"
          size="xs"
          disabled={disabled}
          onClick={() => onChange([...items, newPositional()])}
        >
          <Plus className="size-3" />
          인자
        </Button>
      </div>
      {items.map((p, i) => (
        <div key={p.id} className="grid grid-cols-6 gap-1.5 rounded border p-2">
          <Input
            className="col-span-2 text-xs"
            disabled={disabled}
            placeholder="NAME"
            value={p.name}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...p, name: e.target.value };
              onChange(next);
            }}
          />
          <select
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
            disabled={disabled}
            value={p.kind}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...p, kind: e.target.value as CliPositional["kind"] };
              onChange(next);
            }}
          >
            <option value="required">required</option>
            <option value="optional">optional</option>
            <option value="variadic">variadic</option>
          </select>
          <Input
            className="col-span-2 text-xs"
            disabled={disabled}
            placeholder="설명"
            value={p.description}
            onChange={(e) => {
              const next = [...items];
              next[i] = { ...p, description: e.target.value };
              onChange(next);
            }}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-xs"
            disabled={disabled}
            onClick={() => onChange(items.filter((_, j) => j !== i))}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}

function CommandNodeEditor({
  node,
  path,
  onUpdate,
  onRemove,
  onAddChild,
  disabled,
}: {
  node: CommandNode;
  path: number[];
  onUpdate: (path: number[], updater: (n: CommandNode) => CommandNode) => void;
  onRemove: (path: number[]) => void;
  onAddChild: (path: number[]) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(true);

  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
        </Button>
        <Input
          className="flex-1 text-sm"
          disabled={disabled}
          placeholder="커맨드 이름 (e.g. create)"
          value={node.name}
          onChange={(e) =>
            onUpdate(path, (n) => ({ ...n, name: e.target.value }))
          }
        />
        <select
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          disabled={disabled}
          value={node.stability}
          onChange={(e) =>
            onUpdate(path, (n) => ({
              ...n,
              stability: e.target.value as CommandStability,
            }))
          }
        >
          {STABILITY_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          disabled={disabled}
          onClick={() => onRemove(path)}
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {open && (
        <div className="ml-6 space-y-3">
          <Input
            className="text-xs"
            disabled={disabled}
            placeholder="한 줄 요약 (summary)"
            value={node.summary}
            onChange={(e) => onUpdate(path, (n) => ({ ...n, summary: e.target.value }))}
          />
          <Textarea
            className="text-xs"
            disabled={disabled}
            placeholder="상세 설명"
            value={node.description}
            rows={2}
            onChange={(e) =>
              onUpdate(path, (n) => ({ ...n, description: e.target.value }))
            }
          />
          <div className="flex flex-wrap gap-4 text-xs">
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={disabled}
                checked={node.hidden}
                onChange={(e) =>
                  onUpdate(path, (n) => ({ ...n, hidden: e.target.checked }))
                }
              />
              hidden
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                disabled={disabled}
                checked={node.agentSafe}
                onChange={(e) =>
                  onUpdate(path, (n) => ({ ...n, agentSafe: e.target.checked }))
                }
              />
              agent-safe (비대화식·멱등)
            </label>
          </div>
          <div className="space-y-1">
            <FieldLabel>별칭</FieldLabel>
            <StringList
              disabled={disabled}
              items={node.aliases}
              onChange={(aliases) => onUpdate(path, (n) => ({ ...n, aliases }))}
              placeholder="alias"
            />
          </div>
          <PositionalEditor
            items={node.positional}
            onChange={(positional) =>
              onUpdate(path, (n) => ({ ...n, positional }))
            }
            disabled={disabled}
          />
          <FlagEditor
            label="로컬 플래그"
            flags={node.localFlags}
            onChange={(localFlags) =>
              onUpdate(path, (n) => ({ ...n, localFlags }))
            }
            disabled={disabled}
          />
          <div className="flex items-center justify-between">
            <FieldLabel>서브커맨드</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              onClick={() => onAddChild(path)}
            >
              <Plus className="size-3" />
              서브커맨드
            </Button>
          </div>
          {node.children.length > 0 && (
            <div className="space-y-2 border-l-2 pl-3">
              {node.children.map((child, i) => (
                <CommandNodeEditor
                  key={child.id}
                  node={child}
                  path={[...path, i]}
                  onUpdate={onUpdate}
                  onRemove={onRemove}
                  onAddChild={onAddChild}
                  disabled={disabled}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function CommandTreeForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { data, patchData } = usePhaseData("commandTree");
  const [presetOpen, setPresetOpen] = useState(false);

  if (!data) return null;

  const updateCommand = (path: number[], updater: (n: CommandNode) => CommandNode) => {
    patchData({ commands: updateNodeAtPath(data.commands, path, updater) });
  };
  const removeCommand = (path: number[]) => {
    patchData({ commands: removeNodeAtPath(data.commands, path) });
  };
  const addChild = (path: number[]) => {
    patchData({ commands: addChildAtPath(data.commands, path, newCommand()) });
  };
  const addRoot = () => {
    patchData({ commands: [...data.commands, newCommand()] });
  };
  const applyPreset = (presetId: string) => {
    const preset = CLI_COMMAND_PRESETS.find((p) => p.id === presetId);
    if (!preset) return;
    patchData({
      convention: preset.convention,
      globalFlags: preset.globalFlags,
      commands: preset.commands,
    });
    setPresetOpen(false);
  };

  return (
    <div className="space-y-6">
      <SectionGroup title="루트 & 컨벤션">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <FieldLabel>루트 바이너리</FieldLabel>
            <Input
              disabled={disabled}
              placeholder="예: mytool"
              value={data.rootBinary}
              onChange={(e) => patchData({ rootBinary: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <FieldLabel>커맨드 컨벤션</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data.convention}
              onChange={(e) =>
                patchData({ convention: e.target.value as CommandConvention })
              }
            >
              {CONVENTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <FieldLabel>프리셋에서 시작</FieldLabel>
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              onClick={() => setPresetOpen((v) => !v)}
            >
              {presetOpen ? "접기" : "프리셋 열기"}
            </Button>
          </div>
          {presetOpen && (
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {CLI_COMMAND_PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => applyPreset(p.id)}
                  className="rounded-md border p-2 text-left text-xs hover:border-primary hover:bg-primary/5"
                >
                  <div className="font-medium">{p.label}</div>
                  <div className="text-muted-foreground">{p.description}</div>
                  <div className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {p.example}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SectionGroup>

      <SectionGroup title="글로벌 플래그">
        <FlagEditor
          label="전체 커맨드에 상속되는 플래그"
          flags={data.globalFlags}
          onChange={(globalFlags) => patchData({ globalFlags })}
          disabled={disabled}
        />
      </SectionGroup>

      <SectionGroup title="커맨드 트리">
        <div className="space-y-2">
          {data.commands.map((cmd, i) => (
            <CommandNodeEditor
              key={cmd.id}
              node={cmd}
              path={[i]}
              onUpdate={updateCommand}
              onRemove={removeCommand}
              onAddChild={addChild}
              disabled={disabled}
            />
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={addRoot}
          >
            <Plus className="mr-1 size-4" />
            최상위 커맨드
          </Button>
        </div>
      </SectionGroup>

      <SectionGroup title="도움말·완성">
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={data.helpStyle.includeExamplesInHelp}
              onChange={(e) =>
                patchData({
                  helpStyle: {
                    ...data.helpStyle,
                    includeExamplesInHelp: e.target.checked,
                  },
                })
              }
            />
            --help에 예시 포함
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={data.helpStyle.includeEnvVarsInHelp}
              onChange={(e) =>
                patchData({
                  helpStyle: {
                    ...data.helpStyle,
                    includeEnvVarsInHelp: e.target.checked,
                  },
                })
              }
            />
            --help에 환경 변수 섹션 포함
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              disabled={disabled}
              checked={data.helpStyle.colorizeHelp}
              onChange={(e) =>
                patchData({
                  helpStyle: {
                    ...data.helpStyle,
                    colorizeHelp: e.target.checked,
                  },
                })
              }
            />
            --help 색상 적용 (NO_COLOR 존중)
          </label>
          <div className="space-y-1">
            <FieldLabel>완성 스크립트 전략</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data.completions.strategy}
              onChange={(e) =>
                patchData({
                  completions: {
                    ...data.completions,
                    strategy: e.target.value as typeof data.completions.strategy,
                  },
                })
              }
            >
              <option value="static-generated">static-generated</option>
              <option value="runtime-completion">runtime-completion</option>
              <option value="none">none</option>
            </select>
          </div>
        </div>
      </SectionGroup>
    </div>
  );
}
