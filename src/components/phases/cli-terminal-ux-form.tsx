"use client";

import { Plus, Trash2 } from "lucide-react";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SectionGroup } from "@/components/editor/section-group";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { CLI_AGENT_PRESETS } from "@/lib/presets/cli-agent-presets";
import { ansiColorToHex } from "@/lib/cli/ansi-to-react";
import type {
  AgentFriendlinessChecklist,
  AnsiColor,
  ErrorMessageTemplate,
  GlossaryEntry,
  HelpSection,
  TerminalPalette,
} from "@/types/phases";

const ANSI_COLORS: AnsiColor[] = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "brightBlack",
  "brightRed",
  "brightGreen",
  "brightYellow",
  "brightBlue",
  "brightMagenta",
  "brightCyan",
  "brightWhite",
];

const HELP_SECTIONS: HelpSection[] = [
  "usage",
  "description",
  "flags",
  "commands",
  "examples",
  "env-vars",
  "exit-codes",
  "see-also",
];

const PALETTE_ROLES: Array<keyof Omit<TerminalPalette, "truecolorHex" | "respectNoColor">> = [
  "primary",
  "success",
  "warning",
  "danger",
  "info",
  "muted",
];

function newErrorTemplate(): ErrorMessageTemplate {
  return {
    id: crypto.randomUUID(),
    scenario: "",
    whatWentWrong: "",
    whyItHappened: "",
    howToFix: "",
    exitCode: 1,
  };
}

function newGlossary(): GlossaryEntry {
  return { term: "", avoid: "", context: "" };
}

function ColorSwatch({ color }: { color: AnsiColor }) {
  return (
    <span
      className="inline-block size-3 rounded-sm border"
      style={{ backgroundColor: ansiColorToHex(color) }}
    />
  );
}

