import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const interviewPersonaExample = {
  personas: [
    {
      id: "persona-freelancer",
      name: "김지영",
      role: "프리랜서 디자이너",
      painPoints: [
        "프로젝트별 수입과 비용을 따로 정리하기 번거롭다.",
        "세금 신고 시즌마다 영수증과 입금 내역을 다시 모아야 한다.",
      ],
      goals: [
        "프로젝트 단위로 수입과 비용을 빠르게 파악하고 싶다.",
        "세금 신고용 자료를 평소에 자동으로 정리하고 싶다.",
      ],
    },
    {
      id: "persona-student",
      name: "박민수",
      role: "여러 아르바이트를 병행하는 대학생",
      painPoints: [
        "수입원이 많아 총수입을 한 번에 파악하기 어렵다.",
        "목표 저축액을 세워도 소비 패턴을 제어하기 힘들다.",
      ],
      goals: [
        "수입원을 자동으로 분류해 주길 바란다.",
        "저축 목표 달성률을 주간 단위로 확인하고 싶다.",
      ],
    },
  ],
  userStories: [
    {
      id: "story-income-summary",
      personaId: "persona-freelancer",
      asA: "프리랜서 디자이너로서",
      iWant: "프로젝트별 수입과 비용을 자동으로 정리하고 싶다",
      soThat: "정산과 세금 신고 준비 시간을 줄일 수 있다",
    },
    {
      id: "story-saving-goal",
      personaId: "persona-student",
      asA: "여러 아르바이트를 하는 대학생으로서",
      iWant: "목표 저축률과 현재 소비 추이를 한눈에 보고 싶다",
      soThat: "불필요한 지출을 줄이고 계획적으로 저축할 수 있다",
    },
  ],
  successScenarios: [
    "김지영이 프로젝트별 수입을 등록하자 자동 분류된 월간 요약이 생성되고 세금 신고용 자료가 함께 정리된다.",
    "박민수가 저축 목표를 설정하자 주간 소비 피드백과 절약 알림을 받아 목표 달성률을 유지한다.",
  ],
  failureScenarios: [
    "자동 분류가 부정확해 사용자가 반복적으로 수동 수정해야 한다.",
    "알림 빈도가 과도해 사용자가 알림 자체를 꺼 버린다.",
  ],
};

const jtbdExample = {
  personas: [
    {
      id: "persona-pm",
      name: "이수현",
      role: "스타트업 PM",
      painPoints: [
        "회의 후 회의록을 정리하는 데 항상 30분 이상이 걸린다.",
        "액션 아이템과 의사결정이 채팅방에 흩어져 누락되기 쉽다.",
      ],
      goals: [
        "회의 직후 핵심 요약과 액션 아이템을 받고 싶다.",
        "팀에 공유 가능한 회의 결과물을 바로 만들고 싶다.",
      ],
    },
  ],
  userStories: [
    {
      id: "story-meeting-summary",
      personaId: "persona-pm",
      asA: "바쁜 PM으로서",
      iWant: "회의 녹음만 업로드하면 핵심 내용이 자동 요약되길 원한다",
      soThat: "회의록 작성 시간을 줄이고 결정 사항을 빠르게 공유할 수 있다",
    },
  ],
  successScenarios: [
    "회의가 끝난 뒤 5분 안에 요약본과 액션 아이템이 생성되어 팀 채널로 공유된다.",
  ],
  failureScenarios: [
    "음질이 좋지 않아 결정 사항이 누락된 요약본이 생성된다.",
  ],
};

const journeyMapExample = {
  personas: [
    {
      id: "persona-shopper",
      name: "최은지",
      role: "모바일 패션 쇼핑을 자주 하는 직장인",
      painPoints: [
        "사이즈 정보가 불명확해 반품을 자주 하게 된다.",
        "반품 절차가 복잡해 구매를 망설이게 된다.",
      ],
      goals: [
        "구매 전에 내 체형에 맞는 사이즈를 쉽게 알고 싶다.",
        "문제가 생겨도 간단하게 교환과 반품을 처리하고 싶다.",
      ],
    },
  ],
  userStories: [
    {
      id: "story-size-recommendation",
      personaId: "persona-shopper",
      asA: "온라인 패션 쇼핑을 자주 하는 사용자로서",
      iWant: "내 체형에 맞는 사이즈 추천을 받고 싶다",
      soThat: "반품 없이 만족스러운 구매를 할 수 있다",
    },
  ],
  successScenarios: [
    "최은지가 상품 상세에서 추천 사이즈를 확인하고 첫 구매에서 적합한 사이즈를 선택한다.",
  ],
  failureScenarios: [
    "추천 사이즈가 실제와 맞지 않아 사용자가 기존 쇼핑몰과 차이를 느끼지 못한다.",
  ],
};

