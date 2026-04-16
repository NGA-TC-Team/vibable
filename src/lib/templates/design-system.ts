import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const referenceBasedExample = {
  visualTheme: {
    mood: "깔끔하고 신뢰감 있는 핀테크",
    density: "comfortable",
    philosophy: "정보 위계를 또렷하게 유지하고 숫자 데이터의 신뢰감과 가독성을 최우선으로 둔다.",
  },
  colorPalette: [
    { name: "primary", hex: "#2563EB", role: "주요 CTA와 브랜드 강조 색상" },
    { name: "primary-soft", hex: "#DBEAFE", role: "선택 상태와 보조 배경" },
    { name: "success", hex: "#16A34A", role: "성공과 긍정 지표" },
    { name: "danger", hex: "#DC2626", role: "경고와 오류 상태" },
    { name: "surface", hex: "#F8FAFC", role: "카드와 섹션 배경" },
    { name: "text-primary", hex: "#1E293B", role: "본문 텍스트" },
  ],
  typography: {
    fontFamilies: [
      { role: "heading", family: "Pretendard", fallback: "system-ui, sans-serif" },
      { role: "body", family: "Pretendard", fallback: "system-ui, sans-serif" },
      { role: "monospace", family: "JetBrains Mono", fallback: "monospace" },
    ],
    scale: [
      { name: "display", size: "2rem", lineHeight: "1.2", weight: "700" },
      { name: "heading", size: "1.25rem", lineHeight: "1.4", weight: "600" },
      { name: "body", size: "1rem", lineHeight: "1.6", weight: "400" },
      { name: "caption", size: "0.875rem", lineHeight: "1.4", weight: "400" },
    ],
  },
  components: [
    {
      component: "button",
      variants: "primary, secondary, ghost",
      borderRadius: "14px",
      notes: "주요 CTA는 solid primary, 보조 액션은 ghost 변형을 사용한다.",
    },
  ],
  layout: {
    spacingScale: ["0.25rem", "0.5rem", "1rem", "1.5rem", "2rem", "3rem"],
    gridColumns: 12,
    maxContentWidth: "1280px",
    whitespacePhilosophy: "정보 밀도는 유지하되 섹션 간 여백으로 시선을 분리한다.",
  },
  elevation: {
    shadows: [
      { level: "sm", value: "0 1px 3px rgba(15,23,42,0.08)", usage: "입력 필드와 기본 카드" },
      { level: "md", value: "0 8px 24px rgba(15,23,42,0.12)", usage: "드롭다운과 팝오버" },
    ],
    surfaceHierarchy: "배경 < 카드 < 떠 있는 인터랙션 요소 순으로 레이어를 구분한다.",
  },
  guidelines: {
    dos: [
      "숫자 데이터에는 monospace 계열을 적극 활용한다.",
      "카드와 표의 정렬 기준을 통일해 신뢰감을 만든다.",
      "긍정과 부정 상태 색상을 일관되게 유지한다.",
    ],
    donts: [
      "강조 색상을 여러 개 섞어 주요 액션을 흐리지 않는다.",
      "한 화면에 과도한 그림자 레벨을 혼용하지 않는다.",
    ],
  },
  responsive: {
    breakpoints: [
      { name: "sm", minWidth: "640px" },
      { name: "lg", minWidth: "1024px" },
    ],
    touchTargetMin: "44px",
    collapsingStrategy: "작은 화면에서는 보조 정보와 서브패널을 접고 핵심 데이터 먼저 노출한다.",
  },
  uxWriting: {
    toneLevel: 3,
    glossary: [],
    errorMessageStyle: "friendly",
  },
  presetSelection: {
    references: ["토스", "리볼트"],
    darkMode: true,
  },
};

