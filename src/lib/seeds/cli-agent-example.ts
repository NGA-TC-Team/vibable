import { phaseDataSchema, createCliProjectPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

/** CLI — agent-first: MCP·JSON 우선, AI 에이전트가 호출하는 CLI */
export function generateCliAgentExample(workspaceId: string): SeededProject {
  const base = createCliProjectPhaseData("agent-first");

  const queryCmdId = uid("cmd");
  const ingestCmdId = uid("cmd");
  const exportCmdId = uid("cmd");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "atlasctl — Agent-Native Knowledge CLI",
      elevatorPitch:
        "AI 에이전트를 1차 사용자로 설계한 지식 베이스 CLI. JSON/NDJSON 우선, 결정론적 출력.",
      background:
        "Claude Code·ChatGPT가 CLI를 자주 호출하지만 대부분 human-first로 설계되어 파싱 오류, 프롬프트 낭비가 잦다. atlasctl은 토큰 효율·결정론을 최우선.",
      coreValueProposition:
        "안정적 JSON 스키마 + MCP 네이티브 + 0-버전 표기. 에이전트가 실수하지 않는 CLI.",
      businessGoals: [
        "MCP 마켓플레이스 상위 10",
        "월간 에이전트 세션 100만",
        "에이전트 호출 오류율 < 0.5%",
      ],
      targetUsers: "Claude Code·Cursor·AutoGen·OpenClaw 같은 에이전트 런타임과, 그것을 튜닝하는 플랫폼 엔지니어.",
      scope: { type: "mvp", details: "query/ingest/export + MCP 어댑터. 웹 UI 없음." },
      competitors: [
        { id: uid("c"), name: "jq", url: "https://jqlang.github.io/jq/", strength: "표준", weakness: "도메인 파이프라인 부재" },
        { id: uid("c"), name: "gh CLI", url: "https://cli.github.com", strength: "양질 UX", weakness: "human-first" },
      ],
      constraints: ["반드시 stdout=데이터 / stderr=로그 분리", "재실행 안전 — 동일 입력 동일 출력"],
      successMetricGroups: [
        { id: uid("g"), parent: { id: uid("m"), metric: "에이전트 호출 오류율", target: "< 0.5%", measurement: "MCP 텔레메트리" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "평균 토큰/호출", target: "< 200", measurement: "응답 크기 측정" }, children: [] },
      ],
      milestoneGroups: [
        { id: uid("g"), parent: { id: uid("m"), milestone: "MCP 0.1 Preview", date: "2026-05-20", description: "query + ingest" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "MCP 1.0", date: "2026-08-10", description: "stable JSON schema + streaming events" }, children: [] },
      ],
      references: [
        { id: uid("ref"), title: "MCP 스펙", url: "https://modelcontextprotocol.io", notes: "네이티브 브릿지" },
        { id: uid("ref"), title: "gh CLI JSON API", url: "", notes: "--json 패턴 참조" },
      ],
      techStack: "Bun + TypeScript, sqlite (vector + FTS), MCP SDK, JSON Schema 2020-12",
      cliMeta: {
        binaryName: "atlasctl",
        distributionChannels: ["npm", "homebrew", "docker", "standalone-binary"],
        primaryRuntime: "bun",
      },
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: uid("p"), name: "Claude (planner-subagent)", role: "AI 플래너 에이전트",
          demographics: "LLM 런타임", context: "Claude Code 안에서 MCP 서버로 호출",
          techProficiency: "LLM", behaviors: ["JSON 파싱", "exit code로 분기"],
          motivations: ["토큰 절약·결정론"], needs: ["응답 스키마 불변"],
          painPoints: ["무결 출력 포맷 흔들림"], frustrations: ["도움말 텍스트 파싱"],
          goals: ["첫 호출에 성공"], successCriteria: ["exit 0 + valid JSON"],
          quote: "", actorKind: "ai-agent", invocationContext: "Claude Code hook 또는 MCP resource",
        },
        {
          id: uid("p"), name: "배현우", role: "플랫폼 엔지니어",
          demographics: "32세", context: "내부 RAG 파이프라인 운영",
          techProficiency: "상급", behaviors: ["CI에서 CLI 호출", "로그를 JSON 수집"],
          motivations: ["에이전트 자동화 안정화"], needs: ["버저닝·스키마"],
          painPoints: ["human-CLI가 파이프라인 깨뜨림"], frustrations: ["버전 업글 후 스크립트 깨짐"],
          goals: ["SemVer 지킴"], successCriteria: ["stdoutSchemaVersion 태그"],
          quote: "기계가 안심하고 호출할 인터페이스를.", actorKind: "ci-pipeline",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: "", asA: "에이전트", iWant: "질의 결과를 NDJSON으로 받고", soThat: "스트리밍 처리한다" },
        { id: uid("us"), personaId: "", asA: "에이전트", iWant: "exit code로 성공/원인 구분", soThat: "분기한다" },
        { id: uid("us"), personaId: "", asA: "엔지니어", iWant: "MCP 네이티브로 연동", soThat: "어댑터 없이 호출한다" },
      ],
      successScenarios: [
        "Claude가 atlasctl query --json 실행 → NDJSON 3건 스트림 → 즉시 파싱·요약",
      ],
      failureScenarios: [
        "쿼터 초과 시 exit 69 + 머신 가독 JSON 에러 — 에이전트는 backoff",
      ],
    },
    cliRequirements: {
      functional: [
        { id: uid("fr"), title: "JSON 우선 출력", description: "모든 커맨드 기본 --json 동등", priority: "must", acceptanceCriteria: ["NDJSON 스트리밍", "스키마 버전 태깅"], statement: "결정론적 파싱", rationale: "토큰 절약", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "MCP 네이티브", description: "atlasctl mcp 서버 모드", priority: "must", acceptanceCriteria: ["stdio transport", "tools/resources 노출"], statement: "에이전트 직결", rationale: "차별점", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "시맨틱 exit 코드", description: "BSD sysexits 기반", priority: "must", acceptanceCriteria: ["64=usage, 69=unavailable"], statement: "오류 분기 용이", rationale: "자동화", source: "표준", relatedGoalIds: [] },
        { id: uid("fr"), title: "비대화형 강제", description: "TTY 감지해도 prompt 금지 (에이전트 세션)", priority: "must", acceptanceCriteria: ["--no-input 무조건 respect"], statement: "데드락 방지", rationale: "안정성", source: "PRD", relatedGoalIds: [] },
      ],
      nonFunctional: [
        { id: uid("n"), category: "performance", description: "cold start < 80ms" },
        { id: uid("n"), category: "security", description: "secret은 환경변수만 수용" },
      ],
      constraints: [
        { id: uid("c"), category: "policy", description: "stdout에는 데이터만, 진단은 stderr", source: "설계 원칙", impact: "혼합 금지" },
      ],
      glossary: [
        { id: uid("g"), term: "결정론적 출력", definition: "동일 입력에 동일 바이트 출력", kind: "rule", aliases: [] },
        { id: uid("g"), term: "MCP", definition: "Model Context Protocol", kind: "term", aliases: [] },
      ],
      clarifications: [],
      platformMatrix: { os: ["macos", "linux"], arch: ["x86_64", "arm64"], shells: ["bash"] },
      authMethods: ["env-var"],
      destructivePolicy: { requiresConfirmation: false, confirmationFlag: "--yes", dryRunSupported: true, auditTrail: "stderr-log" },
      performance: { coldStartMs: 80, p95CommandMs: 500, streamingLatencyMs: 50 },
      offlineFirst: false,
      telemetry: { enabled: false, optOutMechanism: "기본 비활성", collects: [] },
    },
    commandTree: {
      ...base.commandTree!,
      rootBinary: "atlasctl",
      convention: "verb-noun",
      commands: [
        {
          id: queryCmdId, name: "query", aliases: [], summary: "지식 베이스 질의 (JSON/NDJSON)",
          description: "벡터 + FTS 하이브리드 질의. 기본 NDJSON 스트림. 스키마 버전 태깅.",
          positional: [{ id: uid("pos"), name: "query", kind: "required", description: "질의 문자열" }],
          localFlags: [
            { id: uid("fl"), long: "--limit", short: "-n", kind: "number", required: false, repeatable: false, description: "결과 개수 상한", defaultValue: "10" },
            { id: uid("fl"), long: "--schema-version", kind: "string", required: false, repeatable: false, description: "응답 스키마 버전 고정", defaultValue: "1.0.0" },
          ],
          inheritedFlags: ["--json", "--quiet", "--no-input"], hidden: false, stability: "stable", agentSafe: true, children: [],
        },
        {
          id: ingestCmdId, name: "ingest", aliases: [], summary: "문서 적재",
          description: "stdin(JSON) 또는 경로 입력. 재실행 안전(idempotent).",
          positional: [{ id: uid("pos"), name: "path", kind: "optional", description: "" }],
          localFlags: [
            { id: uid("fl"), long: "--source", kind: "string", required: true, repeatable: false, description: "출처 식별자" },
            { id: uid("fl"), long: "--dedupe-on", kind: "string", required: false, repeatable: false, description: "중복 키", defaultValue: "url" },
          ],
          inheritedFlags: ["--json"], hidden: false, stability: "stable", agentSafe: true, children: [],
        },
        {
          id: exportCmdId, name: "export", aliases: [], summary: "지식 베이스 스냅샷 내보내기",
          description: "NDJSON 스트림, 결정론적 정렬",
          positional: [], localFlags: [
            { id: uid("fl"), long: "--since", kind: "string", required: false, repeatable: false, description: "ISO 시각 이후만" },
          ],
          inheritedFlags: ["--json"], hidden: false, stability: "beta", agentSafe: true, children: [],
        },
      ],
      completions: { shells: ["bash"], strategy: "none" },
      helpStyle: { includeExamplesInHelp: true, includeEnvVarsInHelp: true, colorizeHelp: false },
    },
    cliContract: {
      ...base.cliContract!,
      contracts: [
        {
          commandId: queryCmdId, stdinFormat: "none", stdoutModes: ["json", "ndjson"],
          defaultMode: "ndjson", stdoutSchemaVersion: "1.0.0", stdoutSchemaRef: "schemas/query.result.v1.json",
          stderr: { diagnosticsFormat: "json", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공 + 결과", category: "success" },
            { code: 64, when: "사용 오류 (sysexits.h)", category: "usage" },
            { code: 69, when: "서비스 이용 불가", category: "unavailable" },
            { code: 78, when: "설정 오류", category: "config" },
          ],
          streaming: "stdout-ndjson",
          interactivity: { promptsIfTTY: false, nonInteractiveFallback: "기본", respectsNoInput: true },
          progressReporting: "events", idempotent: true, safeToRetry: true,
          samples: [
            { label: "NDJSON 스트림", mode: "agent", invocation: "atlasctl query 'RAG' --limit 2",
              stdin: "", stdout: '{"schemaVersion":"1.0.0","id":"doc1","score":0.92}\n{"schemaVersion":"1.0.0","id":"doc2","score":0.88}\n',
              stderr: '{"level":"info","msg":"2 hits"}\n', exitCode: 0 },
          ],
        },
        {
          commandId: ingestCmdId, stdinFormat: "ndjson", stdoutModes: ["json"],
          defaultMode: "json", stdoutSchemaVersion: "1.0.0", stderr: { diagnosticsFormat: "json", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공", category: "success" },
            { code: 64, when: "입력 스키마 오류", category: "input" },
            { code: 75, when: "일시 장애", category: "temporary" },
          ],
          streaming: "none",
          interactivity: { promptsIfTTY: false, nonInteractiveFallback: "기본", respectsNoInput: true },
          progressReporting: "events", idempotent: true, safeToRetry: true,
          samples: [{ label: "ingest", mode: "agent", invocation: "cat docs.ndjson | atlasctl ingest --source=wiki",
            stdin: '{"url":"...","title":"...","body":"..."}\n', stdout: '{"schemaVersion":"1.0.0","ingested":1,"skipped":0}\n', exitCode: 0 }],
        },
        {
          commandId: exportCmdId, stdinFormat: "none", stdoutModes: ["ndjson"],
          defaultMode: "ndjson", stdoutSchemaVersion: "1.0.0", stderr: { diagnosticsFormat: "json", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공", category: "success" },
            { code: 75, when: "일시 장애", category: "temporary" },
          ],
          streaming: "stdout-ndjson",
          interactivity: { promptsIfTTY: false, nonInteractiveFallback: "기본", respectsNoInput: true },
          progressReporting: "events", idempotent: true, safeToRetry: true,
          samples: [{ label: "export since", mode: "agent", invocation: "atlasctl export --since 2026-04-01T00:00:00Z",
            stdout: '{"schemaVersion":"1.0.0","id":"doc1",...}\n', exitCode: 0 }],
        },
      ],
    },
    cliConfig: {
      ...base.cliConfig!,
      configFiles: [
        { id: uid("cf"), locationPriority: ["$ATLAS_CONFIG", "$XDG_CONFIG_HOME/atlasctl/config.toml"], format: "toml", jsonSchema: "schemas/config.v1.json", description: "저장소·모델 설정", mergeStrategy: "override" },
      ],
      envVars: [
        { id: uid("ev"), name: "ATLAS_API_KEY", purpose: "호스팅 버전 인증", required: false, sensitive: true },
        { id: uid("ev"), name: "ATLAS_DB_PATH", purpose: "sqlite 경로", required: false, sensitive: false, defaultValue: "$XDG_STATE_HOME/atlasctl/db.sqlite" },
        { id: uid("ev"), name: "NO_COLOR", purpose: "색상 비활성", required: false, sensitive: false },
      ],
      outputSchemas: [
        { id: uid("os"), version: "1.0.0", describes: "query.result", jsonSchema: "{…}", stabilityGuarantee: "stable" },
        { id: uid("os"), version: "1.0.0", describes: "ingest.result", jsonSchema: "{…}", stabilityGuarantee: "stable" },
      ],
      entityReuse: true,
    },
    cliTerminalUx: {
      ...base.cliTerminalUx!,
      iconSet: "none",
      tableStyle: "plain",
      errorTemplates: [
        { id: uid("et"), scenario: "스키마 불일치", whatWentWrong: "stdout schema version mismatch", whyItHappened: "--schema-version 미지원", howToFix: "atlasctl --schema-version=1.0.0 고정", relatedCommand: "query", exitCode: 78 },
        { id: uid("et"), scenario: "일시 장애", whatWentWrong: "back-end 503", whyItHappened: "upstream down", howToFix: "지수 백오프 재시도", relatedCommand: "query", exitCode: 75 },
      ],
      toneLevel: 1,
      uxWritingGlossary: [
        { term: "schemaVersion", avoid: "version", context: "응답" },
      ],
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "atlasctl — 에이전트 네이티브 CLI",
    type: "cli",
    cliSubType: "agent-first",
    phases,
    createdAtOffset: 90_000,
  });
}
