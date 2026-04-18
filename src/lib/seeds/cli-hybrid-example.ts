import { phaseDataSchema, createCliProjectPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

/** CLI — hybrid: 사람·에이전트 모두 1급. 배포·인프라 파이프라인 CLI. */
export function generateCliHybridExample(workspaceId: string): SeededProject {
  const base = createCliProjectPhaseData("hybrid");

  const deployCmdId = uid("cmd");
  const rollbackCmdId = uid("cmd");
  const statusCmdId = uid("cmd");
  const secretsCmdId = uid("cmd");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "shipctl — 하이브리드 배포 CLI",
      elevatorPitch:
        "개발자가 직접 쓰기 좋고, CI·에이전트가 파싱하기도 좋은 배포 도구.",
      background:
        "배포 CLI는 보통 예쁜 UX(sh 스타일)이거나 결정론적(YAML in/JSON out) 중 하나를 택한다. shipctl은 `--format=human|json`과 스마트 TTY 감지로 둘 다 최고로 만든다.",
      coreValueProposition: "1 CLI, 2 청중. 사람에게 친절하고 에이전트에게 예측 가능.",
      businessGoals: [
        "SaaS 유료 계정 2,000",
        "에이전트 세션 월 50만",
        "NPS 55",
      ],
      targetUsers: "SRE/DevOps 엔지니어, 내부 배포 자동화를 설계하는 플랫폼 팀, 그리고 OPS 에이전트.",
      scope: { type: "mvp", details: "deploy/rollback/status/secrets. K8s/Vercel/Flyio 프로바이더 3종." },
      competitors: [
        { id: uid("c"), name: "kubectl", url: "", strength: "표준", weakness: "human UX 부족" },
        { id: uid("c"), name: "flyctl", url: "", strength: "좋은 UX", weakness: "JSON 부재 영역" },
        { id: uid("c"), name: "gh CLI", url: "", strength: "--json 성숙", weakness: "배포 전용 아님" },
      ],
      constraints: ["멀티 프로바이더 플러그인 구조", "audit-log 기본 활성"],
      successMetricGroups: [
        { id: uid("g"), parent: { id: uid("m"), metric: "에이전트 성공 호출률", target: "> 99.2%", measurement: "telemetry" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "Human TTS", target: "첫 배포 < 90s", measurement: "onboard" }, children: [] },
      ],
      milestoneGroups: [
        { id: uid("g"), parent: { id: uid("m"), milestone: "Private Beta", date: "2026-06-15", description: "deploy/status" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "GA 1.0", date: "2026-10-30", description: "MCP wrapper + plugin 3" }, children: [] },
      ],
      references: [
        { id: uid("ref"), title: "flyctl 설계", url: "", notes: "사람 UX 참조" },
        { id: uid("ref"), title: "kubectl --output=json", url: "", notes: "머신 포맷" },
      ],
      techStack: "Go 1.22, cobra, OpenAPI JSON Schema, MCP wrapper (Node bridge)",
      cliMeta: { binaryName: "shipctl", distributionChannels: ["homebrew", "scoop", "docker", "go-install"], primaryRuntime: "go" },
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: uid("p"), name: "김하늘", role: "SRE",
          demographics: "31세, 판교", context: "야간 온콜", techProficiency: "상급",
          behaviors: ["Slack 배포 봇 + CLI 병행"], motivations: ["사고 대응 신속"],
          needs: ["컬러 상태, 즉각 rollback"], painPoints: ["사고 중 JSON 파싱"], frustrations: ["긴 help"],
          goals: ["MTTR 단축"], successCriteria: ["rollback < 20s"],
          quote: "새벽 3시에도 읽히는 CLI를.", actorKind: "human-operator",
        },
        {
          id: uid("p"), name: "Claude Code", role: "AI 배포 에이전트",
          demographics: "LLM", context: "PR 자동 배포 파이프라인",
          techProficiency: "LLM", behaviors: ["--format=json 사용"], motivations: ["결정론"],
          needs: ["stable schema"], painPoints: ["스트리밍 이벤트 부재"], frustrations: ["interactive prompt"],
          goals: ["에이전트 단독 배포"], successCriteria: ["exit 0 + schema match"],
          quote: "", actorKind: "ai-agent", invocationContext: "PR 라벨로 트리거",
        },
        {
          id: uid("p"), name: "GitHub Actions Runner", role: "CI 파이프라인",
          demographics: "워크플로우", context: "PR·main 배포", techProficiency: "자동화",
          behaviors: ["NDJSON 로그"], motivations: ["안정적 로그"], needs: ["--json, 비대화형"],
          painPoints: ["TTY 잘못 감지"], frustrations: ["다운로드 용량"],
          goals: ["배포 자동화 무인 운용"], successCriteria: ["exit code 신뢰"],
          quote: "", actorKind: "ci-pipeline",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: "", asA: "SRE", iWant: "`shipctl status`에서 색상 요약", soThat: "즉시 상황 파악" },
        { id: uid("us"), personaId: "", asA: "에이전트", iWant: "--format=json으로 파싱", soThat: "결정 로직 작성" },
        { id: uid("us"), personaId: "", asA: "CI", iWant: "비대화형 모드에서 prompt 없이 끝남", soThat: "파이프라인 중단 없음" },
      ],
      successScenarios: [
        "개발자가 `shipctl deploy --env prod` → 확인 prompt → 실시간 진행바 → 성공",
        "에이전트가 `shipctl deploy --env prod --yes --format=json` → NDJSON 이벤트 스트림",
      ],
      failureScenarios: [
        "권한 없음 — exit 77 + 컬러(human) / JSON(agent)",
        "rollback 버전 없음 — exit 64 + 후보 목록 힌트",
      ],
    },
    cliRequirements: {
      functional: [
        { id: uid("fr"), title: "듀얼 포맷", description: "--format=human|json, TTY 자동감지", priority: "must", acceptanceCriteria: ["human 기본 TTY", "json 기본 non-TTY"], statement: "하나의 CLI로 두 청중", rationale: "핵심 차별", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "안전 파괴 정책", description: "--yes 없으면 prompt, agent 모드에서는 --yes 필수", priority: "must", acceptanceCriteria: ["prod 환경 이중 확인"], statement: "실수 방지", rationale: "운영 안전", source: "SRE", relatedGoalIds: [] },
        { id: uid("fr"), title: "스트리밍 이벤트", description: "long-running deploy는 NDJSON 이벤트", priority: "should", acceptanceCriteria: ["event-type 스키마"], statement: "에이전트 진행 인지", rationale: "자동화", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "MCP 래퍼", description: "별도 바이너리로 MCP 제공", priority: "should", acceptanceCriteria: ["tools/deploy 노출"], statement: "직결 연동", rationale: "에이전트 생태계", source: "PRD", relatedGoalIds: [] },
      ],
      nonFunctional: [
        { id: uid("n"), category: "performance", description: "deploy 준비 < 3s, status < 500ms" },
        { id: uid("n"), category: "security", description: "비밀은 os-keychain 우선, env-var 폴백" },
        { id: uid("n"), category: "accessibility", description: "NO_COLOR, --no-spinner 지원" },
      ],
      constraints: [
        { id: uid("c"), category: "policy", description: "모든 destructive 액션은 audit-log (JSON)", source: "SecOps", impact: "logsDir 필수" },
      ],
      glossary: [
        { id: uid("g"), term: "hybrid format", definition: "human|json 양방향 출력", kind: "rule", aliases: [] },
      ],
      clarifications: [],
      platformMatrix: { os: ["macos", "linux", "windows"], arch: ["x86_64", "arm64"], shells: ["bash", "zsh", "fish", "powershell"] },
      authMethods: ["env-var", "config-file", "oauth-browser"],
      destructivePolicy: { requiresConfirmation: true, confirmationFlag: "--yes", dryRunSupported: true, auditTrail: "file" },
      performance: { coldStartMs: 60, p95CommandMs: 800, streamingLatencyMs: 100 },
      offlineFirst: false,
      telemetry: { enabled: true, optOutMechanism: "SHIPCTL_TELEMETRY=0 또는 `shipctl config telemetry disable`", collects: ["command name", "exit code", "duration"] },
    },
    commandTree: {
      ...base.commandTree!,
      rootBinary: "shipctl",
      convention: "verb-noun",
      commands: [
        {
          id: deployCmdId, name: "deploy", aliases: [], summary: "앱 배포",
          description: "환경으로 배포. TTY면 진행바, non-TTY면 이벤트 스트림.",
          positional: [{ id: uid("pos"), name: "app", kind: "required", description: "앱 이름" }],
          localFlags: [
            { id: uid("fl"), long: "--env", kind: "enum", enumValues: ["dev", "staging", "prod"], required: true, repeatable: false, description: "대상 환경" },
            { id: uid("fl"), long: "--image", kind: "string", required: false, repeatable: false, description: "이미지 태그" },
            { id: uid("fl"), long: "--yes", short: "-y", kind: "boolean", required: false, repeatable: false, description: "확인 생략 (agent 필수)" },
          ],
          inheritedFlags: ["--format", "--json", "--quiet", "--verbose"], hidden: false, stability: "beta", agentSafe: true, children: [],
        },
        {
          id: rollbackCmdId, name: "rollback", aliases: [], summary: "이전 배포로 롤백",
          description: "지정 버전 또는 직전 성공 배포로 복원",
          positional: [{ id: uid("pos"), name: "app", kind: "required", description: "" }],
          localFlags: [
            { id: uid("fl"), long: "--to", kind: "string", required: false, repeatable: false, description: "배포 id" },
            { id: uid("fl"), long: "--yes", short: "-y", kind: "boolean", required: false, repeatable: false, description: "확인 생략" },
          ],
          inheritedFlags: ["--format", "--json"], hidden: false, stability: "beta", agentSafe: true, children: [],
        },
        {
          id: statusCmdId, name: "status", aliases: ["st"], summary: "배포 상태 조회",
          description: "최근 N개 배포 상태를 표/JSON으로",
          positional: [{ id: uid("pos"), name: "app", kind: "optional", description: "" }],
          localFlags: [
            { id: uid("fl"), long: "--limit", short: "-n", kind: "number", required: false, repeatable: false, description: "", defaultValue: "10" },
          ],
          inheritedFlags: ["--format", "--json"], hidden: false, stability: "stable", agentSafe: true, children: [],
        },
        {
          id: secretsCmdId, name: "secrets", aliases: [], summary: "비밀 관리",
          description: "os-keychain 우선 저장, 출력은 redact",
          positional: [], localFlags: [], inheritedFlags: ["--format"],
          hidden: false, stability: "stable", agentSafe: true,
          children: [
            { id: uid("cmd"), name: "set", aliases: [], summary: "", description: "", positional: [
              { id: uid("pos"), name: "key", kind: "required", description: "" },
              { id: uid("pos"), name: "value", kind: "optional", description: "미지정 시 stdin" },
            ], localFlags: [], inheritedFlags: [], hidden: false, stability: "stable", agentSafe: true, children: [] },
            { id: uid("cmd"), name: "list", aliases: ["ls"], summary: "", description: "", positional: [], localFlags: [], inheritedFlags: [], hidden: false, stability: "stable", agentSafe: true, children: [] },
          ],
        },
      ],
      completions: { shells: ["bash", "zsh", "fish"], strategy: "static-generated" },
      helpStyle: { includeExamplesInHelp: true, includeEnvVarsInHelp: true, colorizeHelp: true },
    },
    cliContract: {
      ...base.cliContract!,
      contracts: [
        {
          commandId: deployCmdId, stdinFormat: "none", stdoutModes: ["human-pretty", "json", "ndjson"],
          defaultMode: "human-pretty", stdoutSchemaVersion: "1.0.0",
          stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공", category: "success" },
            { code: 64, when: "사용 오류", category: "usage" },
            { code: 77, when: "권한 부족", category: "permission" },
            { code: 75, when: "일시 장애", category: "temporary" },
          ],
          streaming: "stdout-ndjson",
          interactivity: { promptsIfTTY: true, nonInteractiveFallback: "--yes 요구", respectsNoInput: true },
          progressReporting: "bar", idempotent: true, safeToRetry: false,
          samples: [
            { label: "human", mode: "human", invocation: "shipctl deploy myapp --env prod", stdout: "✔ Deployed myapp:prod (deploy #231)", exitCode: 0 },
            { label: "agent ndjson", mode: "agent", invocation: "shipctl deploy myapp --env prod --yes --format=ndjson",
              stdout: '{"event":"start","id":"231"}\n{"event":"step","name":"build","status":"ok"}\n{"event":"done","status":"ok"}\n', exitCode: 0 },
          ],
        },
        {
          commandId: rollbackCmdId, stdinFormat: "none", stdoutModes: ["human-pretty", "json"],
          defaultMode: "human-pretty", stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공", category: "success" },
            { code: 64, when: "배포 id 없음", category: "usage" },
          ],
          streaming: "none",
          interactivity: { promptsIfTTY: true, nonInteractiveFallback: "--yes 요구", respectsNoInput: true },
          progressReporting: "spinner", idempotent: false, safeToRetry: true,
          samples: [{ label: "rollback", mode: "human", invocation: "shipctl rollback myapp", stdout: "↩ Rolled back myapp to deploy #230", exitCode: 0 }],
        },
        {
          commandId: statusCmdId, stdinFormat: "none", stdoutModes: ["human-pretty", "json"],
          defaultMode: "human-pretty", stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [{ code: 0, when: "성공", category: "success" }],
          streaming: "none",
          interactivity: { promptsIfTTY: false, nonInteractiveFallback: "", respectsNoInput: true },
          progressReporting: "none", idempotent: true, safeToRetry: true,
          samples: [
            { label: "human", mode: "human", invocation: "shipctl status myapp", stdout: "┏━━━━━━━┓\n┃ myapp ┃\n┗━━━━━━━┛\ndeploy #231  prod  OK  3m ago", exitCode: 0 },
            { label: "agent json", mode: "agent", invocation: "shipctl status myapp --format=json",
              stdout: '{"schemaVersion":"1.0.0","deploys":[{"id":"231","env":"prod","status":"ok"}]}', exitCode: 0 },
          ],
        },
        {
          commandId: secretsCmdId, stdinFormat: "text", stdoutModes: ["human-pretty", "json"],
          defaultMode: "human-pretty", stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공", category: "success" },
            { code: 77, when: "키링 권한 거부", category: "permission" },
          ],
          streaming: "none",
          interactivity: { promptsIfTTY: true, nonInteractiveFallback: "stdin 필수", respectsNoInput: true },
          progressReporting: "none", idempotent: true, safeToRetry: true,
          samples: [{ label: "set via stdin", mode: "agent", invocation: "echo $TOKEN | shipctl secrets set API_KEY", stdout: "saved API_KEY", exitCode: 0 }],
        },
      ],
    },
    cliConfig: {
      ...base.cliConfig!,
      configFiles: [
        { id: uid("cf"), locationPriority: ["$XDG_CONFIG_HOME/shipctl/config.toml"], format: "toml", jsonSchema: "", description: "유저 전역 설정", mergeStrategy: "deep" },
        { id: uid("cf"), locationPriority: ["shipctl.toml", ".shipctl/config.toml"], format: "toml", jsonSchema: "", description: "프로젝트 설정", mergeStrategy: "deep" },
      ],
      envVars: [
        { id: uid("ev"), name: "SHIPCTL_TOKEN", purpose: "API 토큰", required: false, sensitive: true },
        { id: uid("ev"), name: "SHIPCTL_TELEMETRY", purpose: "텔레메트리 on/off", required: false, sensitive: false, defaultValue: "1" },
        { id: uid("ev"), name: "NO_COLOR", purpose: "색상 비활성", required: false, sensitive: false },
      ],
      outputSchemas: [
        { id: uid("os"), version: "1.0.0", describes: "deploy.event", jsonSchema: "{…}", stabilityGuarantee: "beta" },
        { id: uid("os"), version: "1.0.0", describes: "status.response", jsonSchema: "{…}", stabilityGuarantee: "stable" },
      ],
    },
    cliTerminalUx: {
      ...base.cliTerminalUx!,
      iconSet: "ascii",
      tableStyle: "unicode-box",
      errorTemplates: [
        { id: uid("et"), scenario: "prod 배포 거부", whatWentWrong: "권한 부족", whyItHappened: "RBAC 역할 누락", howToFix: "SRE 관리자에게 권한 요청", relatedCommand: "deploy", exitCode: 77 },
        { id: uid("et"), scenario: "비대화형에서 --yes 없음", whatWentWrong: "입력 대기", whyItHappened: "CI 환경 검출", howToFix: "--yes 또는 --format=json + --yes 조합", relatedCommand: "deploy", exitCode: 64 },
      ],
      toneLevel: 3,
      uxWritingGlossary: [
        { term: "deploy", avoid: "ship only", context: "명사·동사 일관" },
        { term: "audit-log", avoid: "history", context: "감사 기록" },
      ],
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "shipctl — 하이브리드 배포 CLI",
    type: "cli",
    cliSubType: "hybrid",
    phases,
    createdAtOffset: 120_000,
  });
}
