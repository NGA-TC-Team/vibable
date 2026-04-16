import type { PhaseTemplate } from "./index";
import { buildPromptTemplate } from "./prompt-template";

const screenToEntityExample = {
  entities: [
    {
      id: "user",
      name: "User",
      fields: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "사용자 고유 식별자",
        },
        {
          name: "email",
          type: "string",
          required: true,
          description: "로그인과 알림 발송에 사용하는 이메일",
        },
        {
          name: "nickname",
          type: "string",
          required: true,
          description: "서비스 내 표시 이름",
        },
        {
          name: "createdAt",
          type: "date",
          required: true,
          description: "계정 생성 시각",
        },
        {
          name: "role",
          type: "enum",
          required: true,
          description: "권한 역할",
          enumValues: ["user", "admin"],
        },
      ],
    },
    {
      id: "post",
      name: "Post",
      fields: [
        {
          name: "id",
          type: "string",
          required: true,
          description: "게시글 고유 식별자",
        },
        {
          name: "title",
          type: "string",
          required: true,
          description: "게시글 제목",
        },
        {
          name: "content",
          type: "string",
          required: true,
          description: "게시글 본문",
        },
        {
          name: "authorId",
          type: "relation",
          required: true,
          description: "작성자 참조",
          relationTarget: "User",
          relationType: "1:N",
        },
        {
          name: "published",
          type: "boolean",
          required: true,
          description: "발행 여부",
        },
      ],
    },
  ],
  storageStrategy: "remote",
  storageNotes: "핵심 정형 데이터는 원격 DB에 저장하고, 파일 자산은 별도 스토리지에 저장한다.",
};

const relationDesignExample = {
  entities: [
    {
      id: "workspace",
      name: "Workspace",
      fields: [
        { name: "id", type: "string", required: true, description: "워크스페이스 고유 식별자" },
        { name: "name", type: "string", required: true, description: "워크스페이스 이름" },
        {
          name: "ownerId",
          type: "relation",
          required: true,
          description: "워크스페이스 소유자",
          relationTarget: "User",
          relationType: "1:N",
        },
      ],
    },
    {
      id: "workspace-member",
      name: "WorkspaceMember",
      fields: [
        {
          name: "workspaceId",
          type: "relation",
          required: true,
          description: "소속 워크스페이스",
          relationTarget: "Workspace",
          relationType: "1:N",
        },
        {
          name: "userId",
          type: "relation",
          required: true,
          description: "참여 사용자",
          relationTarget: "User",
          relationType: "1:N",
        },
        {
          name: "role",
          type: "enum",
          required: true,
          description: "참여 권한",
          enumValues: ["owner", "editor", "viewer"],
        },
        {
          name: "joinedAt",
          type: "date",
          required: true,
          description: "참여 시각",
        },
      ],
    },
    {
      id: "project",
      name: "Project",
      fields: [
        { name: "id", type: "string", required: true, description: "프로젝트 고유 식별자" },
        {
          name: "workspaceId",
          type: "relation",
          required: true,
          description: "소속 워크스페이스",
          relationTarget: "Workspace",
          relationType: "1:N",
        },
        { name: "name", type: "string", required: true, description: "프로젝트 이름" },
        {
          name: "status",
          type: "enum",
          required: true,
          description: "프로젝트 상태",
          enumValues: ["draft", "active", "archived"],
        },
      ],
    },
  ],
  storageStrategy: "remote",
  storageNotes: "WorkspaceMember는 Workspace와 User 사이의 N:M 관계를 풀기 위한 조인 엔티티다.",
};

const storageStrategyExample = {
  entities: [
    {
      id: "note",
      name: "Note",
      fields: [
        { name: "id", type: "string", required: true, description: "노트 고유 식별자" },
        { name: "title", type: "string", required: true, description: "노트 제목" },
        { name: "body", type: "string", required: true, description: "노트 본문" },
        {
          name: "syncedAt",
          type: "date",
          required: false,
          description: "마지막 서버 동기화 시각",
        },
        {
          name: "isLocal",
          type: "boolean",
          required: true,
          description: "아직 서버에 동기화되지 않은 로컬 초안 여부",
        },
      ],
    },
    {
      id: "attachment",
      name: "Attachment",
      fields: [
        { name: "id", type: "string", required: true, description: "첨부파일 고유 식별자" },
        {
          name: "noteId",
          type: "relation",
          required: true,
          description: "연결된 노트",
          relationTarget: "Note",
          relationType: "1:N",
        },
        { name: "fileUrl", type: "string", required: true, description: "파일 접근 URL" },
        { name: "fileSize", type: "number", required: true, description: "파일 크기(byte)" },
      ],
    },
  ],
  storageStrategy: "hybrid",
  storageNotes:
    "로컬 캐시를 우선 사용하고 온라인 복귀 시 원격 저장소와 동기화한다. 충돌 발생 시 최근 수정본 기준으로 병합한다.",
};

