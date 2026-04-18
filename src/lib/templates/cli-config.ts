import type { PhaseTemplate } from "./index";

export const cliConfigTemplates: PhaseTemplate[] = [
  {
    id: "cli-config-schema-gen",
    name: "설정 파일 JSON Schema 생성",
    description: "기본 옵션 목록에서 JSON Schema와 TOML 샘플을 만듭니다.",
    promptTemplate: `입력: 설정 옵션 이름·타입 목록. 출력 JSON:
{ "configFiles":[{ id,locationPriority,format,jsonSchema,description,mergeStrategy }], "sampleToml":"..." }
- locationPriority는 XDG 규약: $XDG_CONFIG_HOME/tool/config.toml > ~/.toolrc > ./.tool.toml
- jsonSchema는 draft 2020-12
- mergeStrategy는 deep가 기본.`,
  },
  {
    id: "cli-config-env-registry",
    name: "환경 변수 레지스트리",
    description: "모든 환경 변수를 표준 네임스페이스로 정리합니다.",
    promptTemplate: `출력: { "envVars":[{id,name,purpose,required,sensitive,defaultValue?,boundFlagId?}] }
규칙:
- 이름은 SCREAMING_SNAKE_CASE + 툴 접두사 (예: MYTOOL_TOKEN)
- 인증 토큰은 sensitive:true, logs에서 마스킹 필요
- 대응되는 플래그가 있으면 boundFlagId로 연결
- 12 Factor 원칙: config는 환경 변수로 주입`,
  },
  {
    id: "cli-config-secrets",
    name: "시크릿 저장 전략 비교",
    description: "OS keychain·env·파일 저장소의 장단점을 비교해 결정을 냅니다.",
    promptTemplate: `출력: { "secrets":{supportedStores,preferredStore,rotationPolicy,redactInLogs}, "comparison":[{store,pros,cons}] }
store: os-keychain|env-var|plain-file|encrypted-file|external-vault
- 개인 CLI는 os-keychain 권장, 에이전트/CI는 env-var 권장
- plain-file은 금지`,
  },
];
