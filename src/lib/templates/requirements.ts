import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const sharedOutputRules = [
  'functional.priority는 "must" | "should" | "could" | "wont" 중 하나만 사용해.',
  'constraints[].category는 "policy" | "legal" | "budget" | "schedule" | "legacySystem" | "other" 중 하나만 사용해.',
  'glossary[].kind는 "role" | "state" | "entity" | "rule" | "term" 중 하나만 사용해.',
  'clarifications[].status는 "open" | "answered" | "deferred" 중 하나만 사용해.',
  "functional[].statement는 반드시 `시스템은 <대상>이 <행동/상태>할 수 있어야 한다` 형식의 한 문장으로 작성해.",
  "UI·화면·버튼·색상·기술 스택 등 구현 방식 묘사는 모두 배제하고, 업무 목적·제약·용어로 변환해.",
  "불명확하거나 추가 질문이 필요한 항목은 clarifications 배열에 질문 형태로 남기고, 알 수 없는 값은 비워 둬.",
];

const storyToRequirementsExample = {
  functional: [
    {
      id: "REQ-001",
      title: "소셜 로그인",
      description: "사용자가 카카오 또는 구글 계정으로 회원가입과 로그인을 할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "OAuth 인증이 완료되면 신규 사용자는 자동 가입된다.",
        "로그인 성공 후 3초 이내 메인 화면으로 이동한다.",
        "만료된 세션은 재인증 또는 토큰 갱신 흐름으로 복구된다.",
      ],
      statement: "시스템은 사용자가 카카오 또는 구글 계정으로 회원가입과 로그인을 할 수 있어야 한다.",
      rationale: "가입 전환율을 높이고 비밀번호 재설정 문의 부담을 줄이기 위함.",
      source: "유저 스토리 인터뷰 #3",
      relatedGoalIds: [],
    },
    {
      id: "REQ-002",
      title: "대시보드 요약 조회",
      description: "로그인한 사용자가 최근 활동 요약과 핵심 지표를 대시보드에서 확인할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "최근 7일 기준 핵심 지표를 요약으로 제공한다.",
        "빈 상태에서는 시작 가이드를 함께 제공한다.",
      ],
      statement: "시스템은 로그인 사용자가 최근 활동 요약과 핵심 지표를 한 화면에서 확인할 수 있어야 한다.",
      rationale: "재방문 동기를 유지하기 위해 첫 화면에서 가치 체감이 필요.",
      source: "유저 스토리 인터뷰 #5",
      relatedGoalIds: [],
    },
  ],
  nonFunctional: [
    {
      id: "NFR-001",
      category: "performance",
      description: "주요 대시보드 화면은 일반적인 모바일 네트워크 환경에서 3초 이내에 로드되어야 한다.",
    },
    {
      id: "NFR-002",
      category: "security",
      description: "모든 인증 관련 요청은 HTTPS를 사용하고 토큰은 안전하게 저장 및 갱신되어야 한다.",
    },
  ],
  constraints: [
    {
      id: "CON-001",
      category: "legal",
      description: "개인정보 수집 시 국내 개인정보보호법과 GDPR 이중 준수 필요.",
      source: "법무팀 검토 의견",
      impact: "계정 삭제·데이터 이전·보관 기간 기능 설계에 반영.",
    },
  ],
  glossary: [
    {
      id: "GLS-001",
      term: "핵심 지표",
      definition: "사용자의 재방문과 핵심 행동 전환을 나타내는 요약 수치 묶음.",
      kind: "term",
      aliases: ["KPI", "Key Metric"],
    },
  ],
  clarifications: [
    {
      id: "CLR-001",
      question: "소셜 로그인에 네이버를 포함할 범위인가?",
      context: "REQ-001에서 제공 플랫폼 미확정",
      owner: "PM",
      status: "open",
      answer: "",
      blocksRequirementIds: ["REQ-001"],
    },
  ],
};