const moodToTokensExample = {
  visualTheme: {
    mood: "따뜻하고 친근한 커뮤니티",
    density: "spacious",
    philosophy: "여백과 부드러운 대비를 활용해 편안하고 대화적인 분위기를 만든다.",
  },
  colorPalette: [
    { name: "primary", hex: "#F59E0B", oklch: "oklch(0.80 0.16 85)", role: "브랜드 주요 액션" },
    { name: "primary-dark", hex: "#D97706", role: "hover 및 active 상태" },
    { name: "secondary", hex: "#8B5CF6", role: "보조 강조 요소" },
    { name: "background", hex: "#FFFBEB", role: "전체 배경" },
    { name: "surface", hex: "#FFFFFF", role: "카드와 모달 배경" },
    { name: "text-primary", hex: "#292524", role: "본문 텍스트" },
  ],
  typography: {
    fontFamilies: [
      { role: "heading", family: "Pretendard", fallback: "system-ui, sans-serif" },
      { role: "body", family: "Pretendard", fallback: "system-ui, sans-serif" },
    ],
    scale: [
      { name: "display", size: "2.25rem", lineHeight: "1.15", weight: "700" },
      { name: "heading", size: "1.5rem", lineHeight: "1.35", weight: "600" },
      { name: "body", size: "1rem", lineHeight: "1.7", weight: "400" },
    ],
  },
  components: [
    {
      component: "card",
      variants: "default, highlighted",
      borderRadius: "20px",
      notes: "콘텐츠 카드에는 넉넉한 패딩과 부드러운 그림자를 적용한다.",
    },
  ],
  layout: {
    spacingScale: ["0.25rem", "0.5rem", "1rem", "1.5rem", "2rem", "3rem", "4rem"],
    gridColumns: 12,
    maxContentWidth: "1200px",
    whitespacePhilosophy: "섹션 간 48px, 요소 간 16px 안팎의 리듬을 유지한다.",
  },
  elevation: {
    shadows: [
      { level: "sm", value: "0 1px 3px rgba(0,0,0,0.08)", usage: "기본 카드" },
      { level: "md", value: "0 6px 20px rgba(0,0,0,0.10)", usage: "드롭다운과 강조 카드" },
      { level: "lg", value: "0 12px 32px rgba(0,0,0,0.12)", usage: "모달" },
    ],
    surfaceHierarchy: "배경 < 카드 < 모달 순으로 깊이를 점진적으로 올린다.",
  },
  guidelines: {
    dos: ["넓은 여백으로 콘텐츠 블록을 분리한다."],
    donts: ["텍스트 대비가 약한 파스텔 조합만으로 핵심 정보를 표현하지 않는다."],
  },
  responsive: {
    breakpoints: [
      { name: "sm", minWidth: "640px" },
      { name: "md", minWidth: "768px" },
      { name: "xl", minWidth: "1280px" },
    ],
    touchTargetMin: "44px",
    collapsingStrategy: "모바일에서는 1열 우선, 데스크톱에서는 카드 그리드와 보조 패널을 확장한다.",
  },
  uxWriting: {
    toneLevel: 4,
    glossary: [],
    errorMessageStyle: "friendly",
  },
  presetSelection: {
    moodPreset: "warm-community",
    colorPreset: "amber-violet",
    darkMode: false,
  },
};

const uxWritingGuideExample = {
  visualTheme: {
    mood: "",
    density: "comfortable",
    philosophy: "",
  },
  colorPalette: [],
  typography: {
    fontFamilies: [],
    scale: [],
  },
  components: [],
  layout: {
    spacingScale: [],
    gridColumns: 12,
    maxContentWidth: "1280px",
    whitespacePhilosophy: "",
  },
  elevation: {
    shadows: [],
    surfaceHierarchy: "",
  },
  guidelines: {
    dos: [
      "사용자에게 다음 행동을 명확히 안내한다.",
      "오류 메시지에는 원인과 해결 방법을 함께 제공한다.",
      "버튼 레이블은 구체적인 동사형으로 작성한다.",
    ],
    donts: [
      "기술 오류 코드를 그대로 노출하지 않는다.",
      "한 문장 안에 두 개 이상의 행동을 동시에 요구하지 않는다.",
    ],
  },
  responsive: {
    breakpoints: [],
    touchTargetMin: "44px",
    collapsingStrategy: "",
  },
  uxWriting: {
    toneLevel: 3,
    glossary: [
      { term: "프로젝트", avoid: "작업, 태스크", context: "사용자의 최상위 작업 단위" },
      { term: "팀원", avoid: "멤버, 사용자", context: "같은 워크스페이스 구성원" },
      { term: "저장됨", avoid: "저장 완료", context: "자동 저장 상태 표시" },
    ],
    errorMessageStyle: "friendly",
  },
  presetSelection: {
    references: ["브랜드 가이드", "기존 제품 문구"],
  },
};

