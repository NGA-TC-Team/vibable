import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const screenDetailExample = {
  pages: [
    {
      id: "page-login",
      name: "로그인",
      route: "/login",
      uxIntent: {
        userGoal: "빠르고 안정적으로 서비스에 진입하고 싶다.",
        businessIntent: "가입 전환율을 높이고 첫 진입 이탈을 줄인다.",
      },
      states: {
        idle: "이메일 입력 필드, 비밀번호 입력 필드, 소셜 로그인 CTA를 보여준다.",
        loading: "로그인 요청 중 버튼을 비활성화하고 진행 상태를 표시한다.",
        offline: "오프라인 상태를 알리고 재시도 전까지 입력값을 유지한다.",
        errors: [
          {
            type: "validation",
            description: "이메일 형식이 잘못되면 필드 아래에 즉시 수정 안내를 보여준다.",
          },
          {
            type: "permission",
            description: "로그인 시도 횟수가 초과되면 보안 안내와 비밀번호 재설정 진입점을 노출한다.",
          },
        ],
      },
      interactions: [
        {
          element: "소셜 로그인 버튼",
          trigger: "탭",
          action: "외부 인증을 시작하고 완료 시 대시보드로 이동한다.",
        },
        {
          element: "비밀번호 찾기 링크",
          trigger: "탭",
          action: "비밀번호 재설정 화면으로 이동한다.",
        },
      ],
      inPages: ["landing"],
      outPages: ["dashboard", "password-reset"],
    },
  ],
};

const errorScenarioExample = {
  pages: [
    {
      id: "page-checkout",
      name: "결제",
      route: "/checkout",
      uxIntent: {
        userGoal: "선택한 상품을 안전하게 결제하고 주문을 끝내고 싶다.",
        businessIntent: "결제 완료율을 높이고 이탈을 줄인다.",
      },
      states: {
        idle: "주문 요약, 배송지 입력, 결제 수단 선택 영역을 보여준다.",
        loading: "결제 승인 요청 중 전체 화면 진행 상태를 표시한다.",
        offline: "네트워크 연결이 없어 결제를 진행할 수 없음을 안내하고 복구를 기다리게 한다.",
        errors: [
          {
            type: "network",
            description: "승인 요청 중 연결이 끊기면 중복 결제를 막기 위해 결제 상태 확인 페이지로 안내한다.",
          },
          {
            type: "validation",
            description: "카드 정보가 잘못되면 입력 필드 근처에서 수정 포인트를 안내한다.",
          },
          {
            type: "permission",
            description: "결제 한도 또는 본인 인증 이슈가 있으면 다른 수단을 선택하도록 유도한다.",
          },
          {
            type: "custom",
            description: "결제 직전 재고가 소진되면 품절 안내와 대체 상품 제안을 함께 노출한다.",
          },
        ],
      },
      interactions: [
        {
          element: "결제하기 버튼",
          trigger: "탭",
          action: "결제 승인을 요청하고 성공 시 주문 완료 화면으로 이동한다.",
        },
      ],
      inPages: ["cart"],
      outPages: ["order-complete", "order-status"],
    },
  ],
};

const screenMappingExample = {
  pages: [
    {
      id: "page-home",
      name: "홈",
      route: "/",
      uxIntent: {
        userGoal: "핵심 콘텐츠와 다음 행동을 빠르게 찾고 싶다.",
        businessIntent: "주요 기능 진입과 재방문 동선을 강화한다.",
      },
      states: {
        idle: "추천 콘텐츠 카드와 빠른 액션 메뉴를 기본으로 노출한다.",
        loading: "추천 콘텐츠 영역에 스켈레톤을 표시한다.",
        offline: "캐시된 콘텐츠를 보여주고 최신 동기화가 되지 않았음을 알린다.",
        errors: [
          {
            type: "network",
            description: "콘텐츠 로딩 실패 시 재시도 버튼과 기본 탐색 링크를 제공한다.",
          },
        ],
      },
      interactions: [
        {
          element: "콘텐츠 카드",
          trigger: "탭",
          action: "상세 페이지로 이동한다.",
        },
        {
          element: "검색 아이콘",
          trigger: "탭",
          action: "검색 화면으로 이동한다.",
        },
        {
          element: "프로필 아바타",
          trigger: "탭",
          action: "마이페이지로 이동한다.",
        },
      ],
      inPages: ["login", "search", "detail", "mypage"],
      outPages: ["detail", "search", "mypage", "notifications"],
    },
  ],
};

