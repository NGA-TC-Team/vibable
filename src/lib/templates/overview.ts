import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const ideaBrainstormExample = {
  projectName: "포커스메이트",
  elevatorPitch: "함께 집중하고 회고하는 소셜 타이머 앱",
  background:
    "직장인과 대학생은 집중 시간을 확보하고 싶어 하지만 기존 타이머 앱은 동기부여와 회고 기능이 약해 금방 이탈한다.",
  coreValueProposition: "혼자가 아닌 함께 집중하는 경험과 자동 회고 리포트를 통해 지속적인 몰입 습관을 형성한다.",
  businessGoals: [
    "첫 8주 안에 주간 활성 사용자 3,000명을 확보한다.",
    "집중 세션 완료율을 75% 이상으로 끌어올린다.",
    "유료 회고 리포트 구독 전환율 4%를 달성한다.",
  ],
  targetUsers: "깊은 몰입 시간을 만들고 싶은 20-30대 직장인과 대학생",
  scope: { type: "mvp", details: "핵심 타이머 + 회고 리포트. 소셜 기능은 2차 스코프." },
  competitors: [],
  constraints: ["MVP 개발 기간 4주 이내"],
  successMetrics: [{ id: "sm-1", metric: "주간 활성 사용자", target: "3,000명", measurement: "WAU 트래킹" }],
  timeline: [{ id: "ms-1", milestone: "MVP 출시", date: "2026-Q2", description: "핵심 타이머 + 회고 기능" }],
  references: [],
  techStack: "Next.js, Supabase, Web Push",
};

const competitorAnalysisExample = {
  projectName: "리치코치",
  elevatorPitch: "AI가 소비 습관을 코칭해주는 스마트 가계부",
  background:
    "기존 가계부 앱은 소비 내역 집계에는 강하지만 실제 행동 변화를 만드는 코칭과 습관 설계가 부족하다.",
  coreValueProposition: "소비 데이터 분석을 넘어 AI 코칭과 절약 챌린지로 실제 행동 변화를 유도한다.",
  businessGoals: [
    "출시 3개월 내 월간 활성 사용자 5,000명을 달성한다.",
    "AI 소비 코칭 리포트 재방문율을 40% 이상 확보한다.",
    "절약 챌린지 참여자의 평균 저축률을 10% 이상 개선한다.",
  ],
  targetUsers: "지출 관리를 배우고 싶은 20-30대 사회초년생",
  scope: { type: "mvp", details: "소비 분석 + AI 코칭 리포트. 챌린지 기능은 2차." },
  competitors: [
    { id: "c-1", name: "토스", strength: "통합 금융 플랫폼", weakness: "코칭/습관 기능 미흡" },
    { id: "c-2", name: "뱅크샐러드", strength: "자산 관리", weakness: "행동 변화 유도 약함" },
  ],
  constraints: [],
  successMetrics: [],
  timeline: [],
  references: [],
  techStack: "React Native, Firebase, OpenAI API",
};

const problemDefinitionExample = {
  projectName: "반찬이웃",
  elevatorPitch: "동네 반찬가게를 손쉽게 연결하는 집밥 주문 플랫폼",
  background:
    "1인 가구는 집밥을 원하지만 매일 요리할 시간은 부족하고, 배달 음식은 가격과 건강 측면에서 반복 이용 부담이 크다.",
  coreValueProposition: "동네 반찬가게와 1인 가구를 직접 연결하여 건강한 집밥을 합리적 가격에 제공한다.",
  businessGoals: [
    "동네 반찬가게와 소비자를 연결하는 주문 경험을 만든다.",
    "주문 후 30분 내 픽업 또는 근거리 배달 경험을 제공한다.",
    "런칭 1년 안에 월 거래액 1억원을 달성한다.",
  ],
  targetUsers: "집밥을 원하지만 요리 시간이 부족한 25-40세 1인 가구 직장인",
  scope: { type: "mvp", details: "주문/결제 + 가게 등록. 배달 연동은 2차." },
  competitors: [],
  constraints: ["Toss Payments 연동 필수"],
  successMetrics: [{ id: "sm-1", metric: "월 거래액", target: "1억원", measurement: "결제 데이터 집계" }],
  timeline: [],
  references: [],
  techStack: "Next.js, Supabase, Toss Payments",
};