export const userScenarioTemplates: PhaseTemplate[] = [
  {
    id: "interview-persona",
    name: "인터뷰 기반 페르소나",
    description:
      "가상 사용자 인터뷰를 통해 페르소나와 유저 스토리를 도출합니다.",
    promptTemplate: buildPromptTemplate({
      role: "가상 사용자 인터뷰를 제품 시나리오로 전환하는 UX 리서처",
      objective:
        "타겟 사용자를 2명 내외의 현실적인 페르소나로 구체화하고, 각 페르소나에 연결되는 유저 스토리와 성공/실패 시나리오를 설계해.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        '타겟 사용자: "{targetUsers}"',
      ],
      outputRules: [
        "personas와 userStories의 id는 서로 참조 가능하도록 일관되게 작성해.",
        "userStories의 asA, iWant, soThat은 자연스러운 유저 스토리 문장으로 작성해.",
        "successScenarios와 failureScenarios는 실제 제품 사용 흐름이 보이도록 서술해.",
      ],
      exampleInput: [
        '서비스 이름: "머니메이트"',
        '타겟 사용자: "프리랜서와 대학생처럼 수입 흐름이 불규칙한 사용자"',
      ],
      exampleOutput: interviewPersonaExample,
    }),
  },
  {
    id: "jtbd",
    name: "Job-to-be-Done 프레임워크",
    description:
      "사용자가 달성하려는 '잡(Job)' 중심으로 시나리오를 설계합니다.",
    promptTemplate: buildPromptTemplate({
      role: "JTBD 관점으로 사용자 동기와 기대 결과를 정리하는 제품 전략가",
      objective:
        "사용자가 제품을 '고용'하는 핵심 이유를 기준으로 페르소나와 유저 스토리를 설계해. 기능 목록이 아니라 달성하려는 진짜 진전(progress)가 보여야 해.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        '사용자의 핵심 Job: "{coreJob}"',
      ],
      outputRules: [
        "painPoints와 goals는 Job을 방해하는 요소와 원하는 진전을 중심으로 적어.",
        "successScenarios는 Job이 해결된 뒤의 명확한 변화를 보여줘.",
        "failureScenarios는 제품이 신뢰를 잃는 대표 상황을 1개 이상 포함해.",
      ],
      exampleInput: [
        '서비스 이름: "미팅캡처"',
        '사용자의 핵심 Job: "회의 직후 핵심 결정 사항과 액션 아이템을 빠르게 정리해 팀과 공유하고 싶다"',
      ],
      exampleOutput: jtbdExample,
    }),
  },
  {
    id: "journey-map",
    name: "여정 맵 기반",
    description:
      "사용자 여정의 각 단계별 감정과 행동을 매핑하여 시나리오를 설계합니다.",
    promptTemplate: buildPromptTemplate({
      role: "사용자 여정 단계에서 인사이트를 추출하는 서비스 디자이너",
      objective:
        "여정 단계별 행동과 감정의 흐름을 바탕으로 대표 페르소나, 핵심 유저 스토리, 성공/실패 시나리오를 구성해.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        '사용자 여정 단계: "{journeyStages}"',
      ],
      outputRules: [
        "journeyStages에 포함된 단계가 userStories와 시나리오에 자연스럽게 반영되게 작성해.",
        "personas는 1~2명으로 압축하되 각기 다른 니즈가 드러나게 구성해.",
        "failureScenarios는 감정 이탈이 발생하는 지점을 구체적으로 적어.",
      ],
      exampleInput: [
        '서비스 이름: "핏셀렉트"',
        '사용자 여정 단계: "상품 탐색 → 사이즈 확인 → 결제 → 배송 대기 → 수령 후 피드백"',
      ],
      exampleOutput: journeyMapExample,
    }),
  },
];
