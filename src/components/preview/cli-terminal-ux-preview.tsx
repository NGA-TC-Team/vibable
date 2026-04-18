"use client";

import { usePhaseData } from "@/hooks/use-phase.hook";
import { TerminalBlock } from "@/components/preview/terminal/terminal-block";
import { ansiColorToHex } from "@/lib/cli/ansi-to-react";
import type { AnsiColor } from "@/types/phases";

const ANSI_CODE_MAP: Record<AnsiColor, number> = {
  black: 30,
  red: 31,
  green: 32,
  yellow: 33,
  blue: 34,
  magenta: 35,
  cyan: 36,
  white: 37,
  brightBlack: 90,
  brightRed: 91,
  brightGreen: 92,
  brightYellow: 93,
  brightBlue: 94,
  brightMagenta: 95,
  brightCyan: 96,
  brightWhite: 97,
};

function ansiWrap(text: string, color: AnsiColor): string {
  return `\x1b[${ANSI_CODE_MAP[color]}m${text}\x1b[0m`;
}

export function CliTerminalUxPreview() {
  const { data } = usePhaseData("cliTerminalUx");

  if (!data) return null;

  const { palette, agentChecklist } = data;

  const sampleHuman = [
    ansiWrap("$ mytool run --verbose", palette.muted),
    "",
    `${ansiWrap("→", palette.primary)} 시작: 3개의 파일 처리`,
    `${ansiWrap("✓", palette.success)} src/a.ts`,
    `${ansiWrap("✓", palette.success)} src/b.ts`,
    `${ansiWrap("✗", palette.danger)} src/c.ts — 구문 오류`,
    "",
    ansiWrap("완료 (2/3 성공, 1 실패)", palette.info),
  ].join("\n");

  const sampleAgent = `$ mytool run --json --no-color
{
  "schemaVersion": "1.0.0",
  "ok": false,
  "processed": 3,
  "succeeded": 2,
  "failed": 1,
  "errors": [
    { "file": "src/c.ts", "exitCode": 65, "message": "syntax error" }
  ]
}`;

  return (
    <div className="space-y-4">
      <section>
        <h3 className="mb-1 text-base font-semibold">팔레트</h3>
        <div className="flex flex-wrap gap-2 text-xs">
          {(
            [
              ["primary", palette.primary],
              ["success", palette.success],
              ["warning", palette.warning],
              ["danger", palette.danger],
              ["info", palette.info],
              ["muted", palette.muted],
            ] as [string, AnsiColor][]
          ).map(([role, color]) => (
            <div key={role} className="flex items-center gap-1.5">
              <span
                className="inline-block size-4 rounded border"
                style={{ backgroundColor: ansiColorToHex(color, palette) }}
              />
              <span className="font-mono text-muted-foreground">
                {role}: {color}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-base font-semibold">샘플 출력</h3>
        <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
          <TerminalBlock title="human" mode="TTY">
            {sampleHuman}
          </TerminalBlock>
          <TerminalBlock title="agent" mode="--json">
            {sampleAgent}
          </TerminalBlock>
        </div>
      </section>

      <section>
        <h3 className="mb-1 text-base font-semibold">
          에이전트 친화도 ({data.agentChecklist.mcpBridge})
        </h3>
        <ul className="space-y-0.5 text-xs">
          {(
            [
              ["stableJsonOutput", "--json 안정 스키마"],
              ["nonInteractiveFallback", "비대화식 경로"],
              ["respectsTtyAndNoColor", "NO_COLOR/isatty 존중"],
              ["semanticExitCodes", "의미 있는 exit code"],
              ["streamingEvents", "NDJSON 스트리밍"],
              ["deterministicOutput", "결정론적 출력"],
              ["nonInteractiveAuth", "비대화식 인증"],
              ["tokenEfficient", "토큰 효율"],
            ] as const
          ).map(([key, label]) => (
            <li key={key} className="flex items-center gap-2">
              <span
                className={
                  agentChecklist[key]
                    ? "text-green-600 dark:text-green-400"
                    : "text-muted-foreground"
                }
              >
                {agentChecklist[key] ? "✓" : "—"}
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </section>

      {data.errorTemplates.length > 0 && (
        <section>
          <h3 className="mb-1 text-base font-semibold">에러 메시지 샘플</h3>
          {data.errorTemplates.slice(0, 2).map((et) => (
            <TerminalBlock key={et.id} title={et.scenario}>
              {`${ansiWrap("Error:", palette.danger)} ${et.whatWentWrong}
${ansiWrap("Why:", palette.muted)}   ${et.whyItHappened}
${ansiWrap("Fix:", palette.info)}   ${et.howToFix}
${ansiWrap(`(exit ${et.exitCode})`, palette.muted)}`}
            </TerminalBlock>
          ))}
        </section>
      )}
    </div>
  );
}
