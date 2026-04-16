import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const screenToSitemapExample = {
  sitemap: [
    {
      id: "home",
      label: "홈",
      path: "/",
      children: [
        {
          id: "dashboard",
          label: "대시보드",
          path: "/dashboard",
          children: [],
        },
        {
          id: "projects",
          label: "프로젝트",
          path: "/projects",
          children: [
            {
              id: "project-detail",
              label: "프로젝트 상세",
              path: "/projects/:id",
              children: [],
            },
          ],
        },
      ],
    },
    {
      id: "settings",
      label: "설정",
      path: "/settings",
      children: [
        {
          id: "profile",
          label: "프로필 설정",
          path: "/settings/profile",
          children: [],
        },
      ],
    },
  ],
  userFlows: [
    {
      id: "flow-onboarding",
      name: "온보딩 플로우",
      steps: [
        {
          id: "step-home",
          screenRef: "home",
          action: "회원가입 CTA를 누른다",
          next: ["step-signup"],
        },
        {
          id: "step-signup",
          screenRef: "signup",
          action: "가입 정보를 입력하고 계정을 만든다",
          next: ["step-dashboard"],
        },
        {
          id: "step-dashboard",
          screenRef: "dashboard",
          action: "첫 진입 가이드를 확인한다",
          next: [],
        },
      ],
    },
  ],
  globalNavRules: [
    "로그인 후에는 상단 GNB를 통해 홈, 프로젝트, 설정으로 이동할 수 있다.",
    "로그인 전 사용자는 홈과 인증 관련 화면만 접근할 수 있다.",
    "뒤로 가기는 직전 방문 경로를 우선 따르되 권한 없는 페이지는 차단한다.",
  ],
};

const userFlowExample = {
  sitemap: [
    {
      id: "main",
      label: "메인",
      path: "/",
      children: [
        {
          id: "search",
          label: "검색",
          path: "/search",
          children: [
            {
              id: "search-result",
              label: "검색 결과",
              path: "/search/results",
              children: [],
            },
          ],
        },
        {
          id: "cart",
          label: "장바구니",
          path: "/cart",
          children: [],
        },
        {
          id: "checkout",
          label: "결제",
          path: "/checkout",
          children: [],
        },
      ],
    },
  ],
  userFlows: [
    {
      id: "flow-purchase",
      name: "상품 구매 플로우",
      steps: [
        {
          id: "step-search",
          screenRef: "search",
          action: "검색어를 입력해 상품을 찾는다",
          next: ["step-result"],
        },
        {
          id: "step-result",
          screenRef: "search-result",
          action: "상품을 선택하고 장바구니에 담는다",
          next: ["step-cart"],
        },
        {
          id: "step-cart",
          screenRef: "cart",
          action: "주문 내역을 확인하고 결제로 이동한다",
          next: ["step-checkout"],
        },
        {
          id: "step-checkout",
          screenRef: "checkout",
          action: "결제를 완료한다",
          next: [],
        },
      ],
    },
  ],
  globalNavRules: [
    "핵심 탐색 화면은 하단 탭 또는 상단 진입점으로 2탭 이내 접근 가능해야 한다.",
    "장바구니나 알림처럼 상태 변화가 있는 영역은 뱃지로 노출한다.",
  ],
};

const competitorIaExample = {
  sitemap: [
    {
      id: "feed",
      label: "피드",
      path: "/feed",
      children: [],
    },
    {
      id: "explore",
      label: "탐색",
      path: "/explore",
      children: [
        {
          id: "category",
          label: "카테고리 탐색",
          path: "/explore/:category",
          children: [],
        },
      ],
    },
    {
      id: "create",
      label: "콘텐츠 생성",
      path: "/create",
      children: [],
    },
    {
      id: "mypage",
      label: "마이페이지",
      path: "/mypage",
      children: [],
    },
  ],
  userFlows: [
    {
      id: "flow-content-create",
      name: "콘텐츠 생성 플로우",
      steps: [
        {
          id: "step-feed",
          screenRef: "feed",
          action: "생성 버튼을 눌러 작성 화면으로 이동한다",
          next: ["step-create"],
        },
        {
          id: "step-create",
          screenRef: "create",
          action: "콘텐츠를 작성하고 발행한다",
          next: ["step-feed-check"],
        },
        {
          id: "step-feed-check",
          screenRef: "feed",
          action: "발행된 콘텐츠를 피드에서 다시 확인한다",
          next: [],
        },
      ],
    },
  ],
  globalNavRules: [
    "경쟁사보다 탐색 깊이를 줄여 주요 콘텐츠에 2뎁스 이내 도달할 수 있어야 한다.",
    "콘텐츠 생성 액션은 어느 화면에서도 명확히 드러나야 한다.",
  ],
};

