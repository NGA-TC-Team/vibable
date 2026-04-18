import type {
  ScreenType,
  FlowStepIntent,
  NavRuleSeverity,
} from "@/types/phases";

export const APP_VERSION = "0.1.0";
export const SCHEMA_VERSION = 2;
export const AUTOSAVE_DEBOUNCE_MS = 500;
export const AUTOSAVE_RETRY_DELAY_MS = 3000;
export const AUTOSAVE_MAX_RETRIES = 3;
export const SHARE_URL_MAX_BYTES = 64 * 1024;
export const MAX_SITEMAP_DEPTH = 4;

export const SCREEN_TYPE_LABELS: Record<ScreenType, string> = {
  hub: "허브",
  list: "목록",
  detail: "상세",
  create: "생성",
  edit: "편집",
  review: "검토",
  result: "결과",
  settings: "설정",
};

export const FLOW_STEP_INTENT_LABELS: Record<FlowStepIntent, string> = {
  view: "조회",
  input: "입력",
  select: "선택",
  submit: "제출",
  confirm: "확인",
  approve: "승인",
  reject: "반려",
  complete: "완료",
};

export const NAV_RULE_SEVERITY_LABELS: Record<NavRuleSeverity, string> = {
  info: "안내",
  warning: "주의",
  critical: "필수",
};

