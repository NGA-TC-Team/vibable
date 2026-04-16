import { createDefaultPhaseData } from "@/lib/schemas/phase-data";
import type { PhaseData, ProjectType } from "@/types/phases";

interface ExampleProjectData {
  name: string;
  type: ProjectType;
  phases: PhaseData;
}

export function getExampleProjectData(): ExampleProjectData {
  const defaults = createDefaultPhaseData() as PhaseData;

  return {
    name: "TaskFlow",
    type: "web",
    phases: {
      ...defaults,
      overview: {
        projectName: "TaskFlow",
        elevatorPitch:
          "복잡한 할 일을 직관적으로 관리하고, 팀과 실시간 협업할 수 있는 스마트 태스크 매니저",
        background:
          "기존 할 일 관리 앱은 단순 체크리스트에 그치거나, 지나치게 복잡한 프로젝트 관리 도구여서 개인과 소규모 팀이 일상 업무를 효율적으로 관리하기 어렵다. 반복 작업 자동화, 우선순위 기반 정렬, 간단한 협업 기능을 하나의 깔끔한 인터페이스에 담은 서비스가 필요하다.",
        coreValueProposition:
          "복잡함 없이 강력한 태스크 관리 — AI 기반 우선순위 추천과 자연어 입력으로 누구나 쉽게 사용할 수 있다.",
        businessGoals: [
          "출시 3개월 내 MAU 10,000명 달성",
          "무료 사용자의 15%를 유료 플랜으로 전환",
          "NPS 50 이상 유지하여 자연 바이럴 성장 유도",
        ],
        targetUsers:
          "일정과 업무가 많은 직장인, 과제·시험·동아리 일정을 관리하는 대학생, 소규모 팀 리더",
        scope: {
          type: "mvp",
          details:
            "1차 MVP는 개인 태스크 CRUD, 우선순위 태그, 마감일 알림, 간단한 팀 공유 기능에 집중한다.",
        },
        competitors: [],
        constraints: [],
        successMetrics: [],
        timeline: [],
        references: [],
        techStack: "",
      },
      userScenario: {
        personaDetailLevel: "simple",
        personas: [
          {
            id: crypto.randomUUID(),
            name: "김민수",
            role: "IT 기업 마케팅 매니저 (32세)",
            demographics: "",
            context: "",
            techProficiency: "",
            behaviors: [],
            motivations: [],
            needs: [],
            painPoints: [
              "할 일이 메일·메신저·메모에 흩어져 빠뜨리는 업무가 많다",
              "기존 도구는 설정이 복잡해 팀원이 따라오지 않는다",
            ],
            frustrations: [],
            goals: [
              "하나의 앱에서 모든 업무를 한눈에 파악하고 싶다",
              "팀원에게 간단히 할 일을 할당하고 진행 상황을 확인하고 싶다",
            ],
            successCriteria: [],
            quote: "",
          },
          {
            id: crypto.randomUUID(),
            name: "이서연",
            role: "경영학과 대학생 (22세)",
            demographics: "",
            context: "",
            techProficiency: "",
            behaviors: [],
            motivations: [],
            needs: [],
            painPoints: [
              "과제 마감일을 놓쳐 감점당한 경험이 있다",
              "캘린더 앱만으로는 세부 할 일을 관리하기 어렵다",
            ],
            frustrations: [],
            goals: [
              "마감일 기반으로 자동 정렬되는 할 일 목록이 필요하다",
              "반복 과제(주간 리포트 등)를 자동 생성하고 싶다",
            ],
            successCriteria: [],
            quote: "",
          },
        ],
        userStories: [
          {
            id: crypto.randomUUID(),
            personaId: "",
            asA: "직장인 사용자",
            iWant:
              "자연어로 빠르게 할 일을 입력하면 날짜·우선순위가 자동 설정되길",
            soThat: "입력에 드는 시간을 줄이고 실행에 집중할 수 있다",
          },
          {
            id: crypto.randomUUID(),
            personaId: "",
            asA: "팀 리더",
            iWant:
              "팀원에게 태스크를 할당하고 완료 여부를 대시보드에서 확인하길",
            soThat: "별도 회의 없이 팀 진행률을 파악할 수 있다",
          },
          {
            id: crypto.randomUUID(),
            personaId: "",
            asA: "대학생 사용자",
            iWant: "매주 반복되는 과제를 자동으로 생성해주길",
            soThat:
              "직접 등록하는 번거로움 없이 빠짐없이 관리할 수 있다",
          },
        ],
        successScenarios: [
          "김민수가 아침에 앱을 열면 오늘의 우선 할 일이 자동 정렬되어 있고, 3분 만에 하루 업무를 확인한다.",
          "이서연이 '매주 금요일 경영전략 리포트 제출'을 반복 태스크로 설정해두면, 매주 목요일 알림을 받아 마감을 놓치지 않는다.",
        ],
        failureScenarios: [
          "첫 진입 시 빈 화면만 보이고 무엇을 해야 할지 몰라 앱을 닫는다.",
          "태스크가 50개 이상 쌓이자 우선순위 파악이 어려워져 다른 도구로 이탈한다.",
        ],
      },
      requirements: {
        functional: [
          {
            id: crypto.randomUUID(),
            title: "태스크 CRUD",
            description:
              "사용자는 할 일을 생성, 조회, 수정, 삭제할 수 있다. 제목, 설명, 마감일, 우선순위, 태그를 포함한다.",
            priority: "must",
            acceptanceCriteria: [
              "태스크 생성 시 제목은 필수",
              "마감일이 지난 태스크는 시각적으로 구분",
            ],
          },
          {
            id: crypto.randomUUID(),
            title: "우선순위 자동 정렬",
            description:
              "마감일과 중요도를 기반으로 태스크 목록이 자동 정렬된다.",
            priority: "must",
            acceptanceCriteria: [
              "마감 임박 + 높은 중요도 태스크가 최상단에 표시",
            ],
          },
          {
            id: crypto.randomUUID(),
            title: "반복 태스크",
            description:
              "매일, 매주, 매월 반복 주기를 설정하면 자동으로 새 태스크가 생성된다.",
            priority: "should",
            acceptanceCriteria: [
              "반복 주기 변경 시 이후 태스크에만 적용",
              "개별 반복 건의 독립 수정 가능",
            ],
          },
          {
            id: crypto.randomUUID(),
            title: "팀 태스크 할당",
            description:
              "태스크를 특정 팀원에게 할당하고, 팀 대시보드에서 진행 상황을 조회한다.",
            priority: "could",
            acceptanceCriteria: [
              "할당된 팀원에게 알림 전송",
              "팀 대시보드에서 멤버별 필터 가능",
            ],
          },
          {
            id: crypto.randomUUID(),
            title: "마감일 알림",
            description:
              "마감 24시간 전, 1시간 전에 푸시/이메일 알림을 보낸다.",
            priority: "must",
            acceptanceCriteria: [
              "알림 채널(푸시/이메일)은 사용자가 설정 가능",
              "알림 끄기 옵션 제공",
            ],
          },
        ],
        nonFunctional: [
          {
            id: crypto.randomUUID(),
            category: "performance",
            description:
              "태스크 목록 로딩 시간은 500ms 이내, 100개 이상의 태스크에서도 스크롤 끊김 없이 동작한다.",
          },
          {
            id: crypto.randomUUID(),
            category: "offline",
            description:
              "오프라인 상태에서도 태스크 조회·생성이 가능하며, 온라인 복귀 시 자동 동기화된다.",
          },
        ],
      },
    },
  };
}