const screenBacktrackExample = {
  functional: [
    {
      id: "REQ-001",
      title: "할 일 생성",
      description: "사용자가 제목, 마감일, 우선순위를 입력해 새 할 일을 생성할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "제목은 필수이며 1자 이상 100자 이하로 입력한다.",
        "생성 직후 새 항목이 목록에 반영된다.",
        "생성 실패 시 재시도 방법을 함께 안내한다.",
      ],
      statement: "시스템은 사용자가 제목·마감일·우선순위를 입력해 할 일을 생성할 수 있어야 한다.",
      rationale: "핵심 JTBD: 즉시 행동으로 옮길 수 있는 Task 입력 지원.",
      source: "화면 역추적: 할 일 생성 모달",
      relatedGoalIds: [],
    },
    {
      id: "REQ-002",
      title: "할 일 필터링",
      description: "사용자가 상태별로 할 일 목록을 필터링할 수 있다.",
      priority: "should",
      acceptanceCriteria: [
        "전체, 진행 중, 완료 필터를 제공한다.",
        "현재 적용 중인 필터를 시각적으로 구분한다.",
      ],
      statement: "시스템은 사용자가 진행 상태에 따라 할 일 목록을 필터링할 수 있어야 한다.",
      rationale: "할 일이 쌓일수록 빠른 탐색이 재방문 체감에 직결됨.",
      source: "화면 역추적: 필터 바",
      relatedGoalIds: [],
    },
  ],
  nonFunctional: [
    {
      id: "NFR-001",
      category: "accessibility",
      description: "핵심 작업 흐름은 키보드만으로도 조작 가능해야 하며 색상 외의 방법으로 상태를 구분해야 한다.",
    },
    {
      id: "NFR-002",
      category: "offline",
      description: "오프라인 상태에서도 할 일 조회와 임시 작성이 가능하고 온라인 복귀 시 동기화되어야 한다.",
    },
  ],
  constraints: [
    {
      id: "CON-001",
      category: "legacySystem",
      description: "기존 알림 서비스는 사내 이메일 게이트웨이를 통해서만 전송 가능하다.",
      source: "인프라팀 운영 가이드",
      impact: "푸시 알림 대체 수단이 필요하거나 게이트웨이 대상 추가 예산이 필요.",
    },
  ],
  glossary: [
    {
      id: "GLS-001",
      term: "임시 작성",
      definition: "오프라인 상태에서 로컬에 저장되고 온라인 복귀 시 서버에 반영되는 할 일 상태.",
      kind: "state",
      aliases: ["Pending Sync"],
    },
  ],
  clarifications: [
    {
      id: "CLR-001",
      question: "필터 바에서 다중 선택(AND/OR)을 허용할지 여부",
      context: "REQ-002 상세 인터랙션 정의",
      owner: "Design",
      status: "open",
      answer: "",
      blocksRequirementIds: ["REQ-002"],
    },
  ],
};

const moscowExample = {
  functional: [
    {
      id: "REQ-001",
      title: "사용자 인증",
      description: "이메일 또는 소셜 계정으로 가입과 로그인을 제공한다.",
      priority: "must",
      acceptanceCriteria: [
        "이메일 인증 또는 소셜 인증 완료 후 계정이 생성된다.",
        "비밀번호 정책 또는 OAuth 오류가 명확히 안내된다.",
      ],
      statement: "시스템은 사용자가 이메일 또는 소셜 계정으로 가입·로그인할 수 있어야 한다.",
      rationale: "서비스 이용의 전제 조건으로, 신뢰 가능한 사용자 식별이 필요.",
      source: "PM 요구사항 백로그",
      relatedGoalIds: [],
    },
    {
      id: "REQ-002",
      title: "프로필 테마 커스터마이징",
      description: "사용자가 프로필 화면의 시각 테마를 선택해 적용할 수 있다.",
      priority: "could",
      acceptanceCriteria: [
        "최소 5개의 프리셋 테마를 제공한다.",
        "선택 즉시 미리보기가 반영된다.",
      ],
      statement: "시스템은 사용자가 프로필에 사용할 테마를 선택해 적용할 수 있어야 한다.",
      rationale: "개인화 경험으로 재방문 유도를 보강하는 차별 요소.",
      source: "이해관계자 워크샵 메모",
      relatedGoalIds: [],
    },
    {
      id: "REQ-003",
      title: "AI 추천 기능",
      description: "사용자 행동을 기반으로 콘텐츠를 추천한다.",
      priority: "wont",
      acceptanceCriteria: [
        "현재 릴리스 범위에서는 구현하지 않는다.",
        "후속 버전을 위한 요구사항 메모 수준으로만 유지한다.",
      ],
      statement: "시스템은 사용자가 자신의 이용 맥락에 맞는 콘텐츠 추천을 받을 수 있어야 한다.",
      rationale: "현 단계에서는 학습 데이터 부족으로 효용 대비 비용이 높아 다음 버전으로 유예.",
      source: "PM 요구사항 백로그",
      relatedGoalIds: [],
    },
  ],
  nonFunctional: [
    {
      id: "NFR-001",
      category: "performance",
      description: "핵심 API는 일반적인 사용 부하에서 500ms 안팎의 응답 시간을 유지해야 한다.",
    },
  ],
  constraints: [
    {
      id: "CON-001",
      category: "budget",
      description: "첫 릴리스 인프라 비용은 월 300만 원 이내로 유지한다.",
      source: "경영진 예산 승인",
      impact: "추천 엔진 등 고비용 기능은 우선순위 wont로 분류 근거가 됨.",
    },
  ],
  glossary: [
    {
      id: "GLS-001",
      term: "릴리스 범위",
      definition: "이번 버전에서 사용자에게 제공 가능한 기능의 경계.",
      kind: "rule",
      aliases: ["Release Scope"],
    },
  ],
  clarifications: [
    {
      id: "CLR-001",
      question: "테마 커스터마이징을 Phase 2 릴리스에 포함할지 결정 필요",
      context: "REQ-002 우선순위 could로 분류했으나 마케팅 요청 있음",
      owner: "PM",
      status: "open",
      answer: "",
      blocksRequirementIds: ["REQ-002"],
    },
  ],
};

