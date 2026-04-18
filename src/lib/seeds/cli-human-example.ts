import { phaseDataSchema, createCliProjectPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

/** CLI — human-first: 개발자 생산성 CLI (파일 검색·대체) */
export function generateCliHumanExample(workspaceId: string): SeededProject {
  const base = createCliProjectPhaseData("human-first");

  const findCmdId = uid("cmd");
  const replaceCmdId = uid("cmd");
  const configCmdId = uid("cmd");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "rk — Ripkit",
      elevatorPitch:
        "ripgrep 위에 얹는 컨텍스트 인식 검색·리팩터 CLI. 사람이 즐겁게 타이핑하는 도구.",
      background:
        "개발자는 하루에도 수십 번 검색·치환을 반복한다. `rg`는 빠르지만 반복적 리팩터 워크플로가 없다. Ripkit은 검색·대체·북마크·히스토리를 한 셸에서.",
      coreValueProposition: "빠른 검색 + 친숙한 대화형 치환 + 북마크 + 셸 통합.",
      businessGoals: [
        "Homebrew 설치 1만 달성 (1년)",
        "GitHub 스타 3천",
        "Dev Twitter에서 '사랑스러운 CLI'로 회자",
      ],
      targetUsers: "macOS/Linux 터미널 상주 개발자. zsh/fish 사용, 색상·키바인딩 선호.",
      scope: { type: "mvp", details: "find/replace/config/bookmark 4개 서브커맨드. 언어별 파싱은 v2." },
      competitors: [
        { id: uid("c"), name: "ripgrep", url: "https://github.com/BurntSushi/ripgrep", strength: "속도", weakness: "대화형 치환 없음" },
        { id: uid("c"), name: "fd + sd", url: "", strength: "단순함", weakness: "통합 경험 부족" },
      ],
      constraints: ["1인 OSS", "Rust로 단일 바이너리 배포", "MIT 라이선스"],
      successMetricGroups: [
        { id: uid("g"), parent: { id: uid("m"), metric: "Homebrew 설치", target: "10,000 (12M)", measurement: "homebrew-core stats" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "첫 사용→2일차 재사용률", target: "55%", measurement: "opt-in telemetry" }, children: [] },
      ],
      milestoneGroups: [
        { id: uid("g"), parent: { id: uid("m"), milestone: "0.1 Preview", date: "2026-05-10", description: "find/replace" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "1.0 Stable", date: "2026-09-01", description: "config + completions" }, children: [] },
      ],
      references: [
        { id: uid("ref"), title: "ripgrep 아키텍처", url: "https://blog.burntsushi.net/ripgrep/", notes: "성능 참조" },
      ],
      techStack: "Rust 1.80, clap v4, ratatui(대화형), serde, Homebrew/cargo/Scoop 배포",
      cliMeta: {
        binaryName: "rk",
        distributionChannels: ["homebrew", "cargo", "scoop", "standalone-binary"],
        primaryRuntime: "rust",
      },
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: uid("p"), name: "최지훈", role: "풀스택 개발자",
          demographics: "29세, 서울", context: "모노레포, 20+ 워크스페이스",
          techProficiency: "상급", behaviors: ["Neovim + tmux", "zsh with starship"],
          motivations: ["키보드 중심 속도"], needs: ["대화형 미리보기", "쉬운 undo"],
          painPoints: ["sed로 한 번에 치환 후 되돌리기 지옥"], frustrations: ["도구 파편화"],
          goals: ["10초 내 리팩터 시도·롤백"], successCriteria: ["정규표현식 없이도 95% 커버"],
          quote: "CLI가 예쁘면 타이핑이 신난다.", actorKind: "human-operator",
        },
        {
          id: uid("p"), name: "린다 체", role: "플랫폼 엔지니어",
          demographics: "35세, 베를린", context: "리눅스·원격 서버",
          techProficiency: "상급", behaviors: ["스크립팅", "dotfiles 광신도"],
          motivations: ["반복 제거"], needs: ["북마크·히스토리"],
          painPoints: ["과거 검색 쿼리 잊음"], frustrations: ["서버마다 환경 다름"],
          goals: ["셸 히스토리 감염 방지"], successCriteria: ["config sync 지원"],
          quote: "내 손가락이 기억하기 좋은 이름을.", actorKind: "human-operator",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: "", asA: "개발자", iWant: "현재 디렉토리 검색 결과를 컬러로 미리본다", soThat: "바로 이동·치환한다" },
        { id: uid("us"), personaId: "", asA: "개발자", iWant: "치환을 dry-run한다", soThat: "실수를 줄인다" },
        { id: uid("us"), personaId: "", asA: "엔지니어", iWant: "자주 쓰는 패턴을 북마크한다", soThat: "기억 부담을 줄인다" },
      ],
      successScenarios: ["`rk find TODO -i` → 결과 브라우저에서 Enter로 $EDITOR 점프"],
      failureScenarios: ["권한 없는 경로 — 빨간 경고 + 요약 스킵, exit 0 유지"],
    },
    cliRequirements: {
      functional: [
        { id: uid("fr"), title: "파일 내용 검색", description: "ripgrep 호환 옵션, 기본 색상 on-TTY", priority: "must", acceptanceCriteria: ["1M 파일 repo < 2s", "NO_COLOR 존중"], statement: "검색이 즐겁게", rationale: "핵심 기능", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "대화형 치환", description: "미리보기 + 항목별 y/n", priority: "must", acceptanceCriteria: ["ratatui UI", "--no-tty fallback"], statement: "안전한 치환", rationale: "차별점", source: "인터뷰", relatedGoalIds: [] },
        { id: uid("fr"), title: "북마크 쿼리", description: "자주 쓰는 쿼리 이름 저장", priority: "should", acceptanceCriteria: ["XDG config 저장"], statement: "재사용성", rationale: "리텐션", source: "UX", relatedGoalIds: [] },
      ],
      nonFunctional: [
        { id: uid("n"), category: "performance", description: "cold start < 40ms" },
        { id: uid("n"), category: "accessibility", description: "NO_COLOR, screen-reader 친화 플레인 모드" },
      ],
      constraints: [
        { id: uid("c"), category: "policy", description: "원격 통신 금지 (opt-in telemetry 제외)", source: "Founder", impact: "에어갭 안전" },
      ],
      glossary: [
        { id: uid("g"), term: "북마크", definition: "이름 붙인 검색 쿼리", kind: "entity", aliases: [] },
        { id: uid("g"), term: "dry-run", definition: "치환 미적용 미리보기", kind: "state", aliases: [] },
      ],
      clarifications: [],
      platformMatrix: {
        os: ["macos", "linux"],
        arch: ["x86_64", "arm64"],
        shells: ["bash", "zsh", "fish"],
      },
      authMethods: ["none"],
      destructivePolicy: {
        requiresConfirmation: true,
        confirmationFlag: "--yes",
        dryRunSupported: true,
        auditTrail: "stderr-log",
      },
      performance: { coldStartMs: 40, p95CommandMs: 1500 },
      offlineFirst: true,
      telemetry: {
        enabled: false,
        optOutMechanism: "기본 비활성. `rk config telemetry enable`로 수동 활성",
        collects: [],
      },
    },
    commandTree: {
      ...base.commandTree!,
      rootBinary: "rk",
      convention: "verb-noun",
      commands: [
        {
          id: findCmdId, name: "find", aliases: ["f", "search"], summary: "파일 내용 검색",
          description: "ripgrep 호환 검색. 결과를 색상 요약 + 원본 오픈 단축키 제공.",
          positional: [
            { id: uid("pos"), name: "pattern", kind: "required", description: "정규표현식 또는 리터럴" },
            { id: uid("pos"), name: "path", kind: "optional", description: "기본 CWD" },
          ],
          localFlags: [
            { id: uid("fl"), long: "--case-insensitive", short: "-i", kind: "boolean", required: false, repeatable: false, description: "대소문자 무시" },
            { id: uid("fl"), long: "--glob", short: "-g", kind: "stringArray", required: false, repeatable: true, description: "glob 필터" },
            { id: uid("fl"), long: "--context", short: "-C", kind: "number", required: false, repeatable: false, description: "주변 라인 수" },
          ],
          inheritedFlags: ["--verbose", "--quiet", "--no-color"], hidden: false, stability: "beta", agentSafe: true,
          children: [],
        },
        {
          id: replaceCmdId, name: "replace", aliases: ["r"], summary: "대화형 치환",
          description: "검색 결과를 순회하며 y/n으로 치환. --yes로 일괄 적용.",
          positional: [
            { id: uid("pos"), name: "pattern", kind: "required", description: "찾을 패턴" },
            { id: uid("pos"), name: "replacement", kind: "required", description: "치환 문자열" },
            { id: uid("pos"), name: "path", kind: "optional", description: "" },
          ],
          localFlags: [
            { id: uid("fl"), long: "--yes", short: "-y", kind: "boolean", required: false, repeatable: false, description: "확인 없이 일괄 적용" },
            { id: uid("fl"), long: "--dry-run", short: "-n", kind: "boolean", required: false, repeatable: false, description: "변경 미적용 미리보기" },
          ],
          inheritedFlags: ["--verbose"], hidden: false, stability: "beta", agentSafe: false, children: [],
        },
        {
          id: configCmdId, name: "config", aliases: [], summary: "설정 조회·수정",
          description: "XDG_CONFIG_HOME/rk/config.toml 편집 도우미",
          positional: [{ id: uid("pos"), name: "key", kind: "optional", description: "" }],
          localFlags: [{ id: uid("fl"), long: "--set", kind: "string", required: false, repeatable: false, description: "key=value" }],
          inheritedFlags: [], hidden: false, stability: "stable", agentSafe: true, children: [],
        },
      ],
      completions: { shells: ["bash", "zsh", "fish"], strategy: "static-generated" },
      helpStyle: { includeExamplesInHelp: true, includeEnvVarsInHelp: true, colorizeHelp: true },
    },
    cliContract: {
      ...base.cliContract!,
      contracts: [
        {
          commandId: findCmdId, stdinFormat: "none", stdoutModes: ["human-pretty", "human-plain"],
          defaultMode: "human-pretty", stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "매치 있음", category: "success" },
            { code: 1, when: "매치 없음", category: "success" },
            { code: 2, when: "사용 오류", category: "usage" },
          ],
          streaming: "none",
          interactivity: { promptsIfTTY: false, nonInteractiveFallback: "plain 출력", respectsNoInput: true },
          progressReporting: "none", idempotent: true, safeToRetry: true,
          samples: [
            { label: "기본 검색", mode: "human", invocation: "rk find TODO", stdin: "", stdout: "src/app.ts:42: // TODO: refactor", stderr: "", exitCode: 0 },
          ],
        },
        {
          commandId: replaceCmdId, stdinFormat: "none", stdoutModes: ["human-pretty"],
          defaultMode: "human-pretty", stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [
            { code: 0, when: "성공", category: "success" },
            { code: 2, when: "사용 오류", category: "usage" },
            { code: 1, when: "치환 실패", category: "software" },
          ],
          streaming: "none",
          interactivity: { promptsIfTTY: true, nonInteractiveFallback: "--dry-run 강제", respectsNoInput: true },
          progressReporting: "spinner", idempotent: false, safeToRetry: false,
          samples: [
            { label: "dry-run", mode: "human", invocation: "rk replace foo bar --dry-run", stdin: "", stdout: "2 files, 7 changes (dry-run)", stderr: "", exitCode: 0 },
          ],
        },
        {
          commandId: configCmdId, stdinFormat: "none", stdoutModes: ["human-pretty"],
          defaultMode: "human-pretty", stderr: { diagnosticsFormat: "plain", includesStackTrace: false },
          exitCodes: [{ code: 0, when: "성공", category: "success" }],
          streaming: "none",
          interactivity: { promptsIfTTY: false, nonInteractiveFallback: "", respectsNoInput: true },
          progressReporting: "none", idempotent: true, safeToRetry: true,
          samples: [{ label: "조회", mode: "human", invocation: "rk config theme", stdout: "theme = catppuccin", exitCode: 0 }],
        },
      ],
    },
    cliConfig: {
      ...base.cliConfig!,
      configFiles: [
        { id: uid("cf"), locationPriority: ["$XDG_CONFIG_HOME/rk/config.toml", "~/.config/rk/config.toml"], format: "toml", jsonSchema: "", description: "사용자 전역 설정", mergeStrategy: "deep" },
        { id: uid("cf"), locationPriority: [".rk.toml"], format: "toml", jsonSchema: "", description: "프로젝트 오버라이드", mergeStrategy: "deep" },
      ],
      envVars: [
        { id: uid("ev"), name: "RK_THEME", purpose: "색상 테마", required: false, sensitive: false, defaultValue: "catppuccin" },
        { id: uid("ev"), name: "NO_COLOR", purpose: "색상 비활성화 표준", required: false, sensitive: false },
      ],
      outputSchemas: [],
    },
    cliTerminalUx: {
      ...base.cliTerminalUx!,
      iconSet: "ascii",
      tableStyle: "unicode-box",
      errorTemplates: [
        { id: uid("et"), scenario: "권한 거부", whatWentWrong: "읽기 권한 없음", whyItHappened: "파일 소유자 아님", howToFix: "sudo 또는 소유권 확인", relatedCommand: "find", exitCode: 77 },
      ],
      toneLevel: 2,
      uxWritingGlossary: [
        { term: "매치", avoid: "일치", context: "검색 결과" },
      ],
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "Ripkit — 휴먼 친화 CLI",
    type: "cli",
    cliSubType: "human-first",
    phases,
    createdAtOffset: 60_000,
  });
}
