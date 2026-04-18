import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const screenToSitemapExample = {
  sitemap: [
    {
      id: "home",
      label: "홈",
      path: "/",
      screenType: "hub",
      purpose: "서비스의 진입점과 주요 기능을 한눈에 보여준다",
      primaryTask: "원하는 기능으로 진입한다",
      children: [
        {
          id: "dashboard",
          label: "대시보드",
          path: "/dashboard",
          screenType: "hub",
          purpose: "사용자의 작업 상태와 지표를 요약한다",
          primaryTask: "오늘 해야 할 일을 파악한다",
          children: [],
        },
        {
          id: "projects",
          label: "프로젝트",
          path: "/projects",
          screenType: "list",
          purpose: "참여 중인 프로젝트를 탐색한다",
          primaryTask: "프로젝트를 선택하거나 생성한다",
          children: [
            {
              id: "project-detail",
              label: "프로젝트 상세",
              path: "/projects/:id",
              screenType: "detail",
              purpose: "프로젝트 단위의 상세 진행 상황을 조회한다",
              primaryTask: "프로젝트 작업을 이어서 수행한다",
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
      screenType: "settings",
      purpose: "계정과 서비스 환경을 관리한다",
      primaryTask: "세부 설정 항목을 변경한다",
      children: [
        {
          id: "profile",
          label: "프로필 설정",
          path: "/settings/profile",
          screenType: "edit",
          purpose: "사용자의 공개 프로필을 수정한다",
          primaryTask: "이름·사진 등 프로필 정보를 저장한다",
          children: [],
        },
      ],
    },
  ],
  userFlows: [
    {
      id: "flow-onboarding",
      name: "온보딩 플로우",
      goal: "새 사용자가 가입 후 첫 진입 가이드를 끝까지 본다",
      primaryActor: "신규 사용자",
      startScreenRef: "home",
      successEndings: ["step-dashboard"],
      failureEndings: [],
      steps: [
        {
          id: "step-home",
          screenRef: "home",
          action: "회원가입 CTA를 누른다",
          intent: "select",
          actor: "신규 사용자",
          next: ["step-signup"],
        },
        {
          id: "step-signup",
          screenRef: "signup",
          action: "가입 정보를 입력하고 계정을 만든다",
          intent: "submit",
          actor: "신규 사용자",
          outcome: "계정이 생성되고 로그인 상태가 된다",
          next: ["step-dashboard"],
        },
        {
          id: "step-dashboard",
          screenRef: "dashboard",
          action: "첫 진입 가이드를 확인한다",
          intent: "complete",
          actor: "신규 사용자",
          next: [],
        },
      ],
    },
  ],
  globalNavRules: [
    {
      id: "nav-gnb",
      title: "로그인 후 GNB 노출",
      rule: "로그인 후에는 상단 GNB를 통해 홈, 프로젝트, 설정으로 이동할 수 있다.",
      severity: "info",
      appliesTo: { roles: ["member", "admin"] },
    },
    {
      id: "nav-guest-restrict",
      title: "비로그인 접근 제한",
      rule: "로그인 전 사용자는 홈과 인증 관련 화면만 접근할 수 있다.",
      severity: "critical",
      rationale: "보안·과금 연동 화면 노출 차단",
    },
    {
      id: "nav-back",
      title: "권한 인지 뒤로가기",
      rule: "뒤로 가기는 직전 방문 경로를 우선 따르되 권한 없는 페이지는 차단한다.",
      severity: "warning",
    },
  ],
};

const userFlowExample = {
  sitemap: [
    {
      id: "main",
      label: "메인",
      path: "/",
      screenType: "hub",
      purpose: "쇼핑 진입점에서 탐색과 추천을 연다",
      primaryTask: "원하는 상품 카테고리로 이동한다",
      children: [
        {
          id: "search",
          label: "검색",
          path: "/search",
          screenType: "list",
          purpose: "검색어로 상품 후보를 조회한다",
          primaryTask: "검색어를 입력하고 결과로 이동한다",
          children: [
            {
              id: "search-result",
              label: "검색 결과",
              path: "/search/results",
              screenType: "list",
              purpose: "조건에 부합하는 상품 목록을 제시한다",
              primaryTask: "원하는 상품을 선택하거나 담는다",
              children: [],
            },
          ],
        },
        {
          id: "cart",
          label: "장바구니",
          path: "/cart",
          screenType: "review",
          purpose: "구매 예정 상품과 금액을 확인한다",
          primaryTask: "수량을 조정하고 결제로 이동한다",
          children: [],
        },
        {
          id: "checkout",
          label: "결제",
          path: "/checkout",
          screenType: "create",
          purpose: "배송·결제 정보를 입력해 주문을 생성한다",
          primaryTask: "결제를 완료한다",
          children: [],
        },
      ],
    },
  ],
  userFlows: [
    {
      id: "flow-purchase",
      name: "상품 구매 플로우",
      goal: "사용자가 결제를 완료하여 주문이 생성된다",
      primaryActor: "구매자",
      startScreenRef: "search",
      successEndings: ["step-checkout"],
      failureEndings: [],
      steps: [
        {
          id: "step-search",
          screenRef: "search",
          action: "검색어를 입력해 상품을 찾는다",
          intent: "input",
          actor: "구매자",
          next: ["step-result"],
        },
        {
          id: "step-result",
          screenRef: "search-result",
          action: "상품을 선택하고 장바구니에 담는다",
          intent: "select",
          actor: "구매자",
          outcome: "장바구니에 상품이 추가됨",
          next: ["step-cart"],
        },
        {
          id: "step-cart",
          screenRef: "cart",
          action: "주문 내역을 확인하고 결제로 이동한다",
          intent: "confirm",
          actor: "구매자",
          next: ["step-checkout"],
        },
        {
          id: "step-checkout",
          screenRef: "checkout",
          action: "결제를 완료한다",
          intent: "submit",
          actor: "구매자",
          outcome: "주문 상태가 confirmed로 변경됨",
          next: [],
        },
      ],
    },
  ],
  globalNavRules: [
    {
      id: "nav-2tap",
      title: "2탭 접근",
      rule: "핵심 탐색 화면은 하단 탭 또는 상단 진입점으로 2탭 이내 접근 가능해야 한다.",
      severity: "warning",
    },
    {
      id: "nav-state-badge",
      title: "상태 변경 뱃지",
      rule: "장바구니나 알림처럼 상태 변화가 있는 영역은 뱃지로 노출한다.",
      severity: "info",
    },
  ],
};

const competitorIaExample = {
  sitemap: [
    {
      id: "feed",
      label: "피드",
      path: "/feed",
      screenType: "list",
      purpose: "팔로우·추천 기반 최신 콘텐츠를 노출한다",
      primaryTask: "흥미로운 콘텐츠를 소비한다",
      children: [],
    },
    {
      id: "explore",
      label: "탐색",
      path: "/explore",
      screenType: "hub",
      purpose: "새로운 주제의 콘텐츠를 발견한다",
      primaryTask: "카테고리 또는 키워드로 탐색한다",
      children: [
        {
          id: "category",
          label: "카테고리 탐색",
          path: "/explore/:category",
          screenType: "list",
          purpose: "특정 카테고리의 대표 콘텐츠를 모아본다",
          primaryTask: "관심 콘텐츠로 진입한다",
          children: [],
        },
      ],
    },
    {
      id: "create",
      label: "콘텐츠 생성",
      path: "/create",
      screenType: "create",
      purpose: "사용자가 새 콘텐츠를 즉시 생성한다",
      primaryTask: "이미지·텍스트를 올리고 발행한다",
      children: [],
    },
    {
      id: "mypage",
      label: "마이페이지",
      path: "/mypage",
      screenType: "hub",
      purpose: "내 활동과 보관물을 한곳에서 관리한다",
      primaryTask: "이전 활동을 되짚고 재방문한다",
      children: [],
    },
  ],
  userFlows: [
    {
      id: "flow-content-create",
      name: "콘텐츠 생성 플로우",
      goal: "사용자가 콘텐츠를 발행하고 피드에서 노출을 확인한다",
      primaryActor: "크리에이터",
      startScreenRef: "feed",
      successEndings: ["step-feed-check"],
      failureEndings: [],
      steps: [
        {
          id: "step-feed",
          screenRef: "feed",
          action: "생성 버튼을 눌러 작성 화면으로 이동한다",
          intent: "select",
          actor: "크리에이터",
          next: ["step-create"],
        },
        {
          id: "step-create",
          screenRef: "create",
          action: "콘텐츠를 작성하고 발행한다",
          intent: "submit",
          actor: "크리에이터",
          outcome: "콘텐츠가 피드에 노출됨",
          next: ["step-feed-check"],
        },
        {
          id: "step-feed-check",
          screenRef: "feed",
          action: "발행된 콘텐츠를 피드에서 다시 확인한다",
          intent: "view",
          actor: "크리에이터",
          next: [],
        },
      ],
    },
  ],
  globalNavRules: [
    {
      id: "nav-depth",
      title: "얕은 탐색 구조",
      rule: "경쟁사보다 탐색 깊이를 줄여 주요 콘텐츠에 2뎁스 이내 도달할 수 있어야 한다.",
      severity: "warning",
      rationale: "경쟁사 대비 차별화 포인트",
    },
    {
      id: "nav-create-everywhere",
      title: "생성 액션 상시 노출",
      rule: "콘텐츠 생성 액션은 어느 화면에서도 명확히 드러나야 한다.",
      severity: "critical",
    },
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
        "각 sitemap 노드에 screenType, purpose, primaryTask를 기본으로 기입하고, 필요 시 audience(배열)·primaryEntity(문자열)도 함께 채워.",
        "userFlows.steps.screenRef에는 해당 스텝이 일어나는 sitemap 노드 id를 넣어.",
        "각 flow에는 goal(완료 정의), primaryActor, startScreenRef, successEndings, failureEndings를 채워 플로우 완결성을 표현해.",
        "step에는 intent(view/input/select/submit/confirm/approve/reject/complete), actor, 필요 시 condition/outcome을 기입해.",
        "globalNavRules는 {id,title,rule,severity(info|warning|critical),rationale,appliesTo} 형태의 객체 배열로 작성해.",
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
        "userFlows는 시나리오별로 1개 이상 생성하고, 각 flow에는 goal·primaryActor·startScreenRef·successEndings·failureEndings를 채워.",
        "각 step에는 action·screenRef 뿐 아니라 intent(view/input/select/submit/confirm/approve/reject/complete)와 actor를 넣고, 분기·결과가 있으면 condition/outcome도 기입해.",
        "sitemap에는 플로우 수행에 필요한 핵심 화면만 우선 반영해도 돼. 각 노드에는 screenType·purpose·primaryTask를 기본으로, 필요 시 audience·primaryEntity를 함께 기입해.",
        "globalNavRules는 {id,title,rule,severity,rationale,appliesTo} 객체 배열로 작성해.",
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
        "sitemap 노드에는 screenType·purpose·primaryTask를 채우고, 화면의 대상(audience)과 핵심 객체(primaryEntity)가 경쟁사와 차별되는 지점이면 함께 기입해.",
        "userFlows는 경쟁사 대비 차별화되는 핵심 사용 흐름을 최소 1개 포함하고, goal·primaryActor·successEndings·failureEndings를 정확히 표시해.",
        "각 step의 screenRef는 sitemap 노드 id를 정확히 가리켜야 하고, intent·actor 필드를 채워 흐름의 주체와 의도를 드러내.",
        "globalNavRules는 {id,title,rule,severity,rationale,appliesTo} 객체 배열로 작성해.",
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
