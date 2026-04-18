import type { PhaseTemplate } from "./index";

export const cliTerminalUxTemplates: PhaseTemplate[] = [
  {
    id: "cli-ux-palette",
    name: "ANSI 팔레트 제안",
    description: "도구 성격에 맞는 ANSI 16색 + truecolor 팔레트를 제안합니다.",
    promptTemplate: `출력: vibable cliTerminalUx.palette JSON.
{
  "primary":"cyan|blue|magenta|green",
  "success":"green|brightGreen",
  "warning":"yellow",
  "danger":"red|brightRed",
  "info":"blue|brightBlue",
  "muted":"brightBlack",
  "truecolorHex":{"primary":"#...","success":"#..."},
  "respectNoColor":true
}
규칙:
- NO_COLOR 환경변수 존중은 고정 true
- 색맹 친화: success/danger는 색만이 아니라 아이콘(✓/✗)으로도 구분
- truecolor hex는 선택적, 기본 팔레트만으로도 동작해야 함`,
  },
  {
    id: "cli-ux-error-templates",
    name: "에러 메시지 템플릿",
    description: "문제→원인→해결 3단 구조의 에러 메시지 템플릿을 생성합니다.",
    promptTemplate: `출력: { "errorTemplates":[ErrorMessageTemplate] }
각 항목: { id, scenario, whatWentWrong, whyItHappened, howToFix, relatedCommand?, exitCode }
규칙:
- 어조는 비난하지 않음, 해결책 제시 중심 (Heroku CLI style guide)
- whatWentWrong은 한 문장으로 명확히
- howToFix에 구체적 커맨드 예시 포함
- exitCode는 sysexits 규약 (64~78) 또는 도메인 코드`,
  },
  {
    id: "cli-ux-agent-friendly",
    name: "에이전트 친화 개선",
    description: "현재 출력을 에이전트가 쓰기 쉽게 리팩터링할 포인트를 도출합니다.",
    promptTemplate: `입력: 현재 CLI의 출력 샘플(text 또는 JSON).
출력: { "issues":[{area,problem,suggestion}], "agentChecklist":AgentFriendlinessChecklist }
agentChecklist 항목:
- stableJsonOutput, nonInteractiveFallback, respectsTtyAndNoColor, semanticExitCodes,
  streamingEvents, deterministicOutput, mcpBridge(native|wrapper|none), nonInteractiveAuth, tokenEfficient

현재 Claude Code, gh, kubectl 기준에서 무엇이 빠졌는지 구체적으로 지적.`,
  },
];