export const SECTION_TOOLTIPS: Record<string, string> = {
  "phase.overview": "프로젝트의 핵심 정보를 정의하세요. 이름, 배경, 목표, 대상 등.",
  "overview.projectName": "프로젝트의 공식 명칭을 입력하세요",
  "overview.elevatorPitch": "30초 안에 프로젝트를 설명할 수 있는 한 줄 소개",
  "overview.background": "이 프로젝트를 시작하게 된 배경과 문제 상황",
  "overview.coreValue": "다른 서비스와 차별화되는 핵심 가치 제안",
  "overview.businessGoals": "달성하고자 하는 비즈니스 측면의 목표",
  "overview.targetUsers": "주요 타깃 유저 그룹을 설명하세요",
  "overview.scope": "MVP, Full, Prototype 중 프로젝트 범위를 설정하세요",
  "overview.competitors": "유사 서비스 분석으로 차별점을 파악하세요",
  "overview.constraints": "예산, 일정, 기술적 제약 등을 기록하세요",
  "overview.successMetrics": "성공을 측정할 수 있는 정량 지표를 정의하세요",
  "overview.timeline": "주요 마일스톤과 일정을 계획하세요",
  "overview.references": "참고할 자료, URL, 문서를 기록하세요",
  "overview.techStack": "사용할 기술 스택을 메모하세요",

  "phase.userScenario": "유저의 관점에서 서비스를 사용하는 시나리오를 정의하세요.",
  "userScenario.personas": "대표 유저 유형을 정의하고 그들의 목표와 고충을 기록하세요",
  "userScenario.userStories": "각 페르소나의 유저 스토리를 As a / I want / So that 형태로 작성하세요",
  "userScenario.successScenarios": "유저가 성공적으로 목표를 달성하는 시나리오",
  "userScenario.failureScenarios": "유저가 실패하거나 이탈하는 시나리오",

  "phase.requirements": "기능/비기능 요구사항·제약·용어·미해결 사항을 MECE로 정리하세요.",
  "requirements.functional": "서비스가 제공해야 하는 기능 요구사항을 우선순위·문장 규격·근거와 함께 정의하세요",
  "requirements.nonFunctional": "성능, 보안, 접근성 등 비기능 요구사항을 정의하세요",
  "requirements.constraints": "정책·법·예산·일정·레거시 시스템 등 반드시 지켜야 하는 제약을 기록하세요",
  "requirements.glossary": "도메인 용어·역할·상태·규칙 같은 프로젝트 공용어의 정의를 정리하세요",
  "requirements.clarifications": "불명확하거나 추가 질문이 필요한 항목을 담당자와 상태로 추적하세요",
  "requirements.statement": "\"시스템은 <대상>이 <행동/상태>할 수 있어야 한다\" 형식으로 규격화된 한 줄 요구 문장",
  "requirements.rationale": "이 요구가 왜 필요한지 — 업무 목적·비즈니스 근거",
  "requirements.source": "요청자, 근거 문서, 회의록 등 추적을 위한 출처",

  "phase.infoArchitecture": "서비스의 화면 구조와 유저 동선을 설계하세요.",
  "infoArchitecture.sitemap": "서비스의 전체 페이지 구조를 트리 형태로 설계하세요",
  "infoArchitecture.userFlows": "주요 유저 여정을 단계별 플로우로 정의하세요",
  "infoArchitecture.navRules": "모든 화면에 적용되는 글로벌 네비게이션 규칙",
  "infoArchitecture.sitemap.purpose":
    "이 화면이 왜 존재하는지 한 줄로 적으세요 (기획 의도의 핵심)",
  "infoArchitecture.sitemap.screenType":
    "화면의 역할을 고르세요 — 허브·목록·상세·생성·편집·검토·결과·설정",
  "infoArchitecture.sitemap.primaryTask":
    "사용자가 이 화면에서 수행하는 핵심 행동을 적으세요",
  "infoArchitecture.flowStep.screenRef":
    "이 스텝이 일어나는 화면을 사이트맵 노드에서 선택하세요",
  "infoArchitecture.flowStep.next":
    "이 스텝 다음에 이어질 스텝을 같은 플로우 안에서 고르세요 (분기 가능)",
  "infoArchitecture.diagnostics":
    "사이트맵·플로우 연결 무결성과 기획의도 누락을 검사합니다",
  "infoArchitecture.sitemap.audience":
    "이 화면에 접근 가능한 대상(예: admin, member). 쉼표 또는 Enter로 구분",
  "infoArchitecture.sitemap.primaryEntity":
    "이 화면이 다루는 핵심 도메인 객체(예: Project, Invoice)",
  "infoArchitecture.flow.goal":
    "이 플로우가 끝났을 때 달성되어야 하는 상태",
  "infoArchitecture.flow.primaryActor":
    "이 플로우를 주로 수행하는 사용자 역할",
  "infoArchitecture.flow.successEndings":
    "성공으로 간주되는 종료 스텝을 지정하세요",
  "infoArchitecture.flow.failureEndings":
    "실패/이탈로 간주되는 종료 스텝을 지정하세요",
  "infoArchitecture.flowStep.intent":
    "스텝의 의도를 분류해 검증·내보내기에 활용합니다",
  "infoArchitecture.flowStep.actor":
    "이 스텝을 수행하는 역할/주체",
  "infoArchitecture.flowStep.condition":
    "이 스텝으로 진입 또는 분기되는 조건",
  "infoArchitecture.flowStep.outcome":
    "이 스텝 수행 결과로 생기는 변화/산출물",
  "infoArchitecture.navRules.structured":
    "제목·적용 대상·근거·중요도를 구조적으로 기록해 의사결정 규칙으로 만듭니다",
  "infoArchitecture.roles":
    "화면 접근 대상(audience)과 플로우 수행자(actor)를 표준화하는 역할 목록",
  "infoArchitecture.entities":
    "사이트맵·플로우에서 참조하는 핵심 도메인 객체 목록",
  "infoArchitecture.qualityScore":
    "진단 결과와 데이터 풍부도를 기반으로 계산된 IA 품질 점수 (0~100)",
  "infoArchitecture.seedScreenDesign":
    "사이트맵 노드를 화면설계 페이지로 시드 — 기존 페이지는 보존하고 누락된 노드만 추가",

  "phase.screenDesign": "각 화면의 목적, 상태, 인터랙션을 구체적으로 정의하세요.",
  "screenDesign.pages": "각 화면의 이름, UX 의도, 상태별 UI, 인터랙션을 정의하세요",

  "phase.dataModel": "서비스에 필요한 데이터 구조를 설계하세요.",
  "dataModel.entities": "주요 엔티티와 필드를 정의하세요. 관계 설정도 가능합니다",
  "dataModel.storage": "데이터 저장 전략을 선택하고 세부사항을 기록하세요",

  "phase.designSystem": "시각적 일관성을 위한 디자인 시스템을 정의하세요.",

  "phase.agentRequirements": "에이전트 기능·비기능 요구와 권한·자율성·환경 제약을 정의하세요.",
  "phase.agentArchitecture": "Claude는 파이프라인·에이전트 역할, OpenClaw는 워크스페이스·채널 구조를 설계하세요.",
  "phase.agentBehavior": "시스템 프롬프트(Claude) 또는 SOUL/IDENTITY 등 페르소나·운영 규칙(OpenClaw)을 작성하세요.",
  "phase.agentTools": "도구·훅·MCP(Claude) 또는 채널·게이트웨이·스킬(OpenClaw)을 정의하세요.",
  "phase.agentSafety": "위험 시나리오, 사람 개입 지점, 테스트·롤백 계획을 기록하세요.",
  "designSystem.visualTheme": "전체적인 분위기, 밀도, 디자인 철학을 정의하세요",
  "designSystem.colorPalette": "서비스에 사용할 컬러 토큰을 정의하세요",
  "designSystem.typography": "폰트 크기, 굵기, 행간 등 타이포 체계를 정의하세요",
  "designSystem.components": "주요 컴포넌트의 스타일 변형을 정의하세요",
  "designSystem.layout": "콘텐츠 최대 너비, 여백 철학 등 레이아웃 기준",
  "designSystem.guidelines": "디자인 Do's and Don'ts 가이드라인",
  "designSystem.uxWriting": "톤앤매너, 에러 메시지 스타일, 용어 사전을 정의하세요",
};
