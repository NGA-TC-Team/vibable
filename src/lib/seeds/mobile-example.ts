import { phaseDataSchema, createDefaultPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

export function generateMobileExample(workspaceId: string): SeededProject {
  const base = createDefaultPhaseData();

  const goalIds = [uid("goal"), uid("goal"), uid("goal")];
  const personaIds = [uid("p"), uid("p"), uid("p")];
  const featIds = [uid("fr"), uid("fr"), uid("fr"), uid("fr"), uid("fr")];
  const homeId = uid("pg");
  const logId = uid("pg");
  const insightId = uid("pg");
  const mateId = uid("pg");
  const settingsId = uid("pg");
  const userEnt = uid("ent");
  const moodEnt = uid("ent");
  const mateEnt = uid("ent");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "MoodMate",
      elevatorPitch:
        "하루 한 줄 감정 로그와 신뢰 짝꿍이 만나는, 가볍지만 진심인 멘탈 케어 앱.",
      background:
        "심리 상담은 접근성·비용 장벽이 크고, 일기 앱은 혼자 쓰다 멈춘다. MoodMate는 '가장 가까운 사람'과의 구조화된 공유로 기록의 지속성을 만든다.",
      coreValueProposition:
        "30초 로그 + 주간 패턴 인사이트 + 선택적 '짝꿍 공유'의 3박자.",
      businessGoals: [
        "출시 6개월 DAU 2만",
        "7일 연속 로그 유지율 25%",
        "페어링 완료율(초대 → 수락) 40%",
      ],
      targetUsers:
        "감정 관리·자기 이해에 관심 있지만 긴 일기에는 지친 20-30대 한국·일본 여성 우선",
      scope: {
        type: "mvp",
        details: "로그·패턴·페어링·주간 리포트. 전문가 매칭·음성 로그는 v2.",
      },
      competitors: [
        { id: uid("c"), name: "Daylio", url: "https://daylio.net", strength: "시장 선점", weakness: "페어링 없음" },
        { id: uid("c"), name: "Stoic", url: "https://getstoic.com", strength: "콘텐츠 풍부", weakness: "한국어 약함" },
        { id: uid("c"), name: "MyTherapy", url: "", strength: "의료 연계", weakness: "UX 무거움" },
      ],
      constraints: [
        "2인 풀스택 + 1 PM, 7개월 내 앱스토어 출시",
        "민감정보 — 원격 본문 암호화 필수",
        "iOS 17+, Android 12+ 타겟",
      ],
      successMetricGroups: [
        { id: uid("g"), parent: { id: uid("m"), metric: "활성화", target: "가입 7일 내 5회 로그", measurement: "Amplitude" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "페어링 완료율", target: "40%", measurement: "Funnel" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "D30 리텐션", target: "22%", measurement: "Cohort" }, children: [] },
      ],
      milestoneGroups: [
        { id: uid("g"), parent: { id: uid("m"), milestone: "알파 빌드", date: "2026-06-01", description: "로그·패턴" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "베타 TestFlight", date: "2026-08-20", description: "페어링 포함 300명" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "정식 출시", date: "2026-11-05", description: "iOS/Android 동시" }, children: [] },
      ],
      references: [
        { id: uid("ref"), title: "감정 라벨링 연구", url: "", notes: "UCLA 2007 Matthew Lieberman" },
        { id: uid("ref"), title: "Daylio 스토어 리뷰 분석", url: "", notes: "스크래핑 10k건" },
      ],
      techStack: "Expo (React Native) + Hermes, Supabase(Postgres + Realtime), OneSignal, Sentry",
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: personaIds[0], name: "홍지민", role: "주니어 디자이너",
          demographics: "25세, 서울",
          context: "야근 잦은 스타트업. 감정 기복이 커서 기록 욕구 있음",
          techProficiency: "중상급",
          behaviors: ["출근길 Twitter 공감 글 저장", "친한 친구 1명과 카톡으로 감정 공유"],
          motivations: ["패턴 파악", "가장 가까운 친구와 부담 없이 공유"],
          needs: ["30초 이내 기록", "주간 패턴 카드"],
          painPoints: ["일기는 3일 쓰고 포기", "카톡 공유는 맥락 없음"],
          frustrations: ["시간·텍스트 부담"],
          goals: ["매일 로그 4주 연속"],
          successCriteria: ["주간 리포트 3주 연속 열람"],
          quote: "감정을 기록하는 게 숙제 같지 않았으면 좋겠어요.",
        },
        {
          id: personaIds[1], name: "박태규", role: "대학원생",
          demographics: "27세, 대전",
          context: "학위 스트레스, 혼자 사는 환경",
          techProficiency: "중급",
          behaviors: ["Notion 일기 3주 도전 후 중단", "부모님께 가볍게 공유 원함"],
          motivations: ["부모와 거리 좁히기", "자기 상태 추적"],
          needs: ["공유 대상 한정", "상대방이 받는 알림 조절"],
          painPoints: ["프라이버시 우려"],
          frustrations: ["공유한 게 나중에 부담"],
          goals: ["일주일 2~3회 페어와 공유"],
          successCriteria: ["페어 유지 90일"],
          quote: "내가 오늘 어땠는지, 말하지 않아도 알려주고 싶어요.",
        },
        {
          id: personaIds[2], name: "김유나", role: "워킹맘",
          demographics: "34세, 경기",
          context: "6세 자녀 육아, 직장과 병행",
          techProficiency: "중급",
          behaviors: ["남편과 짝꿍 페어 원함", "수유시간 빈틈에 로그"],
          motivations: ["공동 육아 파트너십 강화"],
          needs: ["주간 커플 리포트"],
          painPoints: ["감정 대화가 어색"],
          frustrations: ["밤늦게 대화할 에너지 부족"],
          goals: ["주간 리포트로 대화 주제 얻기"],
          successCriteria: ["월 1회 대화 확장"],
          quote: "서로 보고 있으면 대화가 쉬워져요.",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: personaIds[0], asA: "디자이너", iWant: "30초 내 감정을 기록", soThat: "부담없이 매일 쓴다" },
        { id: uid("us"), personaId: personaIds[0], asA: "디자이너", iWant: "주간 패턴 카드를 본다", soThat: "나를 이해한다" },
        { id: uid("us"), personaId: personaIds[1], asA: "대학원생", iWant: "부모님을 짝꿍으로 초대", soThat: "말 없이도 전한다" },
        { id: uid("us"), personaId: personaIds[2], asA: "워킹맘", iWant: "남편과 공동 리포트", soThat: "대화 주제를 얻는다" },
        { id: uid("us"), personaId: personaIds[2], asA: "워킹맘", iWant: "알림 빈도를 조절", soThat: "부담을 줄인다" },
      ],
      successScenarios: [
        "아침 기상 직후 30초 로그 → 저녁 푸시로 '3일 연속 상승' 인사이트 수신",
        "금요일 저녁 커플 리포트 → 주말에 파트너와 15분 대화",
      ],
      failureScenarios: [
        "페어 초대 링크가 만료 → 재초대 1탭으로 복구",
        "오프라인 중 로그 → 로컬 큐에 저장, 연결 시 동기화",
      ],
    },
    requirements: {
      functional: [
        { id: featIds[0], title: "30초 감정 로그", description: "감정 5종·강도 슬라이더·태그·한 줄 메모", priority: "must", acceptanceCriteria: ["3 tap 이내 저장", "오프라인 저장"], statement: "핵심 여정 — 저장 마찰 제거", rationale: "지속성 KPI", source: "인터뷰", relatedGoalIds: [goalIds[0]] },
        { id: featIds[1], title: "주간 패턴 인사이트", description: "7일/28일 패턴 카드 생성", priority: "must", acceptanceCriteria: ["최근 7일 데이터 기반", "공유 가능 이미지"], statement: "자기 이해 제공", rationale: "차별점", source: "PM", relatedGoalIds: [goalIds[2]] },
        { id: featIds[2], title: "짝꿍 페어링", description: "1:1 신뢰 초대 + 공유 범위 설정", priority: "must", acceptanceCriteria: ["초대 링크 생성", "상대 수락 흐름"], statement: "바이럴 + 리텐션", rationale: "경쟁 우위", source: "PM", relatedGoalIds: [goalIds[1]] },
        { id: featIds[3], title: "커플 리포트", description: "주간 공동 리포트 (페어 동의 시)", priority: "should", acceptanceCriteria: ["양쪽 동의", "PDF 내보내기"], statement: "심층 사용", rationale: "고관여", source: "UX", relatedGoalIds: [goalIds[2]] },
        { id: featIds[4], title: "로그 리마인더", description: "커스텀 리마인더 시간·조용한 시간 제외", priority: "should", acceptanceCriteria: ["OneSignal 연동", "DND 준수"], statement: "지속성", rationale: "KPI", source: "PM", relatedGoalIds: [goalIds[0]] },
      ],
      nonFunctional: [
        { id: uid("n"), category: "performance", description: "앱 콜드 스타트 < 2s (iPhone 12 기준)" },
        { id: uid("n"), category: "security", description: "전송·저장 암호화, 페어 데이터 프라이빗 키 분리" },
        { id: uid("n"), category: "accessibility", description: "VoiceOver/TalkBack 완전 지원, Dynamic Type 대응" },
      ],
      constraints: [
        { id: uid("c"), category: "legal", description: "15세 미만 가입 불가 (국내 KISA 가이드)", source: "법무", impact: "연령 확인 필요" },
        { id: uid("c"), category: "budget", description: "Sentry, OneSignal 합계 월 $200 이하", source: "CTO", impact: "샘플링 30%" },
      ],
      glossary: [
        { id: uid("g"), term: "짝꿍", definition: "로그를 선택적으로 공유받는 1인", kind: "role", aliases: ["mate", "pair"] },
        { id: uid("g"), term: "패턴 카드", definition: "주간 인사이트 이미지 카드", kind: "entity", aliases: ["insight"] },
      ],
      clarifications: [
        { id: uid("cl"), question: "페어 그룹 공유 허용 여부", context: "가족 3인까지?", owner: "PM", status: "deferred", answer: "MVP는 1:1만", blocksRequirementIds: [] },
      ],
    },
    infoArchitecture: {
      sitemap: [
        { id: uid("sm"), label: "홈", path: "/", purpose: "오늘 로그 유도", screenType: "hub", primaryTask: "30초 로그", audience: [], primaryEntity: "MoodLog", children: [] },
        { id: uid("sm"), label: "로그", path: "/log", purpose: "감정 기록", screenType: "create", primaryTask: "저장", audience: [], primaryEntity: "MoodLog", children: [] },
        { id: uid("sm"), label: "인사이트", path: "/insight", purpose: "주간 패턴", screenType: "review", primaryTask: "공유·저장", audience: [], primaryEntity: "Insight", children: [] },
        { id: uid("sm"), label: "짝꿍", path: "/mate", purpose: "페어 관리", screenType: "list", primaryTask: "페어 조회·공유", audience: [], primaryEntity: "Mate", children: [] },
        { id: uid("sm"), label: "설정", path: "/settings", purpose: "알림·프라이버시", screenType: "settings", primaryTask: "조정", audience: [], primaryEntity: "User", children: [] },
      ],
      userFlows: [
        { id: uid("uf"), name: "기본 로그 흐름", goal: "30초 로그", primaryActor: "사용자", startScreenRef: "/", successEndings: ["저장"], failureEndings: [], steps: [
          { id: uid("st"), screenRef: "/", action: "Log 버튼 탭", intent: "submit", actor: "사용자", condition: "", outcome: "로그 화면", next: [] },
          { id: uid("st"), screenRef: "/log", action: "감정 선택·메모", intent: "input", actor: "사용자", condition: "", outcome: "저장", next: [] },
        ] },
        { id: uid("uf"), name: "짝꿍 초대", goal: "페어 생성", primaryActor: "사용자", startScreenRef: "/mate", successEndings: ["페어 수락"], failureEndings: ["링크 만료"], steps: [
          { id: uid("st"), screenRef: "/mate", action: "초대 링크 생성", intent: "submit", actor: "사용자", condition: "", outcome: "공유", next: [] },
          { id: uid("st"), screenRef: "/mate", action: "상대 수락", intent: "approve", actor: "짝꿍", condition: "24h", outcome: "연결", next: [] },
        ] },
      ],
      globalNavRules: [
        { id: uid("nr"), title: "하단 탭 4개 고정", rule: "홈/인사이트/짝꿍/설정", rationale: "기억 부담", severity: "info", appliesTo: { roles: [], screenTypes: [], paths: [] } },
        { id: uid("nr"), title: "로그는 플로팅 CTA", rule: "모든 화면에서 접근 가능", rationale: "마찰 제거", severity: "info", appliesTo: { roles: [], screenTypes: [], paths: [] } },
      ],
      roles: [
        { id: uid("r"), name: "Solo", description: "페어 없음" },
        { id: uid("r"), name: "Paired", description: "1:1 짝꿍 연결" },
      ],
      entities: [
        { id: uid("ie"), name: "MoodLog", description: "감정 로그", states: ["draft", "saved", "shared"] },
        { id: uid("ie"), name: "Mate", description: "짝꿍 관계", states: ["invited", "accepted", "paused"] },
      ],
    },
    screenDesign: {
      pages: [
        {
          id: homeId, name: "홈", route: "/", entityIds: [moodEnt],
          uxIntent: { userGoal: "오늘 감정 확인·기록", businessIntent: "일일 활성 유지" },
          states: { idle: "오늘 로그 카드 + 연속 기록", loading: "스켈레톤", offline: "로컬 큐 표시", errors: [{ type: "network", description: "동기화 실패 재시도" }] },
          interactions: [{ elementId: "fab-log", trigger: "탭", actionKind: "navigate /log" }],
          inPages: [], outPages: [logId, insightId],
        },
        {
          id: logId, name: "로그", route: "/log", entityIds: [moodEnt],
          uxIntent: { userGoal: "30초 기록", businessIntent: "마찰 최소" },
          states: { idle: "감정 5선택 + 슬라이더", loading: "저장 중", offline: "저장 대기", errors: [{ type: "validation", description: "감정 선택 필요" }] },
          interactions: [{ elementId: "btn-save", trigger: "탭", actionKind: "save-log" }],
          inPages: [homeId], outPages: [homeId],
        },
        {
          id: insightId, name: "인사이트", route: "/insight", entityIds: [],
          uxIntent: { userGoal: "주간 패턴 확인", businessIntent: "리텐션" },
          states: { idle: "카드 5개", loading: "생성 중", offline: "캐시 카드", errors: [{ type: "notFound", description: "데이터 부족 — 3일 더 필요" }] },
          interactions: [{ elementId: "btn-share-card", trigger: "탭", actionKind: "export-image" }],
          inPages: [homeId], outPages: [],
        },
        {
          id: mateId, name: "짝꿍", route: "/mate", entityIds: [mateEnt],
          uxIntent: { userGoal: "짝꿍 초대·관리", businessIntent: "바이럴" },
          states: { idle: "페어 상태 카드", loading: "초대 생성", offline: "읽기 전용", errors: [{ type: "permission", description: "초대 만료" }] },
          interactions: [{ elementId: "btn-invite", trigger: "탭", actionKind: "generate-link" }],
          inPages: [homeId], outPages: [],
        },
        {
          id: settingsId, name: "설정", route: "/settings", entityIds: [userEnt],
          uxIntent: { userGoal: "알림·프라이버시", businessIntent: "해지 방지" },
          states: { idle: "토글 목록", loading: "저장 중", offline: "읽기 전용", errors: [{ type: "validation", description: "시간 형식 오류" }] },
          interactions: [{ elementId: "toggle-dnd", trigger: "탭", actionKind: "toggle" }],
          inPages: [homeId], outPages: [],
        },
      ],
    },
    dataModel: {
      entities: [
        { id: userEnt, name: "User", fields: [
          { name: "id", type: "string", required: true, description: "" },
          { name: "nickname", type: "string", required: true, description: "" },
          { name: "birthYear", type: "number", required: true, description: "연령 확인" },
          { name: "timezone", type: "string", required: true, description: "" },
        ] },
        { id: moodEnt, name: "MoodLog", fields: [
          { name: "id", type: "string", required: true, description: "" },
          { name: "userId", type: "relation", required: true, description: "", relationTarget: "User", relationType: "1:N", onDelete: "cascade" },
          { name: "mood", type: "enum", required: true, description: "", enumValues: ["joy", "calm", "sad", "angry", "tired"] },
          { name: "intensity", type: "number", required: true, description: "1-5" },
          { name: "note", type: "string", required: false, description: "" },
          { name: "sharedWithMate", type: "boolean", required: true, description: "" },
          { name: "createdAt", type: "date", required: true, description: "" },
        ] },
        { id: mateEnt, name: "Mate", fields: [
          { name: "id", type: "string", required: true, description: "" },
          { name: "ownerId", type: "relation", required: true, description: "", relationTarget: "User", relationType: "1:1", onDelete: "cascade" },
          { name: "partnerId", type: "relation", required: true, description: "", relationTarget: "User", relationType: "1:1" },
          { name: "status", type: "enum", required: true, description: "", enumValues: ["invited", "accepted", "paused"] },
        ] },
      ],
      storageStrategy: "remote",
      storageNotes: "Supabase(Postgres + RLS). MoodLog 개별 행 Row-Level Policy — 소유자 + 짝꿍 sharedWithMate=true만.",
    },
    designSystem: {
      visualTheme: { mood: "따뜻·부드러운·곡선", density: "comfortable", philosophy: "손에 잡히는 감정의 온기를 둥근 형태와 중간 채도로 구현" },
      colorPalette: [
        { name: "Cream", hex: "#fff7ed", role: "background" },
        { name: "Tangerine", hex: "#f97316", role: "primary" },
        { name: "Moonlight", hex: "#e0e7ff", role: "surface" },
        { name: "Ink", hex: "#1e293b", role: "text" },
        { name: "Sorrow", hex: "#8b5cf6", role: "secondary" },
      ],
      typography: {
        fontFamilies: [
          { role: "display", family: "SUIT", fallback: "system-ui" },
          { role: "body", family: "Pretendard", fallback: "ui-sans-serif" },
        ],
        scale: [
          { name: "display", size: "28px", lineHeight: "1.2", weight: "700" },
          { name: "title", size: "20px", lineHeight: "1.35", weight: "600" },
          { name: "body", size: "15px", lineHeight: "1.5", weight: "400" },
          { name: "caption", size: "12px", lineHeight: "1.4", weight: "500" },
        ],
      },
      components: [
        { component: "Log FAB", category: "button", variants: "default/pressed", borderRadius: "999px", notes: "64px 원형, 플로팅", defaultStyle: { background: "#f97316", textColor: "#ffffff" } },
        { component: "Mood Selector", category: "custom", variants: "5 emoji", borderRadius: "24px", notes: "Haptic feedback" },
        { component: "Insight Card", category: "card", variants: "bright/calm/dark", borderRadius: "20px", notes: "이미지 내보내기 최적화" },
        { component: "Mate Bubble", category: "badge", variants: "online/offline/paused", borderRadius: "999px", notes: "아바타 + 상태점" },
        { component: "Tab Bar", category: "navigation", variants: "default", borderRadius: "0", notes: "Safe area 준수" },
      ],
      layout: { spacingScale: ["4px", "8px", "12px", "16px", "24px", "32px"], gridColumns: 4, maxContentWidth: "430px", whitespacePhilosophy: "한 화면 한 행위" },
      elevation: { shadows: [
        { level: "card", value: "0 2px 6px rgba(0,0,0,0.06)", usage: "카드" },
        { level: "fab", value: "0 8px 20px rgba(249,115,22,0.3)", usage: "FAB" },
      ], surfaceHierarchy: "배경 → 카드 → FAB" },
      guidelines: {
        dos: ["햅틱으로 감정 연결", "한 화면 최대 3개 액션"],
        donts: ["정보 과밀 금지", "우울·부정 강화 색 금지"],
      },
      responsive: { breakpoints: [
        { name: "sm", minWidth: "0" },
        { name: "md", minWidth: "600px" },
      ], touchTargetMin: "48px", collapsingStrategy: "태블릿은 2컬럼 레이아웃" },
      uxWriting: {
        toneLevel: 4,
        glossary: [
          { term: "짝꿍", avoid: "친구·파트너", context: "전역" },
          { term: "오늘의 나", avoid: "사용자", context: "홈" },
        ],
        errorMessageStyle: "friendly",
      },
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "MoodMate — 짝꿍 감정 로그",
    type: "mobile",
    phases,
    createdAtOffset: 30_000,
  });
}
