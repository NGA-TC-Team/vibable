import type { PhaseTemplate } from "./index";

export const cliRequirementsTemplates: PhaseTemplate[] = [
  {
    id: "cli-req-distribution",
    name: "배포 채널 도출",
    description: "타깃 사용자와 런타임을 고려해 배포 채널과 설치 요구사항을 제안합니다.",
    promptTemplate: `당신은 CLI 도구 배포 전문가입니다. 아래 맥락에서 JSON만 출력하세요.
스키마: vibable cliRequirements의 functional/nonFunctional + platformMatrix + authMethods.
- functional: 배포·설치·업데이트 기능 (예: self-update, telemetry opt-out)
- nonFunctional: security, performance, accessibility, offline, other
- platformMatrix: {os:[macos,linux,windows,bsd], arch:[x86_64,arm64], shells:[bash,zsh,fish,powershell]}
- authMethods: env-var|config-file|oauth-device-code|oauth-browser|static-token|none 중 선택

규칙:
- id는 REQ-001 형식
- must/should/could/wont priority 설정
- brew/npm/cargo/pip/go install/standalone binary 중 실제 런타임에 맞는 것만 제안`,
  },
  {
    id: "cli-req-safety",
    name: "안전성 체크리스트",
    description: "파괴적 작업·dry-run·감사 로그·확인 플래그 정책을 도출합니다.",
    promptTemplate: `다음 구조의 JSON만 출력: { "destructivePolicy": {...}, "nonFunctional": [...] }
destructivePolicy: requiresConfirmation(bool), confirmationFlag(--yes|--force), dryRunSupported(bool), auditTrail(stderr-log|file|none)
nonFunctional에는 "삭제 전 확인", "rollback 지원" 등 안전 관련 NFR 최소 3개.
에이전트 호출 시에도 데이터 유실이 없도록 설계하세요.`,
  },
  {
    id: "cli-req-performance",
    name: "성능 SLO 제안",
    description: "Cold start·P95 실행·바이너리 크기 SLO를 런타임별로 제안합니다.",
    promptTemplate: `{ "performance": { "coldStartMs":number, "p95CommandMs":number, "streamingLatencyMs":number, "binarySizeMb":number } } JSON만 출력.
- Node/Bun 런타임은 cold start 80~150ms, Go/Rust는 10~30ms 기준
- 타깃 사용자가 대화식이면 p95 500ms 이하, 스크립트/에이전트면 100ms 이하 권장
- 왜 이런 수치인지 간단한 근거를 별도 필드 "rationale"에 1~2문장.`,
  },
];
