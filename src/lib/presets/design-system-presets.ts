import type { ColorToken, ComponentStyle } from "@/types/phases";

export interface DesignSystemPreset {
  id: string;
  name: string;
  category: string;
  description: string;
  visualTheme: {
    mood: string;
    density: "compact" | "comfortable" | "spacious";
    philosophy: string;
  };
  colorPalette: ColorToken[];
  typography: {
    fontFamilies: { role: string; family: string; fallback: string }[];
  };
  components?: ComponentStyle[];
}

export const PRESET_CATEGORIES = [
  "AI & LLM",
  "개발자 도구",
  "백엔드·DevOps",
  "생산성·SaaS",
  "디자인 도구",
  "핀테크",
  "미디어·소비자",
] as const;

export const designSystemPresets: DesignSystemPreset[] = [
  // ── AI & LLM ──
  {
    id: "claude",
    name: "Claude",
    category: "AI & LLM",
    description: "Anthropic의 AI 어시스턴트. 따뜻한 테라코타 악센트와 깔끔한 타이포",
    visualTheme: {
      mood: "Warm, thoughtful, trustworthy",
      density: "comfortable",
      philosophy: "인간 중심의 AI 인터페이스. 과도한 장식 없이 대화에 집중",
    },
    colorPalette: [
      { name: "Primary", hex: "#D97757", role: "CTA, 브랜드 악센트" },
      { name: "Background", hex: "#FAF5F0", role: "페이지 배경" },
      { name: "Surface", hex: "#FFFFFF", role: "대화 영역" },
      { name: "Text", hex: "#1A1A1A", role: "본문 텍스트" },
      { name: "Secondary", hex: "#E8DFD5", role: "보조 영역" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Söhne", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "Söhne Mono", fallback: "monospace" },
      ],
    },
  },
  {
    id: "mistral",
    name: "Mistral AI",
    category: "AI & LLM",
    description: "프랑스 발 오픈소스 LLM. 비비드 오렌지와 다크 배경",
    visualTheme: {
      mood: "Bold, innovative, technical",
      density: "compact",
      philosophy: "기술적 신뢰성과 혁신성을 색채와 밀도로 표현",
    },
    colorPalette: [
      { name: "Primary", hex: "#FF7000", role: "CTA, 브랜드" },
      { name: "Background", hex: "#0D0D0D", role: "다크 배경" },
      { name: "Surface", hex: "#1A1A2E", role: "카드, 패널" },
      { name: "Text", hex: "#F5F5F5", role: "본문" },
      { name: "Accent", hex: "#FF9A3C", role: "보조 악센트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "JetBrains Mono", fallback: "monospace" },
      ],
    },
  },
  {
    id: "xai",
    name: "xAI (Grok)",
    category: "AI & LLM",
    description: "Elon Musk의 AI. 미니멀 모노크롬과 기하학적 디자인",
    visualTheme: {
      mood: "Futuristic, minimal, monochrome",
      density: "spacious",
      philosophy: "극도의 미니멀리즘으로 콘텐츠 자체에 집중",
    },
    colorPalette: [
      { name: "Primary", hex: "#FFFFFF", role: "CTA" },
      { name: "Background", hex: "#000000", role: "배경" },
      { name: "Surface", hex: "#111111", role: "카드" },
      { name: "Text", hex: "#EEEEEE", role: "본문" },
      { name: "Muted", hex: "#666666", role: "보조 텍스트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  {
    id: "ollama",
    name: "Ollama",
    category: "AI & LLM",
    description: "로컬 LLM 런타임. 친근한 화이트와 블랙의 심플 조합",
    visualTheme: {
      mood: "Approachable, developer-friendly, clean",
      density: "comfortable",
      philosophy: "복잡한 AI 기술을 쉽게 접근할 수 있도록 단순화",
    },
    colorPalette: [
      { name: "Primary", hex: "#000000", role: "CTA" },
      { name: "Background", hex: "#FFFFFF", role: "배경" },
      { name: "Surface", hex: "#F7F7F7", role: "카드" },
      { name: "Text", hex: "#1A1A1A", role: "본문" },
      { name: "Border", hex: "#E5E5E5", role: "경계선" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  // ── 개발자 도구 ──
  {
    id: "cursor",
    name: "Cursor",
    category: "개발자 도구",
    description: "AI 코드 에디터. 다크 퍼플 그라디언트와 네온 악센트",
    visualTheme: {
      mood: "Technical, modern, AI-native",
      density: "compact",
      philosophy: "코드와 AI의 경계를 허무는 직관적 인터페이스",
    },
    colorPalette: [
      { name: "Primary", hex: "#7B61FF", role: "CTA, 악센트" },
      { name: "Background", hex: "#0E0E10", role: "에디터 배경" },
      { name: "Surface", hex: "#1C1C1E", role: "사이드바" },
      { name: "Text", hex: "#E4E4E7", role: "본문" },
      { name: "Accent", hex: "#22D3EE", role: "AI 응답 하이라이트" },
    ],
    typography: {
      fontFamilies: [
        { role: "UI", family: "Inter", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "JetBrains Mono", fallback: "monospace" },
      ],
    },
  },
  {
    id: "vercel",
    name: "Vercel",
    category: "개발자 도구",
    description: "프론트엔드 클라우드. 극도의 모노크롬 미니멀",
    visualTheme: {
      mood: "Precise, minimal, developer-first",
      density: "spacious",
      philosophy: "검정과 흰의 극단적 대비로 명확한 위계 구축",
    },
    colorPalette: [
      { name: "Primary", hex: "#000000", role: "CTA" },
      { name: "Background", hex: "#FAFAFA", role: "배경" },
      { name: "Surface", hex: "#FFFFFF", role: "카드" },
      { name: "Text", hex: "#171717", role: "본문" },
      { name: "Blue", hex: "#0070F3", role: "링크, 액션" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Geist", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "Geist Mono", fallback: "monospace" },
      ],
    },
    components: [
      {
        component: "Button",
        category: "button",
        variants: "primary, secondary, ghost",
        borderRadius: "6px",
        defaultStyle: {
          background: "#000000",
          textColor: "#ffffff",
          padding: "8px 16px",
          fontSize: "14px",
          fontWeight: "500",
        },
        hoverStyle: { background: "#333333" },
      },
      {
        component: "Card",
        category: "card",
        variants: "default, bordered",
        borderRadius: "8px",
        defaultStyle: {
          background: "#ffffff",
          borderColor: "#eaeaea",
          padding: "16px",
        },
      },
    ],
  },
  {
    id: "expo",
    name: "Expo",
    category: "개발자 도구",
    description: "React Native 플랫폼. 다크 블루와 밝은 청색 악센트",
    visualTheme: {
      mood: "Developer-friendly, mobile-first, approachable",
      density: "comfortable",
      philosophy: "모바일 개발의 복잡성을 줄이는 친근한 인터페이스",
    },
    colorPalette: [
      { name: "Primary", hex: "#4630EB", role: "브랜드, CTA" },
      { name: "Background", hex: "#0A0A23", role: "다크 배경" },
      { name: "Surface", hex: "#131337", role: "카드" },
      { name: "Text", hex: "#F1F1F1", role: "본문" },
      { name: "Accent", hex: "#61DAFB", role: "React 악센트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  {
    id: "raycast",
    name: "Raycast",
    category: "개발자 도구",
    description: "맥 생산성 런처. 그라디언트 브랜딩과 글래스모피즘",
    visualTheme: {
      mood: "Polished, fast, premium",
      density: "compact",
      philosophy: "속도와 아름다움의 조화. 반투명 레이어 활용",
    },
    colorPalette: [
      { name: "Primary", hex: "#FF6363", role: "CTA, 브랜드" },
      { name: "Background", hex: "#1A1A2E", role: "배경" },
      { name: "Surface", hex: "#16213E", role: "패널" },
      { name: "Text", hex: "#E4E4E7", role: "본문" },
      { name: "Gradient", hex: "#FF6363", role: "그라디언트 시작" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  // ── 백엔드·DevOps ──
  {
    id: "supabase",
    name: "Supabase",
    category: "백엔드·DevOps",
    description: "오픈소스 Firebase 대안. 에메랄드 그린 브랜딩",
    visualTheme: {
      mood: "Open, developer-centric, growth",
      density: "comfortable",
      philosophy: "오픈소스 정신을 반영한 투명하고 성장 지향적 디자인",
    },
    colorPalette: [
      { name: "Primary", hex: "#3ECF8E", role: "CTA, 브랜드" },
      { name: "Background", hex: "#1C1C1C", role: "다크 배경" },
      { name: "Surface", hex: "#2A2A2A", role: "카드" },
      { name: "Text", hex: "#EDEDED", role: "본문" },
      { name: "Accent", hex: "#6EE7B7", role: "성공, 양수" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "Source Code Pro", fallback: "monospace" },
      ],
    },
  },
  {
    id: "sentry",
    name: "Sentry",
    category: "백엔드·DevOps",
    description: "에러 모니터링. 딥 퍼플과 핑크 그라디언트",
    visualTheme: {
      mood: "Alert, reliable, data-driven",
      density: "compact",
      philosophy: "에러와 성능 데이터를 명확하게 전달하는 정보 밀도 높은 UI",
    },
    colorPalette: [
      { name: "Primary", hex: "#362D59", role: "브랜드" },
      { name: "Background", hex: "#1B1034", role: "다크 배경" },
      { name: "Surface", hex: "#2B1D4E", role: "카드" },
      { name: "Text", hex: "#E1DBF0", role: "본문" },
      { name: "Error", hex: "#F55459", role: "에러 표시" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Rubik", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  {
    id: "posthog",
    name: "PostHog",
    category: "백엔드·DevOps",
    description: "오픈소스 제품 분석. 밝은 옐로와 장난스러운 일러스트",
    visualTheme: {
      mood: "Playful, transparent, data-informed",
      density: "comfortable",
      philosophy: "분석을 재미있게. 과학적 엄밀함과 친근함의 균형",
    },
    colorPalette: [
      { name: "Primary", hex: "#F9BD2B", role: "CTA, 브랜드" },
      { name: "Background", hex: "#EEEFE9", role: "배경" },
      { name: "Surface", hex: "#FFFFFF", role: "카드" },
      { name: "Text", hex: "#151515", role: "본문" },
      { name: "Blue", hex: "#1D4AFF", role: "차트, 데이터" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Manrope", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  // ── 생산성·SaaS ──
  {
    id: "linear",
    name: "Linear",
    category: "생산성·SaaS",
    description: "이슈 트래커. 다크 UI에 바이올렛 그라디언트",
    visualTheme: {
      mood: "Precise, fast, opinionated",
      density: "compact",
      philosophy: "모든 인터랙션을 60fps로. 소프트웨어 장인정신",
    },
    colorPalette: [
      { name: "Primary", hex: "#5E6AD2", role: "브랜드, 링크" },
      { name: "Background", hex: "#0F0F14", role: "다크 배경" },
      { name: "Surface", hex: "#1B1B25", role: "사이드바" },
      { name: "Text", hex: "#EEEEF0", role: "본문" },
      { name: "Purple", hex: "#8B5CF6", role: "보조 악센트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
    components: [
      {
        component: "Button",
        category: "button",
        variants: "primary, secondary, ghost",
        borderRadius: "6px",
        defaultStyle: {
          background: "#5E6AD2",
          textColor: "#ffffff",
          padding: "6px 12px",
          fontSize: "13px",
          fontWeight: "500",
        },
        hoverStyle: { background: "#4e5bc0" },
      },
      {
        component: "Badge",
        category: "badge",
        variants: "default, status, priority",
        borderRadius: "4px",
        defaultStyle: {
          background: "#1B1B25",
          textColor: "#EEEEF0",
          padding: "2px 8px",
          fontSize: "11px",
        },
      },
    ],
  },
  {
    id: "notion",
    name: "Notion",
    category: "생산성·SaaS",
    description: "올인원 워크스페이스. 밝고 깨끗한 미니멀 디자인",
    visualTheme: {
      mood: "Clean, versatile, content-first",
      density: "spacious",
      philosophy: "콘텐츠가 주인공. UI는 뒤로 물러나 도구 역할에 충실",
    },
    colorPalette: [
      { name: "Primary", hex: "#000000", role: "텍스트, CTA" },
      { name: "Background", hex: "#FFFFFF", role: "배경" },
      { name: "Surface", hex: "#F7F6F3", role: "사이드바" },
      { name: "Text", hex: "#37352F", role: "본문" },
      { name: "Blue", hex: "#2383E2", role: "링크" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
        { role: "세리프", family: "Georgia", fallback: "serif" },
      ],
    },
  },
  {
    id: "resend",
    name: "Resend",
    category: "생산성·SaaS",
    description: "이메일 API. 블랙·화이트에 그린 악센트",
    visualTheme: {
      mood: "Developer-focused, clean, modern",
      density: "spacious",
      philosophy: "이메일 인프라의 복잡성을 단순한 API와 깔끔한 UI로 해소",
    },
    colorPalette: [
      { name: "Primary", hex: "#000000", role: "CTA" },
      { name: "Background", hex: "#FFFFFF", role: "배경" },
      { name: "Surface", hex: "#FAFAFA", role: "카드" },
      { name: "Text", hex: "#0A0A0A", role: "본문" },
      { name: "Accent", hex: "#00C16A", role: "성공, 전송 완료" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  {
    id: "cal",
    name: "Cal.com",
    category: "생산성·SaaS",
    description: "오픈소스 스케줄링. 다크 모드 우선의 깔끔한 UI",
    visualTheme: {
      mood: "Efficient, open, structured",
      density: "comfortable",
      philosophy: "시간을 효율적으로 관리하는 직관적 캘린더 경험",
    },
    colorPalette: [
      { name: "Primary", hex: "#111827", role: "CTA" },
      { name: "Background", hex: "#F9FAFB", role: "배경" },
      { name: "Surface", hex: "#FFFFFF", role: "카드" },
      { name: "Text", hex: "#111827", role: "본문" },
      { name: "Brand", hex: "#292929", role: "브랜드" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  // ── 디자인 도구 ──
  {
    id: "figma",
    name: "Figma",
    category: "디자인 도구",
    description: "협업 디자인 툴. 멀티컬러 브랜딩과 화이트 캔버스",
    visualTheme: {
      mood: "Creative, collaborative, playful",
      density: "comfortable",
      philosophy: "캔버스 중심. UI 크롬은 최소화하고 창작 공간 극대화",
    },
    colorPalette: [
      { name: "Primary", hex: "#0D99FF", role: "선택, 인터랙션" },
      { name: "Background", hex: "#2C2C2C", role: "캔버스 외곽" },
      { name: "Surface", hex: "#FFFFFF", role: "캔버스" },
      { name: "Text", hex: "#1E1E1E", role: "본문" },
      { name: "Green", hex: "#0FA958", role: "성공, 온라인" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  {
    id: "framer",
    name: "Framer",
    category: "디자인 도구",
    description: "노코드 웹사이트 빌더. 다크 UI에 블루 악센트",
    visualTheme: {
      mood: "Dynamic, modern, creative",
      density: "compact",
      philosophy: "모션과 인터랙션이 핵심. 정적인 것은 없다",
    },
    colorPalette: [
      { name: "Primary", hex: "#0099FF", role: "CTA, 브랜드" },
      { name: "Background", hex: "#0D0D0D", role: "다크 배경" },
      { name: "Surface", hex: "#1A1A1A", role: "패널" },
      { name: "Text", hex: "#FFFFFF", role: "본문" },
      { name: "Gradient", hex: "#7B2FFF", role: "그라디언트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  // ── 핀테크 ──
  {
    id: "stripe",
    name: "Stripe",
    category: "핀테크",
    description: "결제 인프라. 인디고~퍼플 그라디언트와 프리미엄 UI",
    visualTheme: {
      mood: "Premium, trustworthy, refined",
      density: "spacious",
      philosophy: "금융 인프라에 어울리는 신뢰감과 세련미. 정보 위계가 명확",
    },
    colorPalette: [
      { name: "Primary", hex: "#635BFF", role: "CTA, 브랜드" },
      { name: "Background", hex: "#F6F9FC", role: "배경" },
      { name: "Surface", hex: "#FFFFFF", role: "카드" },
      { name: "Text", hex: "#0A2540", role: "본문" },
      { name: "Cyan", hex: "#00D4AA", role: "성공, 양수" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "Source Code Pro", fallback: "monospace" },
      ],
    },
    components: [
      {
        component: "Button",
        category: "button",
        variants: "primary purple, ghost/outlined, transparent info",
        borderRadius: "4px",
        defaultStyle: {
          background: "#635BFF",
          textColor: "#ffffff",
          padding: "8px 16px",
          fontSize: "16px",
          fontWeight: "400",
        },
        hoverStyle: { background: "#4434d4" },
      },
      {
        component: "Card",
        category: "card",
        variants: "standard, featured",
        borderRadius: "5px",
        defaultStyle: {
          background: "#ffffff",
          borderColor: "#e5edf5",
          shadow: "rgba(50,50,93,0.25) 0px 30px 45px -30px",
          padding: "16px",
        },
      },
      {
        component: "Input",
        category: "input",
        variants: "default, focus (purple ring), error",
        borderRadius: "4px",
        defaultStyle: {
          background: "#ffffff",
          textColor: "#0A2540",
          borderColor: "#e5edf5",
          padding: "8px 12px",
        },
      },
    ],
  },
  {
    id: "coinbase",
    name: "Coinbase",
    category: "핀테크",
    description: "암호화폐 거래소. 블루 브랜드와 깔끔한 금융 UI",
    visualTheme: {
      mood: "Trustworthy, secure, accessible",
      density: "comfortable",
      philosophy: "복잡한 암호화폐를 누구나 이해할 수 있는 단순한 인터페이스",
    },
    colorPalette: [
      { name: "Primary", hex: "#0052FF", role: "CTA, 브랜드" },
      { name: "Background", hex: "#FFFFFF", role: "배경" },
      { name: "Surface", hex: "#F5F8FF", role: "카드" },
      { name: "Text", hex: "#050F1A", role: "본문" },
      { name: "Success", hex: "#05B169", role: "상승, 성공" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  // ── 미디어·소비자 ──
  {
    id: "apple",
    name: "Apple",
    category: "미디어·소비자",
    description: "하드웨어·소프트웨어 에코시스템. SF Pro와 극단적 여백",
    visualTheme: {
      mood: "Refined, minimal, premium",
      density: "spacious",
      philosophy: "빼기의 미학. 보이지 않는 디테일에 장인정신을",
    },
    colorPalette: [
      { name: "Primary", hex: "#0071E3", role: "CTA, 링크" },
      { name: "Background", hex: "#FFFFFF", role: "배경" },
      { name: "Surface", hex: "#FBFBFD", role: "섹션 배경" },
      { name: "Text", hex: "#1D1D1F", role: "본문" },
      { name: "Gray", hex: "#86868B", role: "보조 텍스트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "SF Pro Display", fallback: "system-ui, sans-serif" },
        { role: "코드", family: "SF Mono", fallback: "monospace" },
      ],
    },
  },
  {
    id: "spotify",
    name: "Spotify",
    category: "미디어·소비자",
    description: "음악 스트리밍. 그린 브랜드와 다크 UI",
    visualTheme: {
      mood: "Energetic, immersive, vibrant",
      density: "comfortable",
      philosophy: "음악에 몰입할 수 있도록 다크 배경 위에 컬러풀한 앨범 아트",
    },
    colorPalette: [
      { name: "Primary", hex: "#1DB954", role: "CTA, 브랜드" },
      { name: "Background", hex: "#121212", role: "배경" },
      { name: "Surface", hex: "#282828", role: "카드" },
      { name: "Text", hex: "#FFFFFF", role: "본문" },
      { name: "Muted", hex: "#B3B3B3", role: "보조 텍스트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Circular", fallback: "Helvetica, Arial, sans-serif" },
      ],
    },
  },
  {
    id: "shopify",
    name: "Shopify",
    category: "미디어·소비자",
    description: "이커머스 플랫폼. 그린 브랜드와 머천트 친화 UI",
    visualTheme: {
      mood: "Empowering, commerce-ready, accessible",
      density: "comfortable",
      philosophy: "판매자가 제품에 집중할 수 있도록 관리 도구는 최대한 직관적으로",
    },
    colorPalette: [
      { name: "Primary", hex: "#008060", role: "CTA, 브랜드" },
      { name: "Background", hex: "#F6F6F7", role: "관리자 배경" },
      { name: "Surface", hex: "#FFFFFF", role: "카드" },
      { name: "Text", hex: "#202223", role: "본문" },
      { name: "Interactive", hex: "#2C6ECB", role: "인터랙티브 요소" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Inter", fallback: "system-ui, sans-serif" },
      ],
    },
  },
  {
    id: "nike",
    name: "Nike",
    category: "미디어·소비자",
    description: "스포츠 브랜드. 강렬한 블랙·화이트와 볼드 타이포",
    visualTheme: {
      mood: "Bold, athletic, high-contrast",
      density: "spacious",
      philosophy: "임팩트 있는 시각 언어. 큰 이미지, 두꺼운 타이포, 강한 대비",
    },
    colorPalette: [
      { name: "Primary", hex: "#111111", role: "CTA" },
      { name: "Background", hex: "#FFFFFF", role: "배경" },
      { name: "Surface", hex: "#F5F5F5", role: "섹션" },
      { name: "Text", hex: "#111111", role: "본문" },
      { name: "Orange", hex: "#FA5400", role: "에너지 악센트" },
    ],
    typography: {
      fontFamilies: [
        { role: "본문", family: "Helvetica Neue", fallback: "Helvetica, Arial, sans-serif" },
      ],
    },
  },
];
