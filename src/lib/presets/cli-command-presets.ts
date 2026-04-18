import type {
  CliFlag,
  CommandConvention,
  CommandNode,
} from "@/types/phases";

export interface CliCommandPreset {
  id: string;
  label: string;
  description: string;
  convention: CommandConvention;
  commands: CommandNode[];
  globalFlags: CliFlag[];
  example: string;
}

const uuid = () =>
  typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

function flag(
  long: string,
  opts: Partial<CliFlag> = {},
): CliFlag {
  return {
    id: uuid(),
    long,
    short: opts.short,
    kind: opts.kind ?? "boolean",
    enumValues: opts.enumValues,
    defaultValue: opts.defaultValue,
    required: opts.required ?? false,
    repeatable: opts.repeatable ?? false,
    envVar: opts.envVar,
    mutuallyExclusiveWith: opts.mutuallyExclusiveWith,
    description: opts.description ?? "",
    hiddenFromHelp: opts.hiddenFromHelp,
  };
}

function cmd(
  name: string,
  opts: Partial<CommandNode> = {},
): CommandNode {
  return {
    id: uuid(),
    name,
    aliases: opts.aliases ?? [],
    summary: opts.summary ?? "",
    description: opts.description ?? opts.summary ?? "",
    positional: opts.positional ?? [],
    localFlags: opts.localFlags ?? [],
    inheritedFlags: opts.inheritedFlags ?? [],
    hidden: opts.hidden ?? false,
    stability: opts.stability ?? "experimental",
    agentSafe: opts.agentSafe ?? true,
    children: opts.children ?? [],
  };
}

const commonGlobalFlags: CliFlag[] = [
  flag("--help", { short: "-h", description: "도움말 표시" }),
  flag("--version", { description: "버전 표시" }),
  flag("--verbose", { short: "-v", kind: "count", repeatable: true, description: "상세 로그" }),
  flag("--quiet", { short: "-q", description: "최소 출력" }),
  flag("--no-color", { description: "색상 비활성 (NO_COLOR 존중)" }),
  flag("--json", { description: "JSON 출력" }),
  flag("--yes", { short: "-y", description: "모든 확인에 yes" }),
];

