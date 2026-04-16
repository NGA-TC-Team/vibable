import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const storyToRequirementsExample = {
  functional: [
    {
      id: "fr-social-login",
      title: "소셜 로그인",
      description: "사용자가 카카오 또는 구글 계정으로 회원가입과 로그인을 할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "OAuth 인증이 완료되면 신규 사용자는 자동 가입된다.",
        "로그인 성공 후 3초 이내 메인 화면으로 이동한다.",
        "만료된 세션은 재인증 또는 토큰 갱신 흐름으로 복구된다.",
      ],
    },
    {
      id: "fr-dashboard-summary",
      title: "대시보드 요약 조회",
      description: "로그인한 사용자가 최근 활동 요약과 핵심 지표를 대시보드에서 확인할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "최근 7일 기준 핵심 지표를 카드 형태로 보여준다.",
        "빈 상태에서는 시작 가이드를 함께 제공한다.",
      ],
    },
  ],
  nonFunctional: [
    {
      id: "nfr-performance-main",
      category: "performance",
      description: "주요 대시보드 화면은 일반적인 모바일 네트워크 환경에서 3초 이내에 로드되어야 한다.",
    },
    {
      id: "nfr-security-auth",
      category: "security",
      description: "모든 인증 관련 요청은 HTTPS를 사용하고 토큰은 안전하게 저장 및 갱신되어야 한다.",
    },
  ],
};

const screenBacktrackExample = {
  functional: [
    {
      id: "fr-create-task",
      title: "할 일 생성",
      description: "사용자가 제목, 마감일, 우선순위를 입력해 새 할 일을 생성할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "제목은 필수이며 1자 이상 100자 이하로 입력한다.",
        "생성 직후 새 항목이 목록에 반영된다.",
        "생성 실패 시 재시도 방법을 함께 안내한다.",
      ],
    },
    {
      id: "fr-filter-task",
      title: "할 일 필터링",
      description: "사용자가 상태별로 할 일 목록을 필터링할 수 있다.",
      priority: "should",
      acceptanceCriteria: [
        "전체, 진행 중, 완료 필터를 제공한다.",
        "현재 적용 중인 필터를 시각적으로 구분한다.",
      ],
    },
  ],
  nonFunctional: [
    {
      id: "nfr-accessibility-task",
      category: "accessibility",
      description: "핵심 작업 흐름은 키보드만으로도 조작 가능해야 하며 색상 외의 방법으로 상태를 구분해야 한다.",
    },
    {
      id: "nfr-offline-task",
      category: "offline",
      description: "오프라인 상태에서도 할 일 조회와 임시 작성이 가능하고 온라인 복귀 시 동기화되어야 한다.",
    },
  ],
};

const moscowExample = {
  functional: [
    {
      id: "fr-user-auth",
      title: "사용자 인증",
      description: "이메일 또는 소셜 계정으로 가입과 로그인을 제공한다.",
      priority: "must",
      acceptanceCriteria: [
        "이메일 인증 또는 소셜 인증 완료 후 계정이 생성된다.",
        "비밀번호 정책 또는 OAuth 오류가 명확히 안내된다.",
      ],
    },
    {
      id: "fr-profile-theme",
      title: "프로필 테마 커스터마이징",
      description: "사용자가 프로필 화면의 시각 테마를 선택해 적용할 수 있다.",
      priority: "could",
      acceptanceCriteria: [
        "최소 5개의 프리셋 테마를 제공한다.",
        "선택 즉시 미리보기가 반영된다.",
      ],
    },
    {
      id: "fr-ai-recommendation",
      title: "AI 추천 기능",
      description: "사용자 행동을 기반으로 콘텐츠를 추천한다.",
      priority: "wont",
      acceptanceCriteria: [
        "현재 릴리스 범위에서는 구현하지 않는다.",
        "후속 버전을 위한 요구사항 메모 수준으로만 유지한다.",
      ],
    },
  ],
  nonFunctional: [
    {
      id: "nfr-response-time",
      category: "performance",
      description: "핵심 API는 일반적인 사용 부하에서 500ms 안팎의 응답 시간을 유지해야 한다.",
    },
  ],
};

