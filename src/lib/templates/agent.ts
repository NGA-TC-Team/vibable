import type { PhaseTemplate } from "./index";

export const agentPhase2Templates: PhaseTemplate[] = [
  {
    id: "agent-req-security",
    name: "권한·자율성·안전 요구사항 도출",
    description: "에이전트의 자율 범위, 금지 작업, 사람 개입 지점을 요구사항 형태로 정리합니다.",
    promptTemplate: `당신은 AI 에이전트 보안 기획자입니다. 아래 맥락을 바탕으로 JSON만 출력하세요.
스키마: { "functional": [...], "nonFunctional": [...] } — vibable agentRequirements와 동일한 구조(확장 필드 제외).
기능 요구사항에는 "무엇을 자동화할지", 비기능에는 latency, audit, rate limit, kill switch 등을 넣으세요.`,
  },
  {
    id: "agent-req-mvp",
    name: "MVP 에이전트 기능 쪼개기",
    description: "최소 기능 단위로 쪼갠 뒤 우선순위를 붙입니다.",
    promptTemplate: `vibable agentRequirements의 functional 배열만 채우는 JSON을 출력하세요.
각 항목: id, title, description, priority(must|should|could|wont), acceptanceCriteria[]`,
  },
  {
    id: "agent-req-nfr",
    name: "비기능(운영·규제) 체크리스트",
    description: "로그 보존, PII, 데이터 주권 등 비기능 요구를 나열합니다.",
    promptTemplate: `nonFunctional 배열만 갖는 JSON을 출력하세요. category는 performance|security|accessibility|offline|other.`,
  },
];

export const claudePhaseTemplates: Record<number, PhaseTemplate[]> = {
  3: [
    {
      id: "claude-arch-ep",
      name: "Explore–Plan–Execute 3단 파이프라인",
      description: "탐색·계획·실행 에이전트와 데이터 플로우 초안을 생성합니다.",
      promptTemplate: `Claude agentArchitecture JSON을 출력하세요.
{ "kind":"claude-subagent", "claude": { "pattern":"explore-plan-execute", "agents":[...], "delegationRules":[], "dataFlow":[] } }
agents에는 id(uuid), name, role, description, model, toolAccess[], permissionMode, memoryScope 필드를 채우세요.`,
    },
    {
      id: "claude-arch-single",
      name: "단일 전문가 에이전트",
      description: "한 에이전트에 집중된 역할·도구 세트를 설계합니다.",
      promptTemplate: `kind claude-subagent, pattern single, agents 배열 1개만. toolAccess는 최소 권한 원칙으로.`,
    },
    {
      id: "claude-arch-review",
      name: "구현자+리뷰어 루프",
      description: "두 에이전트와 검증 실패 시 되돌아가는 dataFlow를 설계합니다.",
      promptTemplate: `orchestrator-subagent 또는 custom 패턴으로 agents 2개 이상, dataFlow에 trigger 설명 포함.`,
    },
  ],
  4: [
    {
      id: "claude-beh-prompt",
      name: "시스템 프롬프트 생성",
      description: "역할 키워드로 전체 시스템 프롬프트 초안을 만듭니다.",
      promptTemplate: `{ "kind":"claude-subagent", "behaviors":[{ "agentId":"...", "systemPrompt":"...", "coreExpertise":[], "responsibilities":[], "outputFormat":"", "constraints":[], "color":"cyan" }] }`,
    },
    {
      id: "claude-beh-output",
      name: "출력 포맷 설계",
      description: "JSON 스키마 또는 마크다운 섹션 규칙을 정의합니다.",
      promptTemplate: `behaviors 배열에서 outputFormat 필드를 구조화된 명세로 채운 JSON만 출력.`,
    },
    {
      id: "claude-beh-constraints",
      name: "제약·금지 도출",
      description: "도메인에서 하면 안 되는 행동 목록을 constraints로 만듭니다.",
      promptTemplate: `behaviors[].constraints를 풍부하게 채운 JSON.`,
    },
  ],
  5: [
    {
      id: "claude-tools-min",
      name: "최소 권한 도구 세트",
      description: "역할별 Read/Grep만 등 최소 도구만 제안합니다.",
      promptTemplate: `{ "kind":"claude-subagent", "claude": { "globalTools":[], "agentTools":[], "hooks":[] } }`,
    },
    {
      id: "claude-tools-hooks",
      name: "PreToolUse 훅 설계",
      description: "Bash 등 위험 도구에 대한 훅 스케치를 생성합니다.",
      promptTemplate: `hooks 배열에 matcher, hookType PreToolUse, action, purpose를 채운 JSON.`,
    },
    {
      id: "claude-tools-mcp",
      name: "MCP 서버 연동",
      description: "외부 MCP 엔드포인트 목록을 mcpServers로 생성합니다.",
      promptTemplate: `mcpServers에 name, url, description 포함 JSON.`,
    },
  ],
  6: [
    {
      id: "claude-safe-red",
      name: "레드팀 시나리오",
      description: "오작동·악용 시나리오와 완화책을 riskScenarios로 출력합니다.",
      promptTemplate: `agentSafety 스키마 JSON: riskScenarios[], humanInTheLoop[], testCases[], rollbackPlan.`,
    },
    {
      id: "claude-safe-hitl",
      name: "Human-in-the-Loop 지점",
      description: "사람 승인이 필요한 단계를 humanInTheLoop 문자열 배열로.",
      promptTemplate: `humanInTheLoop 위주의 agentSafety JSON.`,
    },
    {
      id: "claude-safe-tests",
      name: "테스트 케이스 생성",
      description: "입력 프롬프트·기대·금지 행동 구조.",
      promptTemplate: `testCases 배열을 채운 agentSafety JSON.`,
    },
  ],
};

