import { phaseDataSchema, createDefaultPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

export function generateWebExample(workspaceId: string): SeededProject {
  const base = createDefaultPhaseData();

  const goalIds = [uid("goal"), uid("goal"), uid("goal")];
  const personaIds = [uid("persona"), uid("persona"), uid("persona")];
  const featIds = [uid("fr"), uid("fr"), uid("fr"), uid("fr"), uid("fr")];
  const homePageId = uid("page");
  const listPageId = uid("page");
  const detailPageId = uid("page");
  const reviewPageId = uid("page");
  const settingsPageId = uid("page");
  const userEntityId = uid("ent");
  const bookmarkEntityId = uid("ent");
  const collectionEntityId = uid("ent");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "LoopMark",
      elevatorPitch:
        "읽고 싶은 글을 큐(queue)에 쌓으면, 매주 LoopMark가 다시 꺼내 읽게 해줍니다.",
      background:
        "북마크는 묻히고, 읽지 않은 링크는 쌓여만 간다. LoopMark는 '읽기 루프'를 설계해 저장한 글을 다시 만나게 한다.",
      coreValueProposition:
        "저장 → 분류 → 재노출 → 요약까지, 사용자는 큐에 던지기만 하면 된다.",
      businessGoals: [
        "MAU 10만 달성 (12개월)",
        "무료 → 유료 전환율 4% 이상",
        "월 평균 읽은 기사 8개/사용자",
      ],
      targetUsers:
        "뉴스·블로그·기술 아티클을 매일 탐색하지만 즐겨찾기만 쌓고 다시 읽지 않는 20-40대 지식 노동자",
      scope: {
        type: "mvp",
        details:
          "저장, 태그, 주간 재노출, 요약, 기본 검색까지. 소셜 공유·협업 보드는 v2에서.",
      },
      competitors: [
        { id: uid("comp"), name: "Pocket", url: "https://getpocket.com", strength: "강한 모바일 오프라인", weakness: "재노출 루프 없음" },
        { id: uid("comp"), name: "Readwise Reader", url: "https://readwise.io/read", strength: "하이라이트·노트", weakness: "가격 부담" },
        { id: uid("comp"), name: "Instapaper", url: "https://instapaper.com", strength: "리더 UI", weakness: "업데이트 정체" },
      ],
      constraints: [
        "정규 엔지니어 2명, 디자이너 1명 — 6개월 내 MVP",
        "GDPR·개인정보 — 본문 캐싱 시 사용자 계정 내 격리",
        "모바일 웹만 지원 (네이티브 앱은 v2)",
      ],
      successMetricGroups: [
        {
          id: uid("grp"),
          parent: { id: uid("metric"), metric: "활성화", target: "가입 후 7일 내 3건 이상 저장", measurement: "Mixpanel 퍼널" },
          children: [
            { id: uid("metric"), metric: "저장 속도", target: "클릭 → 저장 완료 < 3초", measurement: "Web Vitals 커스텀" },
          ],
        },
        {
          id: uid("grp"),
          parent: { id: uid("metric"), metric: "리텐션", target: "4주차 리텐션 35%", measurement: "Amplitude cohort" },
          children: [
            { id: uid("metric"), metric: "재노출 효과", target: "알림 클릭률 20%+", measurement: "푸시 리포트" },
          ],
        },
        {
          id: uid("grp"),
          parent: { id: uid("metric"), metric: "매출", target: "ARPU $2.5/월", measurement: "Stripe 대시보드" },
          children: [],
        },
      ],
      milestoneGroups: [
        {
          id: uid("grp"),
          parent: { id: uid("ms"), milestone: "프로토타입", date: "2026-05-15", description: "저장·재노출 핵심 흐름" },
          children: [
            { id: uid("ms"), milestone: "내부 드레스 리허설", date: "2026-05-30", description: "팀 10명 일주일 테스트" },
          ],
        },
        {
          id: uid("grp"),
          parent: { id: uid("ms"), milestone: "베타", date: "2026-07-31", description: "초대 기반 500명" },
          children: [],
        },
        {
          id: uid("grp"),
          parent: { id: uid("ms"), milestone: "정식 출시", date: "2026-10-15", description: "Product Hunt 런칭" },
          children: [],
        },
      ],
      references: [
        { id: uid("ref"), title: "Spaced repetition 논문", url: "https://ncase.me/remember/", notes: "재노출 간격 설계 근거" },
        { id: uid("ref"), title: "Readwise 아키텍처 포스팅", url: "https://blog.readwise.io/", notes: "요약 파이프라인 참고" },
      ],
      techStack: "Next.js 15 (App Router), Postgres + Prisma, Upstash Redis, Vercel, Claude Haiku 요약",
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: personaIds[0], name: "박서연", role: "시니어 백엔드 엔지니어",
          demographics: "33세, 서울, 핀테크 스타트업",
          context: "출퇴근 지하철에서 기술 아티클 탐색, 30개씩 탭으로 열어둠",
          techProficiency: "고급 — 터미널·키보드 중심",
          behaviors: ["RSS와 HN 병행 구독", "주말에 몰아서 읽으려다 포기"],
          motivations: ["깊이 있는 읽기로 성장", "팀에 좋은 자료 공유"],
          needs: ["흩어진 탭을 빠르게 쌓고 잊기", "잊은 뒤 다시 만나는 장치"],
          painPoints: ["즐겨찾기는 두 번 다시 안 봄", "Pocket에 넣어도 재노출 없음"],
          frustrations: ["주말 10개 중 2개만 읽고 포기"],
          goals: ["주 3회 이상 심도 있는 독서", "읽은 뒤 30초 요약 기록"],
          successCriteria: ["한 주 동안 4개 이상 완독", "팀 채널 공유 1건/주"],
          quote: "읽고 싶은 마음은 있는데, 다시 꺼내보는 계기가 없어요.",
        },
        {
          id: personaIds[1], name: "김도현", role: "마케팅 매니저",
          demographics: "28세, 판교, SaaS B2B",
          context: "트렌드 리포트·인사이트 글을 많이 소비, 노션에 정리",
          techProficiency: "중급 — 웹 중심",
          behaviors: ["트위터에서 좋은 글 즉시 저장", "기사 링크를 노션에 붙여넣기"],
          motivations: ["매주 발견한 인사이트를 요약해 팀 공유"],
          needs: ["정리 대신 자동 큐잉", "주간 다이제스트"],
          painPoints: ["노션 보드에 읽음/안읽음 상태 없음"],
          frustrations: ["지난 주 저장한 것이 기억 안 남"],
          goals: ["주 1회 팀 다이제스트 레터 발송"],
          successCriteria: ["팀 오픈율 60%+"],
          quote: "좋은 글을 '다시 만나게' 해주는 게 필요해요.",
        },
        {
          id: personaIds[2], name: "이루미", role: "UX 리서처 · 프리랜서",
          demographics: "36세, 제주",
          context: "리서치 자료 조사, 다양한 산업 글 광범위 수집",
          techProficiency: "중급",
          behaviors: ["iPad로 야간 리딩", "하이라이트와 인용 추출 필요"],
          motivations: ["리포트 인용 근거 확보"],
          needs: ["태그 기반 보관", "출처·저자 메타데이터"],
          painPoints: ["태그 없이 저장하면 다시 못 찾음"],
          frustrations: ["도구 간 복붙 반복"],
          goals: ["리포트에 각주 10건 근거 링크"],
          successCriteria: ["리서치 대비 2배 빠른 인용 추출"],
          quote: "태그와 출처가 곧 내 자산이에요.",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: personaIds[0], asA: "엔지니어", iWant: "탭을 한 번에 큐에 밀어 넣고", soThat: "주말에 다시 꺼내 읽을 수 있다" },
        { id: uid("us"), personaId: personaIds[0], asA: "엔지니어", iWant: "주간 재노출 알림을 받고", soThat: "묻힌 글을 다시 만난다" },
        { id: uid("us"), personaId: personaIds[1], asA: "마케터", iWant: "주간 다이제스트를 팀에 보내고", soThat: "인사이트를 공유한다" },
        { id: uid("us"), personaId: personaIds[2], asA: "리서처", iWant: "태그로 정리하고", soThat: "리포트 인용이 쉬워진다" },
        { id: uid("us"), personaId: personaIds[2], asA: "리서처", iWant: "원문 하이라이트를 저장하고", soThat: "근거 추출이 빨라진다" },
      ],
      successScenarios: [
        "월요일 출근길에 3개 저장 → 목요일 저녁 재노출 알림 → 2개 완독 + 요약 자동 저장",
        "금요일 주간 다이제스트 메일 도착 → 팀 채널로 1-click 공유",
      ],
      failureScenarios: [
        "크롬 확장 설치 실패 → 저장 경로가 북마클릿 폴백으로 전환되어도 성공률 90% 이상 유지",
        "요약 API 장애 시 원문만 보이지만 읽기 경험은 유지",
      ],
    },
    requirements: {
      functional: [
        { id: featIds[0], title: "원클릭 저장", description: "확장·북마클릿·공유 시트에서 한 번에 저장", priority: "must", acceptanceCriteria: ["3초 내 저장 성공 응답", "오프라인 큐잉 지원"], statement: "사용자는 어떤 환경에서도 한 번의 동작으로 저장할 수 있다", rationale: "저장 마찰이 핵심 KPI", source: "UX 인터뷰 12건", relatedGoalIds: [goalIds[0]] },
        { id: featIds[1], title: "주간 재노출", description: "저장 후 3·7·14일 간격으로 다시 읽기 알림", priority: "must", acceptanceCriteria: ["푸시·이메일 채널 선택", "스누즈 가능"], statement: "LoopMark는 사용자가 잊을 만할 때 다시 꺼낸다", rationale: "재노출이 핵심 차별점", source: "경쟁 분석", relatedGoalIds: [goalIds[1]] },
        { id: featIds[2], title: "태그 기반 분류", description: "자동 태그 제안 + 사용자 편집", priority: "should", acceptanceCriteria: ["최소 3개 추천", "수동 편집"], statement: "사용자는 저장 즉시 태그를 확인·편집할 수 있다", rationale: "리서처 페르소나 요구", source: "인터뷰 2건", relatedGoalIds: [goalIds[2]] },
        { id: featIds[3], title: "AI 요약", description: "저장 후 30초 요약 생성", priority: "should", acceptanceCriteria: ["3문장 요약", "실패 시 폴백"], statement: "요약이 없으면 재노출 가치 절반", rationale: "차별 기능", source: "프로덕트 디렉터", relatedGoalIds: [goalIds[0]] },
        { id: featIds[4], title: "팀 다이제스트", description: "주 1회 팀 요약 리포트", priority: "could", acceptanceCriteria: ["이메일 템플릿", "구독 제어"], statement: "마케터 페르소나가 공유로 확산", rationale: "바이럴 루프", source: "그로스 전략", relatedGoalIds: [goalIds[0]] },
      ],
      nonFunctional: [
        { id: uid("nfr"), category: "performance", description: "LCP < 2.5s, TTFB < 500ms (모바일 4G)" },
        { id: uid("nfr"), category: "accessibility", description: "WCAG 2.2 AA — 키보드·스크린리더 완전 지원" },
        { id: uid("nfr"), category: "offline", description: "저장 큐는 오프라인 시 IndexedDB 버퍼링" },
      ],
      constraints: [
        { id: uid("con"), category: "legal", description: "원문 본문은 사용자 계정 내에서만 캐시", source: "개인정보 담당", impact: "크로스 사용자 캐싱 금지" },
        { id: uid("con"), category: "budget", description: "Claude Haiku 월 $300 한도", source: "CFO", impact: "요약 스로틀링 필요" },
      ],
      glossary: [
        { id: uid("g"), term: "큐", definition: "재노출 대기 상태의 저장물", kind: "state", aliases: ["queue"] },
        { id: uid("g"), term: "재노출", definition: "저장 후 일정 간격으로 다시 표시되는 동작", kind: "term", aliases: ["resurfacing"] },
        { id: uid("g"), term: "다이제스트", definition: "주간 요약 이메일", kind: "term", aliases: [] },
      ],
      clarifications: [
        { id: uid("cl"), question: "유료 플랜 경계", context: "무료에서 몇 개까지 허용?", owner: "PM", status: "answered", answer: "무료 100개/월, Pro 무제한", blocksRequirementIds: [] },
      ],
    },
    infoArchitecture: {
      sitemap: [
        {
          id: uid("sm"), label: "홈 (Inbox)", path: "/", purpose: "가장 최근·예정 재노출", screenType: "hub", primaryTask: "읽기 큐 확인", audience: ["모든 사용자"], primaryEntity: "Bookmark",
          children: [
            { id: uid("sm"), label: "오늘", path: "/today", purpose: "오늘 재노출 대상", screenType: "list", primaryTask: "빠른 읽기", audience: [], primaryEntity: "Bookmark", children: [] },
          ],
        },
        {
          id: uid("sm"), label: "라이브러리", path: "/library", purpose: "전체 저장 목록 + 필터", screenType: "list", primaryTask: "검색·태그 탐색", audience: [], primaryEntity: "Bookmark",
          children: [
            { id: uid("sm"), label: "북마크 상세", path: "/library/[id]", purpose: "원문 뷰·하이라이트", screenType: "detail", primaryTask: "읽고 요약", audience: [], primaryEntity: "Bookmark", children: [] },
          ],
        },
        { id: uid("sm"), label: "컬렉션", path: "/collections", purpose: "태그·폴더", screenType: "list", primaryTask: "묶음 탐색", audience: [], primaryEntity: "Collection", children: [] },
        { id: uid("sm"), label: "다이제스트", path: "/digest", purpose: "주간 리포트", screenType: "review", primaryTask: "공유·내보내기", audience: ["마케터"], primaryEntity: "Digest", children: [] },
        { id: uid("sm"), label: "설정", path: "/settings", purpose: "알림·플랜", screenType: "settings", primaryTask: "구독 관리", audience: [], primaryEntity: "User", children: [] },
      ],
      userFlows: [
        {
          id: uid("uf"), name: "저장 → 재노출 → 완독", goal: "저장한 글을 실제로 읽게 한다", primaryActor: "일반 사용자", startScreenRef: "/",
          successEndings: ["읽음 처리 + 요약 저장"], failureEndings: ["스누즈 3회 이상"],
          steps: [
            { id: uid("st"), screenRef: "/", action: "확장에서 저장", intent: "submit", actor: "사용자", condition: "로그인", outcome: "큐에 추가됨", next: [] },
            { id: uid("st"), screenRef: "/today", action: "재노출 알림 탭", intent: "select", actor: "사용자", condition: "", outcome: "상세 진입", next: [] },
            { id: uid("st"), screenRef: "/library/[id]", action: "읽기·요약 작성", intent: "complete", actor: "사용자", condition: "", outcome: "완독", next: [] },
          ],
        },
        {
          id: uid("uf"), name: "주간 다이제스트 공유", goal: "팀에 인사이트 확산", primaryActor: "마케터", startScreenRef: "/digest",
          successEndings: ["Slack 공유 완료"], failureEndings: ["구독 해제"],
          steps: [
            { id: uid("st"), screenRef: "/digest", action: "다이제스트 열기", intent: "view", actor: "마케터", condition: "금요일", outcome: "5건 카드 표시", next: [] },
            { id: uid("st"), screenRef: "/digest", action: "Slack 공유 클릭", intent: "submit", actor: "마케터", condition: "", outcome: "링크 복사+OAuth", next: [] },
          ],
        },
      ],
      globalNavRules: [
        { id: uid("nr"), title: "큐 카운트는 Inbox 탭에만", rule: "다른 화면에 미읽음 뱃지를 복제하지 않는다", rationale: "노이즈 방지", severity: "info", appliesTo: { roles: [], screenTypes: ["hub"], paths: [] } },
        { id: uid("nr"), title: "설정은 모달 아닌 별도 라우트", rule: "딥링크·공유를 위해 별도 URL", rationale: "공유성", severity: "warning", appliesTo: { roles: [], screenTypes: ["settings"], paths: ["/settings"] } },
      ],
      roles: [
        { id: uid("r"), name: "Free", description: "월 100건 제한" },
        { id: uid("r"), name: "Pro", description: "무제한 + 팀 다이제스트" },
      ],
      entities: [
        { id: uid("ie"), name: "Bookmark", description: "저장된 글 단위", states: ["queued", "surfaced", "read", "archived"] },
        { id: uid("ie"), name: "Collection", description: "사용자 묶음", states: [] },
      ],
    },
    screenDesign: {
      pages: [
        {
          id: homePageId, name: "홈 (Inbox)", route: "/", entityIds: [bookmarkEntityId],
          uxIntent: { userGoal: "오늘 읽을 글을 본다", businessIntent: "재노출 성공률 상승" },
          states: { idle: "큐 카드 3~5개", loading: "스켈레톤 3행", offline: "오프라인 배너 + 로컬 큐 표시", errors: [{ type: "network", description: "불러오기 실패 — 재시도" }] },
          interactions: [
            { elementId: "card-bookmark", trigger: "탭", actionKind: "navigate /library/[id]" },
            { elementId: "btn-snooze", trigger: "스와이프-우", actionKind: "reschedule +3d" },
          ],
          inPages: [], outPages: [listPageId, detailPageId],
        },
        {
          id: listPageId, name: "라이브러리", route: "/library", entityIds: [bookmarkEntityId, collectionEntityId],
          uxIntent: { userGoal: "저장물 탐색", businessIntent: "검색 만족도" },
          states: { idle: "그리드 20개", loading: "페이드-인", offline: "캐시된 결과", errors: [{ type: "validation", description: "검색어 너무 짧음" }] },
          interactions: [{ elementId: "search", trigger: "입력", actionKind: "filter-live" }],
          inPages: [homePageId], outPages: [detailPageId],
        },
        {
          id: detailPageId, name: "북마크 상세", route: "/library/[id]", entityIds: [bookmarkEntityId],
          uxIntent: { userGoal: "읽고 요약", businessIntent: "완독 전환" },
          states: { idle: "본문 + 요약 카드", loading: "본문 스트리밍", offline: "캐시 본문만", errors: [{ type: "notFound", description: "원문 삭제됨" }] },
          interactions: [{ elementId: "btn-mark-read", trigger: "클릭", actionKind: "mark-read" }],
          inPages: [homePageId, listPageId], outPages: [reviewPageId],
        },
        {
          id: reviewPageId, name: "다이제스트", route: "/digest", entityIds: [bookmarkEntityId],
          uxIntent: { userGoal: "주간 회고·공유", businessIntent: "바이럴" },
          states: { idle: "5개 카드 선정", loading: "생성 중", offline: "마지막 다이제스트", errors: [{ type: "permission", description: "Pro 필요" }] },
          interactions: [{ elementId: "btn-share-slack", trigger: "클릭", actionKind: "oauth-share" }],
          inPages: [homePageId], outPages: [],
        },
        {
          id: settingsPageId, name: "설정", route: "/settings", entityIds: [],
          uxIntent: { userGoal: "알림·플랜 관리", businessIntent: "해지 방지" },
          states: { idle: "섹션 리스트", loading: "폼 저장 중", offline: "읽기 전용", errors: [{ type: "validation", description: "이메일 형식 오류" }] },
          interactions: [{ elementId: "toggle-digest", trigger: "클릭", actionKind: "toggle-setting" }],
          inPages: [homePageId], outPages: [],
        },
      ],
    },
    dataModel: {
      entities: [
        {
          id: userEntityId, name: "User",
          fields: [
            { name: "id", type: "string", required: true, description: "ULID" },
            { name: "email", type: "string", required: true, description: "" },
            { name: "plan", type: "enum", required: true, description: "구독 플랜", enumValues: ["free", "pro"] },
            { name: "createdAt", type: "date", required: true, description: "" },
          ],
        },
        {
          id: bookmarkEntityId, name: "Bookmark",
          fields: [
            { name: "id", type: "string", required: true, description: "" },
            { name: "userId", type: "relation", required: true, description: "소유자", relationTarget: "User", relationType: "N:M", onDelete: "cascade" },
            { name: "url", type: "string", required: true, description: "" },
            { name: "title", type: "string", required: true, description: "" },
            { name: "status", type: "enum", required: true, description: "", enumValues: ["queued", "surfaced", "read", "archived"] },
            { name: "surfaceAt", type: "date", required: false, description: "다음 재노출 시각" },
            { name: "summary", type: "string", required: false, description: "AI 요약" },
          ],
        },
        {
          id: collectionEntityId, name: "Collection",
          fields: [
            { name: "id", type: "string", required: true, description: "" },
            { name: "name", type: "string", required: true, description: "" },
            { name: "ownerId", type: "relation", required: true, description: "", relationTarget: "User", relationType: "1:N", onDelete: "cascade" },
          ],
        },
      ],
      storageStrategy: "remote",
      storageNotes: "Postgres 14 + Prisma. 원문 본문은 S3 (SSE-KMS, 사용자 계정 키).",
    },
    designSystem: {
      visualTheme: { mood: "집중·차분·따뜻함", density: "comfortable", philosophy: "읽기 방해 최소화. 배경은 아이보리, 포인트는 잉크블루." },
      colorPalette: [
        { name: "Ink", hex: "#0f172a", role: "primary-text" },
        { name: "Ivory", hex: "#fafaf4", role: "background" },
        { name: "Amber", hex: "#f59e0b", role: "accent" },
        { name: "Clay", hex: "#7c2d12", role: "danger" },
        { name: "Moss", hex: "#365314", role: "success" },
      ],
      typography: {
        fontFamilies: [
          { role: "display", family: "Pretendard Variable", fallback: "system-ui, sans-serif" },
          { role: "body", family: "Inter", fallback: "ui-sans-serif" },
          { role: "mono", family: "JetBrains Mono", fallback: "ui-monospace" },
        ],
        scale: [
          { name: "display", size: "32px", lineHeight: "1.15", weight: "700" },
          { name: "title", size: "22px", lineHeight: "1.3", weight: "600" },
          { name: "body", size: "16px", lineHeight: "1.65", weight: "400" },
          { name: "caption", size: "13px", lineHeight: "1.5", weight: "500" },
        ],
      },
      components: [
        { component: "Primary Button", category: "button", variants: "solid/outline/ghost", borderRadius: "12px", notes: "44px min height", defaultStyle: { background: "#0f172a", textColor: "#fafaf4", padding: "10px 18px" }, hoverStyle: { background: "#1e293b" } },
        { component: "Bookmark Card", category: "card", variants: "queued/surfaced/read", borderRadius: "16px", notes: "호버 시 1dp 상승", defaultStyle: { background: "#ffffff", borderColor: "#e7e5e0", padding: "16px" } },
        { component: "Tag Chip", category: "badge", variants: "solid/outline", borderRadius: "999px", notes: "태그 최대 3개 노출" },
        { component: "Search Input", category: "input", variants: "default/focused", borderRadius: "10px", notes: "Cmd+K 바인딩" },
        { component: "Nav Sidebar", category: "navigation", variants: "expanded/collapsed", borderRadius: "0", notes: "280px / 72px" },
      ],
      layout: { spacingScale: ["2px", "4px", "8px", "12px", "16px", "24px", "32px", "48px"], gridColumns: 12, maxContentWidth: "1280px", whitespacePhilosophy: "읽기 영역은 720px 제한, 주변 여백으로 집중" },
      elevation: { shadows: [
        { level: "sm", value: "0 1px 2px rgba(15,23,42,0.06)", usage: "카드" },
        { level: "md", value: "0 4px 10px rgba(15,23,42,0.08)", usage: "호버" },
        { level: "lg", value: "0 10px 30px rgba(15,23,42,0.12)", usage: "모달" },
      ], surfaceHierarchy: "배경 → 카드 → 모달 3단계" },
      guidelines: {
        dos: ["한 화면 한 작업", "여백으로 계층 표현", "읽기 중에는 알림 억제"],
        donts: ["뱃지 남발 금지", "모달 안 모달 금지", "자동 재생 영상 금지"],
      },
      responsive: { breakpoints: [
        { name: "sm", minWidth: "0" },
        { name: "md", minWidth: "768px" },
        { name: "lg", minWidth: "1280px" },
      ], touchTargetMin: "44px", collapsingStrategy: "사이드바는 md 이하에서 하단 탭으로 전환" },
      uxWriting: {
        toneLevel: 3,
        glossary: [
          { term: "큐", avoid: "대기열", context: "사용자 화면 전반" },
          { term: "재노출", avoid: "알림 반복", context: "푸시·메일" },
        ],
        errorMessageStyle: "friendly",
      },
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "LoopMark — 읽기 큐 웹앱",
    type: "web",
    phases,
    createdAtOffset: 0,
  });
}
