import type { AgentFriendlinessChecklist } from "@/types/phases";

export interface CliAgentPreset {
  id: string;
  label: string;
  description: string;
  checklist: AgentFriendlinessChecklist;
  notes: string[];
}

export const CLI_AGENT_PRESETS: CliAgentPreset[] = [
  {
    id: "mcp-native",
    label: "MCP 네이티브",
    description: "Model Context Protocol 서버로 직접 기동",
    checklist: {
      stableJsonOutput: true,
      nonInteractiveFallback: true,
      respectsTtyAndNoColor: true,
      semanticExitCodes: true,
      streamingEvents: true,
      deterministicOutput: true,
      mcpBridge: "native",
      nonInteractiveAuth: true,
      tokenEfficient: true,
    },
    notes: [
      "stdio JSON-RPC를 기본 입출력으로",
      "모든 tool 응답은 JSON Schema 준수",
      "인증은 환경 변수 또는 토큰 파일",
      "배너/ASCII 아트 금지",
    ],
  },
  {
    id: "script-friendly",
    label: "스크립트 친화",
    description: "bash/CI 스크립트가 파이프로 호출하는 전통적 Unix 스타일",
    checklist: {
      stableJsonOutput: true,
      nonInteractiveFallback: true,
      respectsTtyAndNoColor: true,
      semanticExitCodes: true,
      streamingEvents: false,
      deterministicOutput: true,
      mcpBridge: "none",
      nonInteractiveAuth: true,
      tokenEfficient: true,
    },
    notes: [
      "stdout은 파이프 가능, stderr에 진단",
      "sysexits.h 기반 exit code (64~78)",
      "NO_COLOR / isatty 존중",
      "--json opt-in 제공",
    ],
  },
  {
    id: "hybrid-pretty",
    label: "하이브리드 (권장)",
    description: "TTY면 사람, 파이프면 기계",
    checklist: {
      stableJsonOutput: true,
      nonInteractiveFallback: true,
      respectsTtyAndNoColor: true,
      semanticExitCodes: true,
      streamingEvents: false,
      deterministicOutput: true,
      mcpBridge: "wrapper",
      nonInteractiveAuth: true,
      tokenEfficient: true,
    },
    notes: [
      "TTY 감지 → 사람 포맷 + 색상",
      "비TTY → plain 텍스트 + 색상 제거",
      "--json 플래그로 강제 기계 모드",
      "`mytool mcp` 서브커맨드로 MCP 브리지 제공",
    ],
  },
];