const solutionToRequirementsExample = {
  functional: [
    {
      id: "REQ-001",
      title: "승인 요청 검토",
      description: "관리자가 승인 대기 상태의 콘텐츠를 확인하고 승인 또는 반려할 수 있다.",
      priority: "must",
      acceptanceCriteria: [
        "승인 또는 반려 시 상태가 즉시 갱신된다.",
        "반려 시 사유를 필수로 남기고 작성자에게 전달한다.",
      ],
      statement: "시스템은 관리자가 승인 대기 중인 콘텐츠를 검토하고 승인 또는 반려 처리할 수 있어야 한다.",
      rationale: "품질 관리와 법적 문제를 방지하기 위한 1차 게이트가 필요.",
      source: "클라이언트 발화: '관리자가 승인 버튼 누르면 공개되게 해 주세요'",
      relatedGoalIds: [],
    },
  ],
  nonFunctional: [
    {
      id: "NFR-001",
      category: "security",
      description: "승인/반려 행위는 감사 로그로 남고 변조 불가능해야 한다.",
    },
  ],
  constraints: [
    {
      id: "CON-001",
      category: "policy",
      description: "반려 사유 템플릿은 법무팀이 사전 승인한 문구 집합에서 선택한다.",
      source: "법무팀 운영 정책",
      impact: "커스텀 사유 자유 입력은 추후 별도 승인 절차 필요.",
    },
  ],
  glossary: [
    {
      id: "GLS-001",
      term: "승인 대기",
      definition: "작성자가 제출했으나 관리자의 승인·반려 결정을 아직 받지 못한 콘텐츠의 상태.",
      kind: "state",
      aliases: ["Pending Approval"],
    },
    {
      id: "GLS-002",
      term: "관리자",
      definition: "콘텐츠 승인·반려 권한을 가진 내부 사용자 역할.",
      kind: "role",
      aliases: ["Moderator"],
    },
  ],
  clarifications: [
    {
      id: "CLR-001",
      question: "반려 후 작성자가 수정 재제출할 때 횟수 제한이 있는가?",
      context: "REQ-001 후속 흐름",
      owner: "PM",
      status: "open",
      answer: "",
      blocksRequirementIds: ["REQ-001"],
    },
  ],
};

