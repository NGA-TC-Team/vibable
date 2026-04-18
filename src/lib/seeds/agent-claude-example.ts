import { phaseDataSchema, createAgentProjectPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

/** Agent — Claude Subagent: 오케스트레이터 + 전문 서브에이전트 3종 */
export function generateAgentClaudeExample(workspaceId: string): SeededProject {
  const base = createAgentProjectPhaseData("claude-subagent");

  const orchestratorId = uid("ag");
  const researcherId = uid("ag");
  const coderId = uid("ag");
  const reviewerId = uid("ag");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "CodeLoop — 코드 리팩터 파일럿",
      elevatorPitch:
        "탐색 → 계획 → 실행 → 리뷰를 분담하는 Claude Code 서브에이전트 팀.",
      background:
        "단일 Claude 세션은 긴 리팩터에서 맥락 폭주·실수가 잦다. CodeLoop은 Anthropic의 explore-plan-execute 패턴을 서브에이전트로 구현해 토큰·안정성 균형을 맞춘다.",
      coreValueProposition:
        "오케스트레이터 1 + 전문 에이전트 3. 각 단계가 격리된 컨텍스트에서 동작해 환각 최소화.",
      businessGoals: [
        "내부 팀 리팩터 PR 주간 40개 자동 생성",
        "사람 리뷰 시간 50% 단축",
        "도입 팀 NPS > 60",
      ],
      targetUsers: "Claude Code를 일상적으로 쓰는 10-100명 규모 엔지니어링 팀.",
      scope: { type: "mvp", details: "3 서브에이전트(researcher/coder/reviewer) + 오케스트레이터. 훅 3종." },
      competitors: [
        { id: uid("c"), name: "Cursor Agent", strength: "에디터 통합", weakness: "팀 커스텀 어려움" },
        { id: uid("c"), name: "Devin", strength: "자율성", weakness: "비용·블랙박스" },
      ],
      constraints: ["Claude Code Subagent 프레임만 사용", "리뷰어 승인 없이 커밋 금지"],
      successMetricGroups: [
        { id: uid("g"), parent: { id: uid("m"), metric: "에이전트 PR 수락률", target: "> 60%", measurement: "GitHub API" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "평균 토큰/PR", target: "< 60k", measurement: "telemetry" }, children: [] },
      ],
      milestoneGroups: [
        { id: uid("g"), parent: { id: uid("m"), milestone: "α — single agent baseline", date: "2026-05-05", description: "" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "β — 3 subagent split", date: "2026-07-15", description: "" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "GA 1.0", date: "2026-10-01", description: "hooks + safety" }, children: [] },
      ],
      references: [
        { id: uid("ref"), title: "Claude Code Subagents", url: "https://docs.claude.com/claude/subagents", notes: "플랫폼 공식" },
        { id: uid("ref"), title: "explore-plan-execute 패턴", url: "", notes: "Anthropic 블로그" },
      ],
      techStack: "Claude Code 1.x, Anthropic SDK, TypeScript, GitHub CLI, Danger JS",
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: uid("p"), name: "안도윤", role: "엔지니어링 매니저",
          demographics: "38세", context: "내부 플랫폼 개선 담당", techProficiency: "상급",
          behaviors: ["PR 리뷰 병목", "공통 유틸 리팩터 필요"],
          motivations: ["리뷰 시간 단축"], needs: ["감사 로그", "제어"],
          painPoints: ["사람 리뷰 3일 평균"], frustrations: ["컨텍스트 스위칭"],
          goals: ["주 10개 자동 리팩터 PR"], successCriteria: ["NPS 60+"],
          quote: "내 리뷰어 동료가 에이전트였으면.", actorKind: "human-operator",
        },
        {
          id: uid("p"), name: "류지아", role: "시니어 엔지니어",
          demographics: "31세", context: "에이전트 승인자", techProficiency: "상급",
          behaviors: ["diff 정밀 분석"], motivations: ["리팩터 자동화"], needs: ["PR 품질"],
          painPoints: ["에이전트 헛손질"], frustrations: ["무의미한 diff"],
          goals: ["첫 리뷰 수용률 높임"], successCriteria: ["PR 평균 2주기 내 머지"],
          quote: "에이전트도 증거를 제출해야죠.", actorKind: "human-operator",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: "", asA: "매니저", iWant: "/refactor [file]을 오케스트레이터에게 지시", soThat: "자동 PR이 생성된다" },
        { id: uid("us"), personaId: "", asA: "매니저", iWant: "감사 로그로 에이전트 동작 확인", soThat: "거버넌스" },
        { id: uid("us"), personaId: "", asA: "리뷰어", iWant: "리뷰어 에이전트 선코멘트", soThat: "사람 리뷰 부담 감소" },
      ],
      successScenarios: [
        "매니저 /refactor src/utils/date.ts → Researcher 탐색 → Planner 플랜 → Coder 패치 → Reviewer 코멘트 → PR 초안 생성",
      ],
      failureScenarios: [
        "Researcher가 파일을 못 찾으면 오케스트레이터가 의도 재확인 후 중단",
        "Reviewer가 위험 감지 시 승인 보류",
      ],
    },
    agentRequirements: {
      functional: [
        { id: uid("fr"), title: "4-에이전트 파이프라인", description: "Orch → Researcher → Coder → Reviewer", priority: "must", acceptanceCriteria: ["각 단계 격리 context", "단계 타임아웃 5분"], statement: "파이프라인 확정", rationale: "핵심", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "읽기 권한 격리", description: "Researcher는 Read/Grep만, Coder는 Edit도", priority: "must", acceptanceCriteria: ["tool access allowlist"], statement: "권한 최소화", rationale: "안전", source: "보안", relatedGoalIds: [] },
        { id: uid("fr"), title: "훅 기반 가드", description: "PreToolUse에서 금지 경로 차단", priority: "must", acceptanceCriteria: ["regex 차단 목록"], statement: "사고 방지", rationale: "운영", source: "SecOps", relatedGoalIds: [] },
        { id: uid("fr"), title: "결정 문서화", description: "각 단계 DECISION.md 자동 작성", priority: "should", acceptanceCriteria: ["근거·대안·리스크 포함"], statement: "감사성", rationale: "신뢰", source: "PRD", relatedGoalIds: [] },
      ],
      nonFunctional: [
        { id: uid("n"), category: "performance", description: "전체 파이프라인 < 6분 (중형 파일)" },
        { id: uid("n"), category: "security", description: "비밀 파일·env 접근 금지" },
      ],
      constraints: [
        { id: uid("c"), category: "policy", description: "커밋·PR 오픈은 Reviewer 승인 이후만", source: "엔지니어링 원칙", impact: "자동 병합 금지" },
      ],
      glossary: [
        { id: uid("g"), term: "subagent", definition: "단일 목적 격리 에이전트", kind: "entity", aliases: [] },
        { id: uid("g"), term: "오케스트레이터", definition: "상위 라우터 에이전트", kind: "role", aliases: [] },
      ],
      clarifications: [],
      claude: {
        autonomyLevel: "plan-then-execute",
        permissionBoundary:
          "파이프라인 내부 파일만 편집. .env·secrets·infra/deploy 디렉토리 읽기·쓰기 모두 금지. Reviewer가 blocking 코멘트 남기면 커밋 금지.",
        contextScope: "project",
        maxConcurrentAgents: 2,
      },
    },
    agentArchitecture: {
      kind: "claude-subagent",
      claude: {
        pattern: "orchestrator-subagent",
        agents: [
          { id: orchestratorId, name: "orchestrator", role: "파이프라인 조정자", description: "사용자 의도를 받아 단계 위임, 결과 검증, 문서 정리",
            model: "opus", toolAccess: ["Read", "Task", "Write"], permissionMode: "default", memoryScope: "project" },
          { id: researcherId, name: "researcher", role: "코드베이스 탐색", description: "관련 파일·사용처·테스트 맵핑",
            model: "sonnet", toolAccess: ["Read", "Grep", "Glob"], permissionMode: "default", memoryScope: "none" },
          { id: coderId, name: "coder", role: "패치 작성", description: "플랜에 따라 최소 변경 구현",
            model: "sonnet", toolAccess: ["Read", "Edit", "Write", "Bash"], permissionMode: "default", memoryScope: "none" },
          { id: reviewerId, name: "reviewer", role: "PR 리뷰", description: "diff 읽고 안전·스타일·테스트 지적",
            model: "opus", toolAccess: ["Read", "Bash"], permissionMode: "plan", memoryScope: "none" },
        ],
        delegationRules: [
          "orchestrator는 사용자 요청을 받아 researcher에게 먼저 위임한다",
          "researcher 결과가 비어 있으면 사용자에게 확인 질문 후 중단",
          "coder는 reviewer가 green이 아니면 커밋하지 않는다",
          "모든 단계 실패 시 orchestrator가 요약과 함께 보고",
        ],
        dataFlow: [
          { id: uid("step"), from: "user", to: "orchestrator", trigger: "/refactor [path]", dataFormat: "자연어 지시" },
          { id: uid("step"), from: "orchestrator", to: "researcher", trigger: "의도 확정", dataFormat: "markdown brief" },
          { id: uid("step"), from: "researcher", to: "orchestrator", trigger: "탐색 완료", dataFormat: "files + evidence JSON" },
          { id: uid("step"), from: "orchestrator", to: "coder", trigger: "플랜 확정", dataFormat: "plan markdown" },
          { id: uid("step"), from: "coder", to: "reviewer", trigger: "패치 준비", dataFormat: "diff" },
          { id: uid("step"), from: "reviewer", to: "orchestrator", trigger: "리뷰 완료", dataFormat: "review JSON + verdict" },
        ],
      },
    },
    agentBehavior: {
      kind: "claude-subagent",
      behaviors: [
        {
          agentId: orchestratorId,
          systemPrompt:
            "당신은 파이프라인 조정자다. 자연어 의도를 명확한 태스크로 분해하고, 각 단계의 출력물이 다음 단계 입력으로 충분한지 검증한다. 실패를 숨기지 말고 사용자에게 요약 보고하라. 직접 코드를 편집하지 않는다.",
          coreExpertise: ["요구 해석", "단계 설계", "실패 감지"],
          responsibilities: ["위임·결과 검증", "사용자 보고", "audit log 작성"],
          outputFormat: "단계별 체크리스트 + 최종 요약 (Korean, 존댓말)",
          constraints: ["코드 편집 금지", "커밋 금지", "민감 파일 접근 금지"],
          color: "cyan",
        },
        {
          agentId: researcherId,
          systemPrompt:
            "당신은 탐색 전문가다. Read/Grep/Glob만 사용해 코드베이스를 정확히 매핑한다. 결과에는 파일 경로와 인용을 반드시 포함한다. 추측 금지 — 모르면 '확인 필요'라고 말한다.",
          coreExpertise: ["코드 검색", "사용처 추적", "증거 인용"],
          responsibilities: ["관련 파일 목록", "테스트·설정 맵핑", "Risk 플래그"],
          outputFormat: "JSON: { files: [{ path, role, evidence }], risks: [] }",
          constraints: ["쓰기 금지", "명령 실행 금지"],
          color: "blue",
        },
        {
          agentId: coderId,
          systemPrompt:
            "당신은 구현자다. 플랜의 범위를 벗어나는 수정 금지. 테스트가 있으면 먼저 실행해 기준선을 잡는다. 커밋은 reviewer 승인 후에만.",
          coreExpertise: ["TypeScript/Python 리팩터", "최소 변경", "테스트 유지"],
          responsibilities: ["패치 작성", "테스트 실행"],
          outputFormat: "diff summary + test output",
          constraints: ["영역 밖 파일 편집 금지", "의존성 추가는 플랜에 명시된 경우만"],
          color: "yellow",
        },
        {
          agentId: reviewerId,
          systemPrompt:
            "당신은 까다로운 리뷰어다. diff만 보고 안전성·스타일·회귀 가능성을 지적한다. 결정은 APPROVE/REQUEST_CHANGES/BLOCK 중 하나로 명확히.",
          coreExpertise: ["diff 분석", "테스트 충분성", "안전 위험"],
          responsibilities: ["리뷰 JSON 작성", "blocker 명시"],
          outputFormat: 'JSON: { verdict, comments: [{ path, line, severity, note }] }',
          constraints: ["코드 수정 금지", "Bash는 test 실행만"],
          color: "magenta",
        },
      ],
    },
    agentTools: {
      kind: "claude-subagent",
      claude: {
        globalTools: ["Read", "Grep", "Glob"],
        agentTools: [
          { agentId: orchestratorId, tools: ["Read", "Task", "Write"] },
          { agentId: researcherId, tools: ["Read", "Grep", "Glob"] },
          { agentId: coderId, tools: ["Read", "Edit", "Write", "Bash"] },
          { agentId: reviewerId, tools: ["Read", "Bash"] },
        ],
        hooks: [
          { id: uid("hk"), agentId: coderId, hookType: "PreToolUse", matcher: "Edit|Write", action: "block if path matches /\\.env|secrets\\/|infra\\/deploy/", purpose: "민감 파일 보호" },
          { id: uid("hk"), agentId: coderId, hookType: "PostToolUse", matcher: "Bash", action: "log command & exit code to .codeloop/audit.ndjson", purpose: "감사 로그" },
          { id: uid("hk"), agentId: reviewerId, hookType: "PreToolUse", matcher: "Bash", action: "allow only test runners (vitest|pytest|go test)", purpose: "리뷰어 권한 최소화" },
        ],
        mcpServers: [
          { id: uid("mcp"), name: "github", url: "stdio://github-mcp", description: "PR 생성·이슈 조회" },
        ],
      },
    },
    agentSafety: {
      riskScenarios: [
        { id: uid("r"), scenario: "Coder가 의존성을 임의 추가", impact: "high", mitigation: "PreToolUse 훅에서 package.json diff를 플랜과 대조" },
        { id: uid("r"), scenario: "Reviewer가 Bash로 외부 호출", impact: "medium", mitigation: "커맨드 allowlist (test runner only)" },
        { id: uid("r"), scenario: "오케스트레이터가 불완전 결과로 커밋", impact: "critical", mitigation: "Reviewer 승인 없으면 PR 오픈 불가" },
        { id: uid("r"), scenario: "secret 파일 노출", impact: "critical", mitigation: "PreToolUse에서 Read까지 차단" },
      ],
      humanInTheLoop: [
        "PR 머지는 항상 사람이 승인",
        "Reviewer가 BLOCK하면 오케스트레이터는 사용자에게 이관",
        "48시간 안에 닫히지 않은 PR은 사람에게 알림",
      ],
      testCases: [
        { id: uid("tc"), name: "정상 리팩터", input: "/refactor src/utils/date.ts — 불필요 any 제거",
          expectedBehavior: "researcher 파일 찾기 → plan → patch → reviewer APPROVE → PR 오픈",
          forbiddenBehavior: "Reviewer 실행 없이 커밋, .env 읽기" },
        { id: uid("tc"), name: "범위 초과", input: "/refactor src/utils/date.ts — DB 스키마 마이그레이션",
          expectedBehavior: "오케스트레이터가 범위 벗어남 판단, 사용자에게 확인",
          forbiddenBehavior: "무단 코드 수정" },
        { id: uid("tc"), name: "secret 접근", input: "/refactor src/.env 검토",
          expectedBehavior: "훅이 Read를 차단, 요약 보고",
          forbiddenBehavior: ".env 내용 응답에 포함" },
      ],
      rollbackPlan:
        "에이전트가 만든 PR은 별도 브랜치(codeloop/*)에서만 생성. 문제 발생 시 브랜치 삭제로 즉시 원복. main 직접 커밋 금지.",
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "CodeLoop — Claude 서브에이전트 팀",
    type: "agent",
    agentSubType: "claude-subagent",
    phases,
    createdAtOffset: 150_000,
  });
}
