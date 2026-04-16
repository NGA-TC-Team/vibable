export const APP_VERSION = "0.1.0";
export const SCHEMA_VERSION = 1;
export const AUTOSAVE_DEBOUNCE_MS = 500;
export const AUTOSAVE_RETRY_DELAY_MS = 3000;
export const AUTOSAVE_MAX_RETRIES = 3;
export const SHARE_URL_MAX_BYTES = 64 * 1024;
export const MAX_SITEMAP_DEPTH = 4;

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

  "phase.requirements": "기능/비기능 요구사항을 체계적으로 정리하세요.",
  "requirements.functional": "서비스가 제공해야 하는 기능 요구사항을 우선순위와 함께 정의하세요",
  "requirements.nonFunctional": "성능, 보안, 접근성 등 비기능 요구사항을 정의하세요",

  "phase.infoArchitecture": "서비스의 화면 구조와 유저 동선을 설계하세요.",
  "infoArchitecture.sitemap": "서비스의 전체 페이지 구조를 트리 형태로 설계하세요",
  "infoArchitecture.userFlows": "주요 유저 여정을 단계별 플로우로 정의하세요",
  "infoArchitecture.navRules": "모든 화면에 적용되는 글로벌 네비게이션 규칙",

  "phase.screenDesign": "각 화면의 목적, 상태, 인터랙션을 구체적으로 정의하세요.",
  "screenDesign.pages": "각 화면의 이름, UX 의도, 상태별 UI, 인터랙션을 정의하세요",

  "phase.dataModel": "서비스에 필요한 데이터 구조를 설계하세요.",
  "dataModel.entities": "주요 엔티티와 필드를 정의하세요. 관계 설정도 가능합니다",
  "dataModel.storage": "데이터 저장 전략을 선택하고 세부사항을 기록하세요",

  "phase.designSystem": "시각적 일관성을 위한 디자인 시스템을 정의하세요.",
  "designSystem.visualTheme": "전체적인 분위기, 밀도, 디자인 철학을 정의하세요",
  "designSystem.colorPalette": "서비스에 사용할 컬러 토큰을 정의하세요",
  "designSystem.typography": "폰트 크기, 굵기, 행간 등 타이포 체계를 정의하세요",
  "designSystem.components": "주요 컴포넌트의 스타일 변형을 정의하세요",
  "designSystem.layout": "콘텐츠 최대 너비, 여백 철학 등 레이아웃 기준",
  "designSystem.guidelines": "디자인 Do's and Don'ts 가이드라인",
  "designSystem.uxWriting": "톤앤매너, 에러 메시지 스타일, 용어 사전을 정의하세요",
};