export const openclawPhaseTemplates: Record<number, PhaseTemplate[]> = {
  3: [
    {
      id: "oc-arch-single",
      name: "단일 에이전트 워크스페이스",
      description: "기본 경로와 샌드박스 옵션을 제안합니다.",
      promptTemplate: `{ "kind":"openclaw", "openclaw": { "workspacePath":"~/.openclaw/workspace", "sandboxConfig":{}, "multiAgent":false } }`,
    },
    {
      id: "oc-arch-multi",
      name: "다중 에이전트 라우팅",
      description: "채널별 에이전트 분리와 channelRouting을 생성합니다.",
      promptTemplate: `multiAgent true, agents[], channelRouting[] 포함 openclaw 아키텍처 JSON.`,
    },
    {
      id: "oc-arch-sbx",
      name: "샌드박스 아키텍처",
      description: "네트워크·파일 접근 정책을 설계합니다.",
      promptTemplate: `sandboxConfig.enabled와 workspaceAccess, networkAccess를 명시한 JSON.`,
    },
  ],
  4: [
    {
      id: "oc-soul",
      name: "SOUL.md 생성",
      description: "성격 키워드로 soul 블록을 채웁니다.",
      promptTemplate: `{ "kind":"openclaw", "openclaw": { "soul":{}, "identity":{}, "agents":{}, "user":{}, "heartbeat":[] } }`,
    },
    {
      id: "oc-heartbeat",
      name: "HEARTBEAT 스케줄",
      description: "주기적 자율 태스크 목록을 heartbeat에 넣습니다.",
      promptTemplate: `heartbeat 배열에 name, schedule, action, enabled 필드.`,
    },
    {
      id: "oc-agents-md",
      name: "AGENTS.md 운영 규칙",
      description: "세션 시작·메모리 규칙을 agents 객체에 채웁니다.",
      promptTemplate: `openclaw.agents에 safetyDefaults, sessionStartRules, memoryRules, sharedSpaceRules.`,
    },
  ],
  5: [
    {
      id: "oc-channels",
      name: "메신저 연동 설계",
      description: "플랫폼별 채널 설정과 목적을 채웁니다.",
      promptTemplate: `{ "kind":"openclaw", "openclaw": { "channels":[], "tools":{}, "skills":[], "gatewayConfig":{} } }`,
    },
    {
      id: "oc-skills",
      name: "스킬 선정",
      description: "ClawHub 스킬 후보를 skills 배열로.",
      promptTemplate: `skills에 name, source, description, enabled.`,
    },
    {
      id: "oc-tools-matrix",
      name: "도구 권한 매트릭스",
      description: "enabled/disabled 도구 목록과 메모.",
      promptTemplate: `tools.enabled, tools.disabled, tools.notes 채우기.`,
    },
  ],
  6: [
    {
      id: "oc-safe-msg",
      name: "메신저 보안 시나리오",
      description: "그룹 유출·오발송 등 리스크.",
      promptTemplate: `agentSafety JSON — OpenClaw 운영 관점 시나리오 위주.`,
    },
    {
      id: "oc-safe-fs",
      name: "파일시스템 보호",
      description: "민감 경로 차단을 riskScenarios에 기록.",
      promptTemplate: `riskScenarios 위주 agentSafety.`,
    },
    {
      id: "oc-safe-hb",
      name: "HEARTBEAT 검증 계획",
      description: "자율 작업의 검증·롤백을 testCases와 rollbackPlan에.",
      promptTemplate: `testCases와 rollbackPlan 중심 agentSafety JSON.`,
    },
  ],
};