export const designSystemTemplates: PhaseTemplate[] = [
  {
    id: "reference-based",
    name: "레퍼런스 기반 생성",
    description:
      "참고할 서비스/브랜드의 디자인을 분석해 디자인 시스템을 생성합니다.",
    promptTemplate: buildPromptTemplate({
      role: "레퍼런스 분석을 바탕으로 디자인 시스템 초안을 만드는 디자인 시스템 디자이너",
      objective:
        "레퍼런스의 장점을 추출하되 그대로 베끼지 말고, 우리 서비스의 분위기와 제품 목적에 맞는 디자인 시스템 초안을 만들어.",
      inputFields: [
        '참고 서비스: "{references}"',
        '서비스 이름: "{serviceName}"',
        '원하는 분위기: "{mood}"',
      ],
      outputRules: [
        'visualTheme.density는 "compact" | "comfortable" | "spacious" 중 하나만 사용해.',
        "designSystemSchema의 주요 섹션을 최대한 채우되, 정보가 없으면 빈 배열이나 빈 문자열을 유지해.",
        "colorPalette에는 역할(role)이 분명한 토큰 위주로 제안해.",
      ],
      exampleInput: [
        '참고 서비스: "토스, 리볼트"',
        '서비스 이름: "머니플랜"',
        '원하는 분위기: "깔끔하고 신뢰감 있는 핀테크"',
      ],
      exampleOutput: referenceBasedExample,
    }),
  },
  {
    id: "mood-to-tokens",
    name: "무드+컬러→토큰",
    description:
      "무드 키워드와 브랜드 컬러로부터 디자인 토큰을 생성합니다.",
    promptTemplate: buildPromptTemplate({
      role: "브랜드 무드에서 시각 토큰을 설계하는 UI 디자이너",
      objective:
        "무드 키워드와 브랜드 메인 컬러를 기반으로 색상, 타이포그래피, 레이아웃, 엘리베이션 토큰을 일관된 시스템으로 풀어내.",
      inputFields: [
        '무드 키워드: "{moodKeywords}"',
        '브랜드 메인 컬러: "{brandColor}"',
        '서비스 밀도: "{density}"',
      ],
      outputRules: [
        "색상 팔레트는 역할 중심으로 제안하고, 필요하면 oklch도 함께 적어.",
        "layout과 elevation까지 포함해 실제 UI에 바로 적용 가능한 수준으로 작성해.",
        "presetSelection에는 선택한 무드/컬러 방향이 드러나게 남겨도 돼.",
      ],
      exampleInput: [
        '무드 키워드: "따뜻함, 친근함, 커뮤니티, 대화형"',
        '브랜드 메인 컬러: "#F59E0B"',
        '서비스 밀도: "spacious"',
      ],
      exampleOutput: moodToTokensExample,
    }),
  },
  {
    id: "ux-writing-guide",
    name: "UX 라이팅 가이드",
    description:
      "서비스 톤앤매너와 UX 라이팅 규칙을 정의합니다.",
    promptTemplate: buildPromptTemplate({
      role: "제품 톤앤매너를 UX 라이팅 규칙으로 정리하는 콘텐츠 디자이너",
      objective:
        "브랜드 톤, 타겟 사용자, 에러 메시지 스타일을 바탕으로 용어 사전과 문구 원칙을 정리해. 핵심은 실제 UI 문장 작성에 바로 쓸 수 있는 기준을 만드는 것이다.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        '톤 레벨: "{tone}" (1은 매우 격식, 5는 매우 캐주얼)',
        '타겟 사용자: "{targetUsers}"',
        '에러 메시지 스타일: "{errorStyle}"',
      ],
      outputRules: [
        'uxWriting.toneLevel은 1 | 2 | 3 | 4 | 5 중 하나의 숫자를 사용해.',
        'uxWriting.errorMessageStyle은 "descriptive" | "concise" | "friendly" 중 하나만 사용해.',
        "guidelines.dos와 donts는 실제 버튼/토스트/에러 문구에 적용 가능한 문장으로 작성해.",
      ],
      exampleInput: [
        '서비스 이름: "워크보드"',
        '톤 레벨: "3"',
        '타겟 사용자: "협업 툴을 쓰는 스타트업 팀"',
        '에러 메시지 스타일: "friendly"',
      ],
      exampleOutput: uxWritingGuideExample,
    }),
  },
];