export const CLI_COMMAND_PRESETS: CliCommandPreset[] = [
  {
    id: "posix-minimal",
    label: "POSIX Minimal",
    description: "평면 구조 + 짧은 옵션 중심 (grep, sed 계열)",
    convention: "posix-minimal",
    globalFlags: [
      flag("--help", { short: "-h", description: "도움말" }),
      flag("--version", { description: "버전" }),
    ],
    commands: [
      cmd("run", {
        summary: "기본 동작 실행",
        positional: [
          { id: uuid(), name: "INPUT", kind: "required", description: "입력 파일 또는 stdin" },
        ],
        localFlags: [
          flag("-i", { description: "대소문자 무시" }),
          flag("-n", { kind: "number", description: "최대 결과 수" }),
        ],
        stability: "stable",
      }),
    ],
    example: "mytool run INPUT -i -n 10",
  },
  {
    id: "git-style",
    label: "git-style (verb-noun)",
    description: "동사 중심 서브커맨드 (git commit, heroku create)",
    convention: "verb-noun",
    globalFlags: commonGlobalFlags,
    commands: [
      cmd("create", { summary: "리소스 생성" }),
      cmd("list", { summary: "리소스 나열", aliases: ["ls"] }),
      cmd("delete", {
        summary: "리소스 삭제",
        aliases: ["rm"],
        agentSafe: false,
        localFlags: [flag("--force", { short: "-f", description: "확인 없이 강제 삭제" })],
      }),
    ],
    example: "mytool create --name foo",
  },
  {
    id: "docker-style",
    label: "docker-style (noun-verb)",
    description: "명사 → 동사 순서 (docker image pull)",
    convention: "noun-verb",
    globalFlags: commonGlobalFlags,
    commands: [
      cmd("project", {
        summary: "프로젝트 관리",
        children: [
          cmd("create", { summary: "프로젝트 생성" }),
          cmd("list", { summary: "프로젝트 나열" }),
          cmd("remove", { summary: "프로젝트 제거", agentSafe: false }),
        ],
      }),
      cmd("run", { summary: "작업 실행" }),
    ],
    example: "mytool project create --name foo",
  },
  {
    id: "kubernetes-style",
    label: "kubectl-style",
    description: "kubectl <verb> <noun> -o <format>",
    convention: "kubernetes-style",
    globalFlags: [
      ...commonGlobalFlags,
      flag("--output", { short: "-o", kind: "enum", enumValues: ["json", "yaml", "jsonpath", "go-template"], description: "출력 포맷" }),
      flag("--context", { kind: "string", description: "컨텍스트" }),
      flag("--namespace", { short: "-n", kind: "string", description: "네임스페이스" }),
    ],
    commands: [
      cmd("get", {
        summary: "리소스 조회",
        positional: [{ id: uuid(), name: "RESOURCE", kind: "required", description: "리소스 종류" }],
      }),
      cmd("apply", {
        summary: "리소스 적용",
        localFlags: [flag("-f", { kind: "path", required: true, description: "매니페스트 파일" })],
      }),
      cmd("delete", { summary: "리소스 삭제", agentSafe: false }),
    ],
    example: "mytool get pods -o json -n default",
  },
  {
    id: "heroku-style",
    label: "heroku-style",
    description: "tool command:subcommand (heroku ps:scale)",
    convention: "verb-noun",
    globalFlags: commonGlobalFlags,
    commands: [
      cmd("ps", {
        summary: "프로세스 관리",
        children: [
          cmd("scale", { summary: "스케일 조정" }),
          cmd("restart", { summary: "재시작" }),
        ],
      }),
    ],
    example: "mytool ps:scale web=2",
  },
  {
    id: "mcp-server-style",
    label: "MCP 서버 스타일",
    description: "stdio JSON-RPC 단일 진입 — AI 에이전트 호출 전용",
    convention: "posix-minimal",
    globalFlags: [
      flag("--help", { short: "-h", description: "도움말" }),
      flag("--version", { description: "버전" }),
      flag("--stdio", { description: "stdio JSON-RPC 모드 (기본)" }),
      flag("--http", { kind: "string", description: "HTTP 모드로 전환하고 바인드 주소 지정" }),
      flag("--log-level", { kind: "enum", enumValues: ["error", "warn", "info", "debug"], description: "로그 레벨" }),
    ],
    commands: [
      cmd("serve", {
        summary: "MCP 서버 기동",
        stability: "stable",
        agentSafe: true,
      }),
    ],
    example: "mytool serve --stdio",
  },
  {
    id: "claude-code-style",
    label: "Claude Code 스타일",
    description: "--print 비대화식 + 대화식 REPL 겸용",
    convention: "posix-minimal",
    globalFlags: [
      flag("--help", { short: "-h", description: "도움말" }),
      flag("--version", { description: "버전" }),
      flag("--print", { short: "-p", description: "비대화식: stdout으로 결과만 출력" }),
      flag("--output-format", { kind: "enum", enumValues: ["text", "json", "stream-json"], description: "출력 포맷" }),
      flag("--input-format", { kind: "enum", enumValues: ["text", "stream-json"], description: "입력 포맷" }),
      flag("--resume", { kind: "string", description: "세션 이어서" }),
      flag("--model", { kind: "string", description: "모델 선택" }),
      flag("--no-color", { description: "색상 비활성" }),
    ],
    commands: [
      cmd("run", {
        summary: "기본 실행 (기본 대화식, -p로 비대화식)",
        positional: [{ id: uuid(), name: "PROMPT", kind: "optional", description: "프롬프트 텍스트 또는 stdin" }],
        stability: "stable",
      }),
    ],
    example: 'mytool -p "요약해줘" --output-format stream-json',
  },
];
