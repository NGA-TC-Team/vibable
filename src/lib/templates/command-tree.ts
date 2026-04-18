import type { PhaseTemplate } from "./index";

export const commandTreeTemplates: PhaseTemplate[] = [
  {
    id: "cmd-tree-reverse-engineer",
    name: "기존 도구 역공학",
    description: "git·kubectl·gh 등 기존 CLI의 커맨드 트리를 참조해 초안을 생성합니다.",
    promptTemplate: `당신은 CLI 아키텍트입니다. 아래 요구사항을 바탕으로 vibable commandTree JSON을 출력하세요.
스키마: { "rootBinary":"...", "convention":"verb-noun|noun-verb|posix-minimal|kubernetes-style|rust-clap|cobra-go|custom",
  "globalFlags":[CliFlag], "commands":[CommandNode], "completions":{"shells":[],"strategy":"static-generated|runtime-completion|none"},
  "helpStyle":{"includeExamplesInHelp":bool,"includeEnvVarsInHelp":bool,"colorizeHelp":bool} }
CliFlag: { id, long, short?, kind, required, repeatable, description, enumValues?, envVar? }
CommandNode: { id, name, aliases, summary, description, positional, localFlags, inheritedFlags, hidden, stability, agentSafe, children }

규칙:
- 모든 파괴적 커맨드(delete/reset 등)는 agentSafe:false로
- globalFlags에 --help/--version/--verbose/--quiet/--no-color/--json 기본 포함
- id는 uuid 대신 "cmd-<name>" 식별자로 가볍게`,
  },
  {
    id: "cmd-tree-mece",
    name: "서브커맨드 MECE 검토",
    description: "기능 목록을 MECE로 분해해 트리 중복·누락을 체크하고 재구성안을 냅니다.",
    promptTemplate: `기능 목록을 입력받아 중복 없는 배타적이고 완전한(MECE) 커맨드 트리를 출력하세요.
JSON 루트: { "tree":[CommandNode], "rationale":"...", "conflicts":[...] }
- conflicts에는 원본에서 발견된 중복/누락 사례를 기록
- 한 커맨드에 3개 이상의 동사 의미가 섞이면 분할 권장`,
  },
  {
    id: "cmd-tree-global-flags",
    name: "글로벌 플래그 일관성",
    description: "서브타입(human/agent/hybrid)에 맞는 글로벌 플래그 세트를 제안합니다.",
    promptTemplate: `입력: cliSubType(human-first|agent-first|hybrid).
출력: { "globalFlags":[CliFlag], "helpStyle":{...}, "completions":{...} } JSON.

human-first 기본: --help -h, --version, -v/--verbose (count), --quiet -q, --no-color
agent-first 기본: --help -h, --version, --json, --quiet, --no-input
hybrid: 위 두 세트를 합치되 중복 제거 (--quiet 등)
추가로 CLI guidelines(clig.dev) 기준으로 누락된 것 경고.`,
  },
];
