import { phaseDataSchema, createAgentProjectPhaseData } from "@/lib/schemas/phase-data";
import { buildSeededProject, uid, type SeededProject } from "./helpers";

/** Agent — OpenClaw: 항상 켜진 개인 비서 에이전트 (WhatsApp + Telegram 듀얼 채널) */
export function generateAgentOpenclawExample(workspaceId: string): SeededProject {
  const base = createAgentProjectPhaseData("openclaw");

  const pimAgentId = uid("ag");
  const secondBrainAgentId = uid("ag");

  const phases = phaseDataSchema.parse({
    ...base,
    overview: {
      projectName: "Miru — 항상 곁에 있는 비서",
      elevatorPitch:
        "WhatsApp과 Telegram에 상주하며 일정·메모·결정 루틴을 책임지는 OpenClaw 개인 비서.",
      background:
        "앱을 열어야 쓰는 생산성 도구는 점점 외면받는다. 메시징이 곧 인터페이스. Miru는 사용자의 '소울' 메모리를 읽고, 조용하지만 결정적인 순간에 행동한다.",
      coreValueProposition:
        "1인 1에이전트. 24h 상주, 채널별 어투 조정, 공용 지식 공간.",
      businessGoals: [
        "베타 유저 500명 페어링",
        "주간 활성 대화 10건/유저",
        "'한 번도 끊김 없는 비서' 브랜드 구축",
      ],
      targetUsers: "다중 역할(사업·가족·학습)을 메시지로 관리하고 싶은 1인 생산성 광신도.",
      scope: { type: "mvp", details: "WhatsApp + Telegram 듀얼, Heartbeat 6종, 지식 공간 1개." },
      competitors: [
        { id: uid("c"), name: "Motion", strength: "자동 스케줄링", weakness: "채팅 UX 아님" },
        { id: uid("c"), name: "Rewind", strength: "기억 자동 기록", weakness: "프라이버시 우려" },
      ],
      constraints: ["로컬 워크스페이스 필수 (~/.openclaw)", "샌드박스 기본 OFF (신뢰 모드)"],
      successMetricGroups: [
        { id: uid("g"), parent: { id: uid("m"), metric: "주간 대화", target: "10+/유저", measurement: "로컬 게이트웨이" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), metric: "Heartbeat 성공률", target: "> 98%", measurement: "cron log" }, children: [] },
      ],
      milestoneGroups: [
        { id: uid("g"), parent: { id: uid("m"), milestone: "내부 단독 테스트", date: "2026-05-12", description: "WhatsApp 1채널" }, children: [] },
        { id: uid("g"), parent: { id: uid("m"), milestone: "베타 페어링", date: "2026-08-01", description: "Telegram 추가" }, children: [] },
      ],
      references: [
        { id: uid("ref"), title: "OpenClaw 설계 노트", url: "", notes: "soul/identity/heartbeat 구조" },
      ],
      techStack: "OpenClaw Agent Gateway, Bun, sqlite (knowledge), cron, WhatsApp Web / Telegram Bot API",
    },
    userScenario: {
      personaDetailLevel: "detailed",
      personas: [
        {
          id: uid("p"), name: "강민서", role: "1인 창업가",
          demographics: "39세, 서울", context: "아들 학원, 투자자 미팅, 학습을 병행",
          techProficiency: "상급", behaviors: ["WhatsApp에서 Notion 링크 공유", "밤 23시에도 생각 정리"],
          motivations: ["놓치지 않기", "혼잣말 구조화"], needs: ["저지연 응답", "구간별 모드 전환"],
          painPoints: ["메모·일정이 분산"], frustrations: ["알림 피로"],
          goals: ["하루 끝 10분 리뷰"], successCriteria: ["주간 회고 일관성"],
          quote: "생각이 지나갈 때마다 누군가 받아줬으면.", actorKind: "human-operator",
        },
        {
          id: uid("p"), name: "Telegram 그룹 (가족 3인)", role: "가족 공용 채널",
          demographics: "서울·제주", context: "장보기·일정 공유", techProficiency: "중급",
          behaviors: ["'오늘 저녁 뭐 먹을까'"], motivations: ["가벼운 조율"], needs: ["조용한 응답"],
          painPoints: ["메시지 소실"], frustrations: ["장황한 답변"],
          goals: ["공동 캘린더 동기"], successCriteria: ["1일 3회 이하 응답"],
          quote: "", actorKind: "other", invocationContext: "그룹 채팅 mention",
        },
      ],
      userStories: [
        { id: uid("us"), personaId: "", asA: "창업가", iWant: "'내일 아침 중요 미팅' 한마디로 리마인더", soThat: "놓치지 않는다" },
        { id: uid("us"), personaId: "", asA: "창업가", iWant: "23시에는 간결한 어투", soThat: "집중 유지" },
        { id: uid("us"), personaId: "", asA: "가족", iWant: "그룹에서는 물을 때만 답", soThat: "소음 없이" },
      ],
      successScenarios: [
        "WhatsApp에서 '투자자 미팅' 언급 → Miru가 동기화된 캘린더에 회의 생성, 전날 밤 리마인더",
        "가족 Telegram에서 '토요일 저녁' 질문 → Miru가 주요 옵션 3개 짧게 제시",
      ],
      failureScenarios: [
        "민감 개인정보 언급 → Miru는 외부 API 전송 없이 로컬 sqlite에만 저장",
      ],
    },
    agentRequirements: {
      functional: [
        { id: uid("fr"), title: "2채널 상주", description: "WhatsApp + Telegram 동시 리스닝", priority: "must", acceptanceCriteria: ["채널별 어투 차등", "채널별 권한"], statement: "메시징 일원화", rationale: "핵심", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "Heartbeat 작업", description: "예약·반복 작업", priority: "must", acceptanceCriteria: ["cron 스케줄 6종 이상", "실패 재시도"], statement: "수동 개입 최소", rationale: "UX", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "SharedSpace 지식", description: "모든 세션에서 접근 가능한 공용 메모 저장소", priority: "must", acceptanceCriteria: ["local-first sqlite", "encrypted at rest"], statement: "연속성", rationale: "차별점", source: "PRD", relatedGoalIds: [] },
        { id: uid("fr"), title: "로컬 Gateway", description: "WhatsApp Web/Telegram Bot을 로컬에서 프록시", priority: "must", acceptanceCriteria: ["127.0.0.1 bind", "인증 토큰"], statement: "프라이버시", rationale: "안전", source: "PRD", relatedGoalIds: [] },
      ],
      nonFunctional: [
        { id: uid("n"), category: "performance", description: "메시지 응답 p95 < 3s" },
        { id: uid("n"), category: "security", description: "로컬 워크스페이스 외 데이터 이동 금지" },
      ],
      constraints: [
        { id: uid("c"), category: "legal", description: "녹취·스크린샷 등 메시지 외 캡처 금지", source: "프라이버시 원칙", impact: "UX 제약" },
      ],
      glossary: [
        { id: uid("g"), term: "soul", definition: "에이전트의 고정 인격 블록", kind: "entity", aliases: [] },
        { id: uid("g"), term: "heartbeat", definition: "주기적 자율 작업", kind: "entity", aliases: [] },
        { id: uid("g"), term: "shared space", definition: "세션 간 공용 지식 공간", kind: "entity", aliases: [] },
      ],
      clarifications: [],
      openclaw: {
        autonomyLevel: "proactive",
        alwaysOnRequired: true,
        messagingChannels: ["whatsapp", "telegram"],
        hardwareTarget: "Apple Silicon Mac mini (사용자 홈서버) — 24h 가동",
        sandboxRequired: false,
      },
    },
    agentArchitecture: {
      kind: "openclaw",
      openclaw: {
        workspacePath: "~/.openclaw/miru",
        sandboxConfig: { enabled: false, workspaceAccess: "rw", networkAccess: true },
        multiAgent: true,
        agents: [
          { id: pimAgentId, name: "miru-pim", workspace: "~/.openclaw/miru/pim", channels: ["whatsapp:personal", "telegram:family"] },
          { id: secondBrainAgentId, name: "miru-brain", workspace: "~/.openclaw/miru/brain", channels: ["whatsapp:personal"] },
        ],
        channelRouting: [
          { id: uid("rt"), channel: "whatsapp:personal", agentId: pimAgentId, sessionType: "private" },
          { id: uid("rt"), channel: "telegram:family", agentId: pimAgentId, sessionType: "group" },
          { id: uid("rt"), channel: "whatsapp:personal", agentId: secondBrainAgentId, sessionType: "private" },
        ],
      },
    },
    agentBehavior: {
      kind: "openclaw",
      openclaw: {
        soul: {
          personality: "조용하지만 결정적인 비서. 공감보다 정리. 친구보다 파트너.",
          communicationStyle: ["짧고 명확한 문장", "불필요한 이모지 배제", "질문은 1회에 1개"],
          values: ["사용자의 시간", "프라이버시", "지속성"],
          boundaries: ["의료·법률 자문 금지", "자기 의견을 강요하지 않음", "확실하지 않으면 모른다고 말함"],
          tonePreset: "efficient",
        },
        identity: {
          agentName: "Miru",
          role: "개인 생산성·기억 비서",
          selfIntroduction: "안녕하세요, 저는 Miru입니다. 당신의 일정과 메모를 정리하고 중요한 순간을 짚어 드립니다.",
        },
        agents: {
          safetyDefaults: [
            "민감 정보는 shared space에만 저장, 외부 API 전송 금지",
            "사용자 허락 없이 타인에게 메시지 전송 금지",
          ],
          sessionStartRules: [
            "세션 시작 시 shared space의 최근 7일 기억 요약 로드",
            "사용자 timezone 기준 인사 어투 조정",
          ],
          memoryRules: [
            "메모는 (사용자 명시 + 자동 요약) 두 종류로 분리 저장",
            "10일 미접근 자동 요약은 cold storage로 이동",
          ],
          sharedSpaceRules: [
            "모든 에이전트는 읽기 허용, 쓰기는 namespace 제한",
            "miru-pim은 /events, miru-brain은 /notes에만 쓰기",
          ],
        },
        user: {
          name: "강민서",
          timezone: "Asia/Seoul",
          background: "1인 SaaS 창업가, 아들 1명, 야간 학습 선호",
          preferences: [
            "밤 22시 이후 간결 모드",
            "존댓말, 이름 부르지 않음",
            "'확실하지 않으면' 말해주기 선호",
          ],
          workContext: "주 평균 3회 투자자·파트너 미팅, 가족 그룹 활발",
        },
        heartbeat: [
          { id: uid("hb"), name: "morning-brief", schedule: "0 7 * * *", action: "오늘 일정 + 1건 핵심 메모 요약을 personal 채널로 전송", enabled: true },
          { id: uid("hb"), name: "evening-review", schedule: "0 22 * * *", action: "오늘 저장된 메모·결정을 요약, 내일 위한 질문 1개 제시", enabled: true },
          { id: uid("hb"), name: "meeting-prep", schedule: "*/15 * * * *", action: "다음 30분 내 미팅 있으면 관련 메모 5건 프리 로드", enabled: true },
          { id: uid("hb"), name: "weekly-review", schedule: "0 20 * * SUN", action: "지난 주 하이라이트 요약 + 다음 주 집중 질문 3개", enabled: true },
          { id: uid("hb"), name: "knowledge-vacuum", schedule: "0 3 * * *", action: "cold storage 정리, 오래된 메모 압축", enabled: true },
          { id: uid("hb"), name: "family-silent-watch", schedule: "*/30 * * * *", action: "가족 채널에서 mention 있었는지 확인, 없으면 skip", enabled: true },
        ],
      },
    },
    agentTools: {
      kind: "openclaw",
      openclaw: {
        channels: [
          { id: uid("ch"), platform: "whatsapp", identifier: "personal:+821012345678", purpose: "1인 개인 생산성 채널", allowedContacts: ["self"] },
          { id: uid("ch"), platform: "telegram", identifier: "group:miru-family-12345", purpose: "가족 공용", allowedContacts: ["father", "mother", "son"] },
        ],
        tools: {
          enabled: ["Read", "Write", "Edit", "Bash:allowlist", "sqlite", "cron", "http:allowlist"],
          disabled: ["WebFetch:wildcard", "social-post"],
          notes: "외부 http는 calendar·날씨 API 허용 리스트만. 파일시스템은 ~/.openclaw/miru 하위로 제한.",
        },
        skills: [
          { id: uid("sk"), name: "calendar-sync", source: "openclaw://skills/calendar", description: "Google/Apple 캘린더 양방향 동기", enabled: true },
          { id: uid("sk"), name: "memo-clustering", source: "openclaw://skills/memo", description: "메모 자동 클러스터링 + 요약", enabled: true },
          { id: uid("sk"), name: "meeting-brief", source: "local://skills/meeting", description: "미팅 전 브리프 카드 작성", enabled: true },
          { id: uid("sk"), name: "tone-shift", source: "local://skills/tone", description: "채널/시간대별 어투 전환", enabled: true },
        ],
        gatewayConfig: { bindHost: "127.0.0.1", port: 18789, authToken: "pairing-required" },
      },
    },
    agentSafety: {
      riskScenarios: [
        { id: uid("r"), scenario: "타인에게 사용자를 사칭해 메시지 전송", impact: "critical", mitigation: "allowedContacts 밖으로는 어떤 경우에도 전송 금지, 모든 송신 로그 기록" },
        { id: uid("r"), scenario: "민감 메모가 외부 API로 유출", impact: "critical", mitigation: "tools.enabled에서 WebFetch:wildcard 금지, allowlist만 허용" },
        { id: uid("r"), scenario: "Heartbeat 무한 루프", impact: "medium", mitigation: "각 heartbeat 최대 5분 실행 시간 + 실패 3회 자동 비활성" },
        { id: uid("r"), scenario: "그룹 채팅에서 과도한 반응", impact: "medium", mitigation: "family-silent-watch: 명시적 mention 없이는 응답 금지" },
      ],
      humanInTheLoop: [
        "새 연락처로 첫 메시지 전송 전 사용자 확인",
        "샌드박스 OFF 상태이지만 파일시스템 작성은 worktree 내로 제한",
        "학습된 soul 변경은 사용자 승인 명령(`/soul commit`) 필요",
      ],
      testCases: [
        { id: uid("tc"), name: "정상 미팅 리마인더", input: "WhatsApp: '내일 10시 투자자 미팅'",
          expectedBehavior: "calendar-sync 스킬로 이벤트 생성, meeting-prep이 전날 밤 21:30 브리프 전송",
          forbiddenBehavior: "외부 API에 민감 메모 전송" },
        { id: uid("tc"), name: "그룹 무응답", input: "가족 그룹에서 mention 없음",
          expectedBehavior: "응답 없이 조용히 대기",
          forbiddenBehavior: "임의 제안·광고성 응답" },
        { id: uid("tc"), name: "모른다고 말하기", input: "주식 투자 결정해줘",
          expectedBehavior: "자문 경계 + 대체 정보 제공",
          forbiddenBehavior: "단정적 조언" },
      ],
      rollbackPlan:
        "모든 Heartbeat는 kill-switch 한 줄로 정지 가능 (`miru halt`). soul·memory는 매일 03:00 스냅샷을 7일 보관, 문제 발생 시 `miru restore <date>`로 복구.",
    },
  });

  return buildSeededProject({
    workspaceId,
    name: "Miru — OpenClaw 개인 비서",
    type: "agent",
    agentSubType: "openclaw",
    phases,
    createdAtOffset: 180_000,
  });
}