export const screenDesignTemplates: PhaseTemplate[] = [
  {
    id: "screen-detail",
    name: "화면 상세 명세",
    description:
      "각 화면의 UX 의도, 상태, 인터랙션을 상세하게 명세합니다.",
    promptTemplate: buildPromptTemplate({
      role: "각 화면의 의도와 상태를 구조화하는 UX 기획자",
      objective:
        "주어진 화면 목록을 바탕으로 각 화면의 UX 의도, 상태, 인터랙션, 연결 관계를 구체적인 화면 명세로 작성해.",
      inputFields: ['화면 목록: "{screenList}"'],
      outputRules: [
        "pages 배열의 각 항목은 하나의 화면을 의미하며 id, name, route를 모두 채워.",
        "states.errors는 문제가 발생했을 때 사용자에게 어떻게 보일지 설명하는 배열로 작성해.",
        "inPages와 outPages는 화면 id 또는 slug 기준으로 흐름을 이해할 수 있게 정리해.",
      ],
      exampleInput: [
        '화면 목록: "랜딩, 로그인, 회원가입, 대시보드, 비밀번호 재설정"',
      ],
      exampleOutput: screenDetailExample,
    }),
  },
  {
    id: "error-scenario",
    name: "에러 시나리오 생성",
    description:
      "각 화면에서 발생할 수 있는 에러 시나리오를 체계적으로 생성합니다.",
    promptTemplate: buildPromptTemplate({
      role: "정상 흐름과 예외 흐름을 함께 설계하는 서비스 디자이너",
      objective:
        "주어진 화면에서 발생 가능한 오류와 엣지 케이스를 `states.errors` 중심으로 정리하고, 오류 상황에서도 사용자가 다음 행동을 알 수 있게 설계해.",
      inputFields: ['화면 목록: "{screenList}"'],
      outputRules: [
        'errors.type은 "network" | "validation" | "permission" | "notFound" | "custom" 중 하나만 사용해.',
        "오류 설명에는 문제 상황과 대응 방식이 함께 드러나야 해.",
        "필요하면 idle/loading/offline 상태도 함께 보강해서 한 화면 명세로 완결되게 작성해.",
      ],
      exampleInput: [
        '화면 목록: "장바구니, 결제, 주문 완료, 결제 상태 확인"',
      ],
      exampleOutput: errorScenarioExample,
    }),
  },
  {
    id: "screen-mapping",
    name: "화면 간 연결 매핑",
    description:
      "화면 사이의 이동 경로와 연결 관계를 매핑합니다.",
    promptTemplate: buildPromptTemplate({
      role: "화면 전환과 탐색 흐름을 설계하는 인터랙션 디자이너",
      objective:
        "각 화면이 어디서 들어오고 어디로 나가는지 흐름 중심으로 정리해. 화면 간 연결성, 전환 인터랙션, 핵심 상태를 함께 보여줘.",
      inputFields: ['화면 목록: "{screenList}"'],
      outputRules: [
        "inPages와 outPages는 실제 이동 가능한 관계만 넣어.",
        "interactions는 화면 전환을 발생시키는 핵심 트리거 위주로 1개 이상 작성해.",
        "route는 알 수 없더라도 추정 가능한 수준의 URL 패턴을 제안해.",
      ],
      exampleInput: [
        '화면 목록: "홈, 검색, 검색 결과, 상세, 알림, 마이페이지"',
      ],
      exampleOutput: screenMappingExample,
    }),
  },
];