export function CliTerminalUxForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { data, setData, patchData } = usePhaseData("cliTerminalUx");

  if (!data) return null;

  const updateChecklist = (patch: Partial<AgentFriendlinessChecklist>) => {
    patchData({ agentChecklist: { ...data.agentChecklist, ...patch } });
  };

  return (
    <div className="space-y-6">
      <SectionGroup title="ANSI 팔레트">
        <div className="grid grid-cols-2 gap-2">
          {PALETTE_ROLES.map((role) => (
            <div key={role} className="space-y-1">
              <FieldLabel>
                <ColorSwatch color={data.palette[role]} />
                <span className="ml-2">{role}</span>
              </FieldLabel>
              <select
                disabled={disabled}
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 text-xs"
                value={data.palette[role]}
                onChange={(e) =>
                  patchData({
                    palette: { ...data.palette, [role]: e.target.value as AnsiColor },
                  })
                }
              >
                {ANSI_COLORS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
        <p className="mt-2 text-[11px] text-muted-foreground">
          NO_COLOR 환경 변수와 isatty()는 항상 존중합니다 (clig.dev 규약).
        </p>
      </SectionGroup>

      <SectionGroup title="레이아웃 & 아이콘">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel>아이콘 세트</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data.iconSet}
              onChange={(e) =>
                patchData({ iconSet: e.target.value as typeof data.iconSet })
              }
            >
              <option value="none">none (기계 모드)</option>
              <option value="ascii">ascii (✓ ✗ → [OK])</option>
              <option value="nerd-font">nerd-font</option>
              <option value="emoji">emoji</option>
            </select>
          </div>
          <div className="space-y-1">
            <FieldLabel>테이블 스타일</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data.tableStyle}
              onChange={(e) =>
                patchData({ tableStyle: e.target.value as typeof data.tableStyle })
              }
            >
              <option value="plain">plain</option>
              <option value="unicode-box">unicode-box (┌─┐)</option>
              <option value="markdown">markdown</option>
              <option value="github">github</option>
            </select>
          </div>
        </div>
      </SectionGroup>

      <SectionGroup title="로그 레벨 정책">
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <FieldLabel>기본 레벨</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              value={data.logPolicy.defaultLevel}
              onChange={(e) =>
                patchData({
                  logPolicy: {
                    ...data.logPolicy,
                    defaultLevel: e.target.value as "info" | "warn",
                  },
                })
              }
            >
              <option value="info">info</option>
              <option value="warn">warn</option>
            </select>
          </div>
          <div className="space-y-1">
            <FieldLabel>ENV 오버라이드</FieldLabel>
            <Input
              disabled={disabled}
              placeholder="예: MYTOOL_LOG_LEVEL"
              value={data.logPolicy.envOverride}
              onChange={(e) =>
                patchData({
                  logPolicy: { ...data.logPolicy, envOverride: e.target.value },
                })
              }
            />
          </div>
        </div>
      </SectionGroup>

      <SectionGroup title="--help 템플릿">
        <div className="space-y-2">
          <div className="space-y-1">
            <FieldLabel>포함 섹션</FieldLabel>
            <div className="flex flex-wrap gap-1.5">
              {HELP_SECTIONS.map((s) => {
                const active = data.helpTemplate.sections.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      const sections = active
                        ? data.helpTemplate.sections.filter((x) => x !== s)
                        : [...data.helpTemplate.sections, s];
                      patchData({
                        helpTemplate: { ...data.helpTemplate, sections },
                      });
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
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <FieldLabel>헤더 스타일</FieldLabel>
              <select
                disabled={disabled}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                value={data.helpTemplate.headerStyle}
                onChange={(e) =>
                  patchData({
                    helpTemplate: {
                      ...data.helpTemplate,
                      headerStyle: e.target.value as typeof data.helpTemplate.headerStyle,
                    },
                  })
                }
              >
                <option value="uppercase">UPPERCASE</option>
                <option value="bold">**bold**</option>
                <option value="color-muted">color-muted</option>
              </select>
            </div>
            <div className="space-y-1">
              <FieldLabel>예시 개수</FieldLabel>
              <Input
                type="number"
                disabled={disabled}
                value={data.helpTemplate.exampleCount}
                onChange={(e) =>
                  patchData({
                    helpTemplate: {
                      ...data.helpTemplate,
                      exampleCount: Number(e.target.value),
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
              checked={data.helpTemplate.includeAgentSection}
              onChange={(e) =>
                patchData({
                  helpTemplate: {
                    ...data.helpTemplate,
                    includeAgentSection: e.target.checked,
                  },
                })
              }
            />
            For Agents 섹션 포함 (--json 사용 가이드)
          </label>
        </div>
      </SectionGroup>

      <SectionGroup title="에러 메시지 템플릿 (문제 → 원인 → 해결)">
        {data.errorTemplates.map((et, i) => (
          <div key={et.id} className="mb-3 space-y-2 rounded border p-3">
            <Input
              disabled={disabled}
              placeholder="시나리오 (예: 인증 실패)"
              value={et.scenario}
              onChange={(e) => {
                const next = [...data.errorTemplates];
                next[i] = { ...et, scenario: e.target.value };
                setData({ ...data, errorTemplates: next });
              }}
            />
            <Textarea
              rows={2}
              disabled={disabled}
              placeholder="무엇이 잘못됐는지"
              value={et.whatWentWrong}
              onChange={(e) => {
                const next = [...data.errorTemplates];
                next[i] = { ...et, whatWentWrong: e.target.value };
                setData({ ...data, errorTemplates: next });
              }}
            />
            <Textarea
              rows={2}
              disabled={disabled}
              placeholder="왜 발생했는지 (원인)"
              value={et.whyItHappened}
              onChange={(e) => {
                const next = [...data.errorTemplates];
                next[i] = { ...et, whyItHappened: e.target.value };
                setData({ ...data, errorTemplates: next });
              }}
            />
            <Textarea
              rows={2}
              disabled={disabled}
              placeholder="어떻게 해결하는지"
              value={et.howToFix}
              onChange={(e) => {
                const next = [...data.errorTemplates];
                next[i] = { ...et, howToFix: e.target.value };
                setData({ ...data, errorTemplates: next });
              }}
            />
            <div className="flex items-center gap-2">
              <Input
                type="number"
                className="w-24"
                disabled={disabled}
                placeholder="exit"
                value={et.exitCode}
                onChange={(e) => {
                  const next = [...data.errorTemplates];
                  next[i] = { ...et, exitCode: Number(e.target.value) };
                  setData({ ...data, errorTemplates: next });
                }}
              />
              <Input
                disabled={disabled}
                placeholder="관련 커맨드"
                value={et.relatedCommand ?? ""}
                onChange={(e) => {
                  const next = [...data.errorTemplates];
                  next[i] = { ...et, relatedCommand: e.target.value };
                  setData({ ...data, errorTemplates: next });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                disabled={disabled}
                onClick={() =>
                  setData({
                    ...data,
                    errorTemplates: data.errorTemplates.filter((_, j) => j !== i),
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
            setData({
              ...data,
              errorTemplates: [...data.errorTemplates, newErrorTemplate()],
            })
          }
        >
          <Plus className="mr-1 size-4" />
          에러 템플릿
        </Button>
      </SectionGroup>

      <SectionGroup title="UX 라이팅 톤 & 용어집">
        <div className="space-y-2">
          <div className="space-y-1">
            <FieldLabel>톤 (1: 격식·엄격 ↔ 5: 친근·캐주얼)</FieldLabel>
            <input
              type="range"
              min={1}
              max={5}
              disabled={disabled}
              value={data.toneLevel}
              onChange={(e) =>
                patchData({
                  toneLevel: Number(e.target.value) as 1 | 2 | 3 | 4 | 5,
                })
              }
              className="w-full"
            />
            <div className="text-center text-xs text-muted-foreground">
              현재: {data.toneLevel}/5
            </div>
          </div>
          <div className="space-y-1">
            <FieldLabel>피해야 할 용어</FieldLabel>
            {data.uxWritingGlossary.map((g, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-1.5">
                <Input
                  className="text-xs"
                  disabled={disabled}
                  placeholder="피할 용어"
                  value={g.term}
                  onChange={(e) => {
                    const next = [...data.uxWritingGlossary];
                    next[i] = { ...g, term: e.target.value };
                    setData({ ...data, uxWritingGlossary: next });
                  }}
                />
                <Input
                  className="text-xs"
                  disabled={disabled}
                  placeholder="대신 사용할 표현"
                  value={g.avoid}
                  onChange={(e) => {
                    const next = [...data.uxWritingGlossary];
                    next[i] = { ...g, avoid: e.target.value };
                    setData({ ...data, uxWritingGlossary: next });
                  }}
                />
                <Input
                  className="text-xs"
                  disabled={disabled}
                  placeholder="맥락"
                  value={g.context ?? ""}
                  onChange={(e) => {
                    const next = [...data.uxWritingGlossary];
                    next[i] = { ...g, context: e.target.value };
                    setData({ ...data, uxWritingGlossary: next });
                  }}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  disabled={disabled}
                  onClick={() =>
                    setData({
                      ...data,
                      uxWritingGlossary: data.uxWritingGlossary.filter(
                        (_, j) => j !== i,
                      ),
                    })
                  }
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="xs"
              disabled={disabled}
              onClick={() =>
                setData({
                  ...data,
                  uxWritingGlossary: [...data.uxWritingGlossary, newGlossary()],
                })
              }
            >
              <Plus className="size-3" />
              용어
            </Button>
          </div>
        </div>
      </SectionGroup>

      <SectionGroup title="AI 에이전트 친화도 체크리스트">
        <div className="mb-3 flex flex-wrap gap-1.5">
          {CLI_AGENT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              disabled={disabled}
              onClick={() => patchData({ agentChecklist: p.checklist })}
              className="rounded-md border px-2 py-1 text-xs hover:border-primary hover:bg-primary/5"
              title={p.description}
            >
              {p.label} 적용
            </button>
          ))}
        </div>
        <div className="space-y-1.5">
          {(
            [
              ["stableJsonOutput", "--json 출력이 안정된 스키마를 갖는다"],
              ["nonInteractiveFallback", "모든 명령에 비대화식 경로가 있다"],
              ["respectsTtyAndNoColor", "isatty·NO_COLOR를 존중한다"],
              ["semanticExitCodes", "exit code가 의미 있게 세분화되어 있다 (sysexits.h)"],
              ["streamingEvents", "긴 작업은 NDJSON 이벤트로 스트리밍한다"],
              ["deterministicOutput", "출력이 결정론적이다 (정렬·안정 키 순서)"],
              ["nonInteractiveAuth", "env/토큰 기반 비대화식 인증을 지원한다"],
              ["tokenEfficient", "기본 출력에 배너/아스키아트가 없다 (토큰 효율)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-0.5"
                disabled={disabled}
                checked={data.agentChecklist[key] as boolean}
                onChange={(e) =>
                  updateChecklist({ [key]: e.target.checked } as Partial<AgentFriendlinessChecklist>)
                }
              />
              <span>{label}</span>
            </label>
          ))}
          <div className="space-y-1 pt-2">
            <FieldLabel>MCP 브리지</FieldLabel>
            <select
              disabled={disabled}
              className="flex h-10 w-full max-w-xs rounded-md border border-input bg-background px-3 text-sm"
              value={data.agentChecklist.mcpBridge}
              onChange={(e) =>
                updateChecklist({
                  mcpBridge: e.target.value as AgentFriendlinessChecklist["mcpBridge"],
                })
              }
            >
              <option value="none">none</option>
              <option value="wrapper">wrapper (별도 서브커맨드)</option>
              <option value="native">native (MCP 서버로 기동)</option>
            </select>
          </div>
        </div>
      </SectionGroup>
    </div>
  );
}