export const requirementsTemplates: PhaseTemplate[] = [
  {
    id: "story-to-requirements",
    name: "유저 스토리→요구사항",
    description:
      "이전 단계의 유저 스토리를 기능/비기능 요구사항으로 변환합니다.",
    promptTemplate: buildPromptTemplate({
      role: "유저 스토리를 실행 가능한 요구사항으로 분해하는 프로덕트 오너",
      objective:
        "유저 스토리에서 기능 요구사항과 비기능 요구사항을 뽑아내고, 각 기능 요구사항에는 우선순위와 acceptance criteria를 붙여 구조화해.",
      inputFields: ['유저 스토리 목록: "{userStories}"'],
      outputRules: [
        'functional.priority는 "must" | "should" | "could" | "wont" 중 하나만 사용해.',
        "functional은 구체적 기능 단위로 쪼개고, nonFunctional은 성능/보안/접근성/오프라인/기타 관점에서 정리해.",
        "acceptanceCriteria는 테스트 가능한 문장 배열로 작성해.",
      ],
      exampleInput: [
        '유저 스토리 목록: "사용자는 소셜 로그인을 원한다 / 로그인 후 최근 활동을 대시보드에서 바로 확인하고 싶다"',
      ],
      exampleOutput: storyToRequirementsExample,
    }),
  },
  {
    id: "screen-backtrack",
    name: "화면 기반 역추적",
    description:
      "이미 구상한 화면 목록에서 역으로 필요한 요구사항을 추출합니다.",
    promptTemplate: buildPromptTemplate({
      role: "화면 설계에서 누락된 요구사항을 역추적하는 서비스 기획자",
      objective:
        "주어진 화면 목록과 화면 목적을 읽고, 화면이 성립하려면 반드시 필요한 기능/비기능 요구사항을 추론해.",
      inputFields: ['화면 목록: "{screenList}"'],
      outputRules: [
        "화면 하나당 필요한 핵심 액션이 functional에 반영되게 작성해.",
        "nonFunctional에는 접근성, 오프라인, 반응 속도 같은 운영 품질 요구사항을 포함해.",
        "설명은 화면 요소가 아니라 사용자 가치 중심으로 적어.",
      ],
      exampleInput: [
        '화면 목록: "홈, 할 일 생성 모달, 할 일 목록, 필터 바, 오프라인 안내 배너"',
      ],
      exampleOutput: screenBacktrackExample,
    }),
  },
  {
    id: "moscow",
    name: "MoSCoW 우선순위",
    description:
      "전체 기능 목록을 Must/Should/Could/Won't로 분류하여 요구사항을 정리합니다.",
    promptTemplate: buildPromptTemplate({
      role: "기능 후보를 릴리스 범위로 압축하는 PM",
      objective:
        "기능 아이디어 목록을 릴리스 우선순위 관점에서 분류하고, 실제 구현 범위를 바로 판단할 수 있는 요구사항 목록으로 정리해.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        '기능 목록: "{featureList}"',
      ],
      outputRules: [
        'functional.priority는 must, should, could, wont 중 하나만 사용해.',
        "wont로 분류한 기능도 acceptanceCriteria를 간단히 남겨 왜 제외됐는지 이해할 수 있게 해.",
        "nonFunctional은 전체 서비스 공통으로 필요한 항목만 추려서 1개 이상 포함해.",
      ],
      exampleInput: [
        '서비스 이름: "크루허브"',
        '기능 목록: "이메일 로그인, 팀 초대, 프로젝트 보드, AI 추천, 프로필 테마 변경"',
      ],
      exampleOutput: moscowExample,
    }),
  },
];