export const dataModelTemplates: PhaseTemplate[] = [
  {
    id: "screen-to-entity",
    name: "화면→엔티티 추출",
    description:
      "화면 설계에서 필요한 데이터 엔티티를 자동으로 추출합니다.",
    promptTemplate: buildPromptTemplate({
      role: "화면 요구사항에서 데이터 구조를 추출하는 데이터 모델러",
      objective:
        "화면 명세를 읽고, 사용자에게 보여주거나 입력받는 정보를 기준으로 엔티티와 필드를 도출해. 마지막에는 전체 서비스에 맞는 저장 전략도 제안해.",
      inputFields: ['화면 명세: "{screenDesign}"'],
      outputRules: [
        'fields.type은 "string" | "number" | "boolean" | "date" | "enum" | "relation" 중 하나만 사용해.',
        "enum 타입이면 enumValues를 채우고, relation 타입이면 relationTarget과 relationType을 함께 채워.",
        'storageStrategy는 "local" | "remote" | "hybrid" 중 하나만 사용해.',
      ],
      exampleInput: [
        '화면 명세: "로그인 화면, 사용자 프로필 화면, 게시글 작성 화면, 게시글 목록 화면"',
      ],
      exampleOutput: screenToEntityExample,
    }),
  },
  {
    id: "relation-design",
    name: "관계 설계",
    description:
      "엔티티 간 관계(1:1, 1:N, N:M)를 설계합니다.",
    promptTemplate: buildPromptTemplate({
      role: "엔티티 관계를 현실적인 저장 구조로 정리하는 백엔드 설계자",
      objective:
        "주어진 엔티티 후보를 바탕으로 관계를 보강하고, 필요한 relation 필드나 조인 엔티티까지 포함한 데이터 모델을 완성해.",
      inputFields: ['엔티티 목록: "{entityList}"'],
      outputRules: [
        'relationType은 "1:1" | "1:N" | "N:M" 중 하나만 사용해.',
        "N:M 관계가 필요하면 조인 엔티티를 새로 추가해.",
        "storageNotes에는 왜 그런 관계 구조를 택했는지 요약해.",
      ],
      exampleInput: [
        '엔티티 목록: "User, Workspace, Project. 한 사용자는 여러 워크스페이스에 속할 수 있고, 워크스페이스는 여러 프로젝트를 가진다."',
      ],
      exampleOutput: relationDesignExample,
    }),
  },
  {
    id: "storage-strategy",
    name: "저장 전략 결정",
    description:
      "서비스 특성에 맞는 저장 전략(local/remote/hybrid)을 결정합니다.",
    promptTemplate: buildPromptTemplate({
      role: "제품 특성에 맞는 저장 전략을 설계하는 앱 아키텍트",
      objective:
        "오프라인 지원, 실시간 동기화, 데이터 규모 조건을 해석해서 적절한 저장 전략과 대표 엔티티 구성을 함께 제안해.",
      inputFields: [
        '서비스 이름: "{serviceName}"',
        "오프라인 지원: {offlineSupport}",
        "실시간 동기화: {realtimeSync}",
        "데이터 규모: {dataScale}",
      ],
      outputRules: [
        'storageStrategy는 local, remote, hybrid 중 하나만 사용해.',
        "storageNotes에는 로컬 우선인지 원격 우선인지, 동기화 방식이 무엇인지 적어.",
        "엔티티는 전략 판단에 필요한 핵심 데이터만 제안해도 충분해.",
      ],
      exampleInput: [
        '서비스 이름: "오프라인 노트"',
        "오프라인 지원: 높음",
        "실시간 동기화: 중간",
        "데이터 규모: 텍스트 중심, 첨부파일 일부 포함",
      ],
      exampleOutput: storageStrategyExample,
    }),
  },
];