export const infoArchitectureTemplates: PhaseTemplate[] = [
  {
    id: "screen-to-sitemap",
    name: "화면 목록→사이트맵",
    description:
      "화면 목록을 계층적 사이트맵 구조로 변환합니다.",
    promptTemplate: buildPromptTemplate({
      role: "화면 목록을 구조화된 IA로 정리하는 UX 아키텍트",
      objective:
        "화면 목록을 계층형 사이트맵으로 재구성하고, 최소 1개의 대표 유저 플로우와 글로벌 네비게이션 규칙을 함께 설계해.",
      inputFields: ['화면 목록: "{screenList}"'],
      outputRules: [
        "sitemap은 children을 사용해 트리 구조로 정리해.",
        "userFlows.steps.next에는 다음 step id를 넣어 흐름 연결이 보이게 해.",
        "globalNavRules는 메뉴 접근 원칙, 권한, 뒤로 가기 같은 규칙을 문장 배열로 작성해.",
      ],
      exampleInput: [
        '화면 목록: "홈, 회원가입, 대시보드, 프로젝트 목록, 프로젝트 상세, 설정, 프로필 설정"',
      ],
      exampleOutput: screenToSitemapExample,
    }),
  },
  {
    id: "user-flow-gen",
    name: "유저 플로우 생성",
    description:
      "핵심 사용자 시나리오를 기반으로 유저 플로우를 설계합니다.",
    promptTemplate: buildPromptTemplate({
      role: "핵심 시나리오를 단계형 사용자 흐름으로 변환하는 서비스 디자이너",
      objective:
        "핵심 시나리오를 수행 단계로 쪼개고, 필요한 화면 구조를 사이트맵과 유저 플로우에 동시에 반영해.",
      inputFields: ['핵심 시나리오: "{coreScenarios}"'],
      outputRules: [
        "userFlows는 시나리오별로 1개 이상 생성해.",
        "각 step의 action은 사용자가 실제로 하는 행동 중심으로 적어.",
        "sitemap에는 플로우 수행에 필요한 핵심 화면만 우선 반영해도 돼.",
      ],
      exampleInput: [
        '핵심 시나리오: "사용자가 상품을 검색하고 장바구니를 거쳐 결제를 완료한다"',
      ],
      exampleOutput: userFlowExample,
    }),
  },
  {
    id: "competitor-ia",
    name: "경쟁사 IA 분석",
    description:
      "경쟁사의 정보 구조를 분석하여 우리 서비스의 IA를 설계합니다.",
    promptTemplate: buildPromptTemplate({
      role: "경쟁사 구조를 참고해 개선안을 설계하는 IA 컨설턴트",
      objective:
        "경쟁사의 구조를 그대로 복제하지 말고 장점은 유지하면서 개선 포인트를 반영한 사이트맵, 유저 플로우, 글로벌 네비게이션 규칙을 제안해.",
      inputFields: [
        '경쟁 서비스: "{competitors}"',
        '우리 서비스 이름: "{serviceName}"',
        '개선 포인트: "{improvement}"',
      ],
      outputRules: [
        "improvement에 적힌 개선 포인트가 sitemap 또는 globalNavRules에 직접 반영되게 작성해.",
        "userFlows는 경쟁사 대비 차별화되는 핵심 사용 흐름을 최소 1개 포함해.",
        "경로(path)는 서비스 성격에 맞는 현실적인 URL 패턴으로 작성해.",
      ],
      exampleInput: [
        '경쟁 서비스: "인스타그램, 핀터레스트"',
        '우리 서비스 이름: "크리에이티브 보드"',
        '개선 포인트: "탐색 동선을 단순화하고 생성 경험 접근성을 더 높이고 싶다"',
      ],
      exampleOutput: competitorIaExample,
    }),
  },
];
