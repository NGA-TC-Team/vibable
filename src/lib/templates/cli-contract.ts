import type { PhaseTemplate } from "./index";

export const cliContractTemplates: PhaseTemplate[] = [
  {
    id: "cli-contract-io-spec",
    name: "커맨드 I/O 명세",
    description: "각 커맨드의 stdin·stdout·stderr·exit code 계약을 작성합니다.",
    promptTemplate: `당신은 CLI 계약 설계자입니다. 아래 커맨드에 대해 JSON만 출력하세요.
스키마(vibable cliContract.contracts):
{
  "commandId":"...",
  "stdinFormat":"none|text|json|ndjson|binary",
  "stdoutModes":["human-pretty","human-plain","json","ndjson","yaml","custom-template"],
  "defaultMode":"...",
  "stdoutSchemaVersion":"1.0.0",
  "stderr":{"diagnosticsFormat":"plain|json","includesStackTrace":false},
  "exitCodes":[{code, when, category}],
  "streaming":"none|stdout-ndjson|sse-like",
  "interactivity":{"promptsIfTTY":bool,"nonInteractiveFallback":"...","respectsNoInput":true},
  "progressReporting":"none|spinner|bar|events",
  "idempotent":bool,"safeToRetry":bool,
  "samples":[{label,mode:"human|agent",invocation,stdout,exitCode}]
}
규칙:
- exit code: 0 성공, 2 usage, 64 EX_USAGE, 65 EX_DATAERR, 70 EX_SOFTWARE, 74 EX_IOERR, 77 EX_NOPERM 활용
- samples에 human 1개 + agent 1개 필수`,
  },
  {
    id: "cli-contract-json-schema",
    name: "--json 출력 스키마 설계",
    description: "에이전트가 안정적으로 파싱할 수 있는 JSON 출력 스키마를 설계합니다.",
    promptTemplate: `입력: 커맨드 이름 + 도메인 모델. 출력: JSON Schema (draft 2020-12) 전문.
최상위에 "schemaVersion":"semver" 포함.
list 류는 { "schemaVersion":"1.0.0", "items":[...], "total":number, "nextCursor":string|null } 구조 권장.
error 시에는 { "schemaVersion":"1.0.0", "error":{"code":number,"message":"...","hint":"..."} }`,
  },
  {
    id: "cli-contract-exit-codes",
    name: "Exit code 매핑",
    description: "sysexits.h 규약과 도메인 에러를 매핑합니다.",
    promptTemplate: `{ "exitCodes":[{code,when,category}] } JSON만 출력.
category는 success|usage|input|unavailable|software|config|temporary|permission.
sysexits 권장치:
- 0 success
- 2 generic usage
- 64 EX_USAGE (잘못된 플래그)
- 65 EX_DATAERR (입력 포맷 오류)
- 66 EX_NOINPUT (파일 없음)
- 69 EX_UNAVAILABLE (외부 서비스)
- 70 EX_SOFTWARE (내부 버그)
- 74 EX_IOERR
- 75 EX_TEMPFAIL (재시도 가능)
- 77 EX_NOPERM
- 78 EX_CONFIG`,
  },
];