export const overviewTemplates: PhaseTemplate[] = [
  {
    id: "idea-brainstorm",
    name: "아이디어 브레인스토밍",
    description: "막연한 아이디어를 구조화된 기획 개요로 변환합니다.",
    promptTemplate: buildPromptTemplate({
      role: "초기 서비스 아이디어를 제품 개요로 구조화하는 시니어 PM",
      objective:
        "막연한 아이디어를 바로 실행 가능한 서비스 개요로 정리해. `projectName`, 문제 배경, 사업 목표, 타겟 사용자, 추천 기술 스택까지 한 번에 제안해.",
      inputFields: [
        '아이디어: "{idea}"',
        '타겟 사용자: "{targetUsers}"',
        '핵심 가치: "{coreValue}"',
      ],
      outputRules: [
        "businessGoals는 측정 가능한 문장 3개로 작성해.",
        "background는 문제와 시장 맥락이 드러나도록 2~3문장으로 작성해.",
        "techStack은 MVP 기준으로 현실적인 조합을 1줄로 제안해.",
      ],
      exampleInput: [
        '아이디어: "집중 세션을 함께 기록하고 회고하는 타이머 앱"',
        '타겟 사용자: "깊게 몰입하고 싶은 직장인과 대학생"',
        '핵심 가치: "집중 기록, 동기부여, 회고 자동화"',
      ],
      exampleOutput: ideaBrainstormExample,
    }),
  },
  {
    id: "competitor-analysis",
    name: "경쟁사 분석 기반",
    description:
      "유사 서비스를 분석하고 차별점을 도출하여 기획 개요를 작성합니다.",
    promptTemplate: buildPromptTemplate({
      role: "경쟁 구도를 분석해 차별화된 제품 전략을 정리하는 프로덕트 전략가",
      objective:
        "경쟁 서비스의 강점과 빈틈을 해석해서 우리 서비스의 차별화된 기획 개요를 작성해. 경쟁사 복제가 아니라 포지셔닝이 드러나야 해.",
      inputFields: [
        '경쟁 서비스: "{competitors}"',
        '우리 서비스 이름: "{projectName}"',
        '핵심 차별점: "{differentiator}"',
      ],
      outputRules: [
        "background에는 경쟁사 공통 패턴과 빈틈을 함께 요약해.",
        "businessGoals는 차별점이 실제 지표로 이어지도록 작성해.",
        "projectName은 입력값을 유지하되, 불명확하면 더 자연스럽게 정제해도 돼.",
      ],
      exampleInput: [
        '경쟁 서비스: "토스, 뱅크샐러드, 편한가계부"',
        '우리 서비스 이름: "리치코치"',
        '핵심 차별점: "소비 내역 기록을 넘어 행동 개선 코칭과 절약 챌린지를 제공"',
      ],
      exampleOutput: competitorAnalysisExample,
    }),
  },
  {
    id: "problem-definition",
    name: "문제 정의 기반",
    description:
      "해결하려는 문제를 명확히 정의하고 이를 기반으로 기획 개요를 도출합니다.",
    promptTemplate: buildPromptTemplate({
      role: "문제 정의에서 출발해 서비스 가설을 설계하는 린 프로덕트 매니저",
      objective:
        "문제 상황, 현재 대안, 해결 대상 사용자를 바탕으로 왜 지금 이 서비스가 필요한지 드러나는 기획 개요를 작성해.",
      inputFields: [
        '해결하려는 문제: "{problem}"',
        '문제를 겪는 사용자: "{targetUsers}"',
        '현재 대안: "{currentAlternative}"',
      ],
      outputRules: [
        "background에는 현재 대안의 한계와 기회 영역을 함께 포함해.",
        "businessGoals는 운영 관점 1개, 사용자 성과 관점 1개 이상 포함해 3개로 제안해.",
        "techStack은 입력이 없어도 문제 해결 방식에 맞는 MVP 조합을 추천해.",
      ],
      exampleInput: [
        '해결하려는 문제: "혼자 사는 직장인이 건강한 집밥을 챙기기 어렵다"',
        '문제를 겪는 사용자: "퇴근이 늦고 요리 시간이 부족한 1인 가구"',
        '현재 대안: "배달 음식, 밀키트, 직접 요리"',
      ],
      exampleOutput: problemDefinitionExample,
    }),
  },
];