export const requirementsTemplates: PhaseTemplate[] = [
  {
    id: "story-to-requirements",
    name: "유저 스토리→요구사항",
    description:
      "이전 단계의 유저 스토리를 MECE 5섹션 요구사항으로 변환합니다.",
    promptTemplate: buildPromptTemplate({
      role: "유저 스토리를 실행 가능한 요구사항으로 분해하는 프로덕트 오너",
      objective:
        "유저 스토리에서 기능/비기능 요구사항을 뽑고, 반드시 지켜야 할 제약·공용 용어·미해결 질문까지 MECE로 분류해.",
      inputFields: ['유저 스토리 목록: "{userStories}"'],
      outputRules: [
        ...sharedOutputRules,
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
      "이미 구상한 화면 목록에서 역으로 필요한 요구사항·제약·용어·미해결 사항을 추출합니다.",
    promptTemplate: buildPromptTemplate({
      role: "화면 설계에서 누락된 요구사항을 역추적하는 서비스 기획자",
      objective:
        "주어진 화면 목록을 읽고 화면이 성립하려면 반드시 필요한 요구사항·제약·용어·불명확 사항을 5섹션으로 정리해.",
      inputFields: ['화면 목록: "{screenList}"'],
      outputRules: [
        ...sharedOutputRules,
        "화면 하나당 필요한 핵심 액션이 functional에 반영되게 작성해.",
        "nonFunctional에는 접근성, 오프라인, 반응 속도 같은 운영 품질 요구사항을 포함해.",
        "설명은 화면 요소가 아니라 사용자 가치·업무 목적 중심으로 적어.",
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
      "전체 기능 목록을 Must/Should/Could/Won't로 분류하고 제약·용어·미해결을 함께 정리합니다.",
    promptTemplate: buildPromptTemplate({
      role: "기능 후보를 릴리스 범위로 압축하는 PM",
      objective:
        "기능 아이디어 목록을 릴리스 우선순위 관점에서 분류하고, 판단 근거가 되는 제약과 용어, 미해결 질문까지 한 번에 정리해.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        '기능 목록: "{featureList}"',
      ],
      outputRules: [
        ...sharedOutputRules,
        "wont로 분류한 기능도 rationale과 acceptanceCriteria에 제외 근거를 남겨.",
        "nonFunctional은 전체 서비스 공통으로 필요한 항목만 추려서 1개 이상 포함해.",
        "우선순위 분류 근거가 되는 제약(예산·일정·법·레거시)은 반드시 constraints에 기록해.",
      ],
      exampleInput: [
        '서비스 이름: "크루허브"',
        '기능 목록: "이메일 로그인, 팀 초대, 프로젝트 보드, AI 추천, 프로필 테마 변경"',
      ],
      exampleOutput: moscowExample,
    }),
  },
  {
    id: "solution-to-requirements",
    name: "솔루션 묘사→요구사항",
    description:
      "클라이언트가 UI·버튼·화면 중심으로 설명한 raw 발화에서 구현 묘사는 걷어내고, 업무 목적·제약·용어·미해결을 뽑아 요구사항으로 정리합니다.",
    promptTemplate: buildPromptTemplate({
      role:
        "클라이언트의 솔루션 묘사에서 문제와 업무 목적을 역추출해 요구사항으로 번역하는 시니어 비즈니스 애널리스트",
      objective:
        "입력에 담긴 UI·화면·버튼·색상·기술 스택 등 구현 세부는 모두 무시하고, 그 안에 담긴 업무 목적·맥락·제약·공용어·불명확 사항을 MECE 5섹션으로 정제해.",
      inputFields: [
        '클라이언트 원문 설명: "{clientDescription}"',
        '서비스 맥락(선택): "{serviceContext}"',
      ],
      outputRules: [
        ...sharedOutputRules,
        "입력에 화면·버튼·팝업·색상 같은 표현이 등장해도 그대로 옮기지 말고, 그것이 달성하려는 업무 목적으로 번역해.",
        "glossary와 clarifications는 각각 최소 1개 이상 추출하도록 노력해. 정말 근거가 없을 때만 빈 배열을 허용해.",
        "동일 개념을 가리키는 다른 이름이 보이면 glossary.aliases에 모아.",
      ],
      exampleInput: [
        '클라이언트 원문 설명: "관리자가 승인 버튼 누르면 글이 공개되고, 반려하면 사유를 이메일로 보내야 돼요."',
        '서비스 맥락(선택): "사내 커뮤니티에서 사용자 게시글을 검토하는 구조"',
      ],
      exampleOutput: solutionToRequirementsExample,
    }),
  },
];
