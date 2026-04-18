// ─── Phase 0: 기획 개요 ───

export interface Competitor {
  id: string;
  name: string;
  url?: string;
  strength: string;
  weakness: string;
}

export interface SuccessMetric {
  id: string;
  metric: string;
  target: string;
  measurement: string;
}

/** 성공 지표 상·하위 묶음 (카드 1개 = 1그룹) */
export interface SuccessMetricGroup {
  id: string;
  parent: SuccessMetric;
  children: SuccessMetric[];
}

export interface Milestone {
  id: string;
  milestone: string;
  date: string;
  description: string;
}

/** 마일스톤 상·하위 묶음 */
export interface MilestoneGroup {
  id: string;
  parent: Milestone;
  children: Milestone[];
}

export interface Reference {
  id: string;
  title: string;
  url?: string;
  notes?: string;
}

export interface OverviewPhase {
  projectName: string;
  elevatorPitch: string;
  background: string;
  coreValueProposition: string;
  businessGoals: string[];
  targetUsers: string;
  scope: {
    type: "mvp" | "full" | "prototype";
    details: string;
  };
  competitors: Competitor[];
  constraints: string[];
  /** 레거시 평면 배열 — 신규 데이터는 비우고 successMetricGroups 사용 */
  successMetrics: SuccessMetric[];
  successMetricGroups: SuccessMetricGroup[];
  /** 레거시 평면 배열 — 신규 데이터는 비우고 milestoneGroups 사용 */
  timeline: Milestone[];
  milestoneGroups: MilestoneGroup[];
  references: Reference[];
  techStack?: string;
}

// ─── Phase 1: 유저 시나리오 ───

export interface Persona {
  id: string;
  name: string;
  role: string;
  demographics: string;
  context: string;
  techProficiency: string;
  behaviors: string[];
  motivations: string[];
  needs: string[];
  painPoints: string[];
  frustrations: string[];
  goals: string[];
  successCriteria: string[];
  quote: string;
}

export interface UserStory {
  id: string;
  personaId: string;
  asA: string;
  iWant: string;
  soThat: string;
}

export interface UserScenarioPhase {
  personaDetailLevel: "simple" | "detailed";
  personas: Persona[];
  userStories: UserStory[];
  successScenarios: string[];
  failureScenarios: string[];
}

// ─── Phase 2: 요구사항 명세 ───

export interface FunctionalRequirement {
  id: string;
  title: string;
  description: string;
  priority: "must" | "should" | "could" | "wont";
  acceptanceCriteria: string[];
  /** "시스템은 <대상>이 <행동/상태>할 수 있어야 한다" 문장 규격 */
  statement: string;
  /** 왜 필요한가 (업무 목적/근거) */
  rationale: string;
  /** 요청자·근거 문서 등 추적성 정보 */
  source: string;
  /** overview.businessGoals 연결 id 배열 */
  relatedGoalIds: string[];
}

export interface NonFunctionalRequirement {
  id: string;
  category:
    | "performance"
    | "security"
    | "accessibility"
    | "offline"
    | "other";
  description: string;
}

export interface Constraint {
  id: string;
  category:
    | "policy"
    | "legal"
    | "budget"
    | "schedule"
    | "legacySystem"
    | "other";
  description: string;
  source: string;
  impact: string;
}

export interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  kind: "role" | "state" | "entity" | "rule" | "term";
  aliases: string[];
}

export interface Clarification {
  id: string;
  question: string;
  context: string;
  owner: string;
  status: "open" | "answered" | "deferred";
  answer: string;
  blocksRequirementIds: string[];
}

export interface RequirementsPhase {
  functional: FunctionalRequirement[];
  nonFunctional: NonFunctionalRequirement[];
  constraints: Constraint[];
  glossary: GlossaryTerm[];
  clarifications: Clarification[];
}

// ─── Phase 3: 정보 구조 ───

export type ScreenType =
  | "hub"
  | "list"
  | "detail"
  | "create"
  | "edit"
  | "review"
  | "result"
  | "settings";

export type FlowStepIntent =
  | "view"
  | "input"
  | "select"
  | "submit"
  | "confirm"
  | "approve"
  | "reject"
  | "complete";

export type NavRuleSeverity = "info" | "warning" | "critical";

export interface SitemapNode {
  id: string;
  label: string;
  path?: string;
  purpose?: string;
  screenType?: ScreenType;
  primaryTask?: string;
  audience?: string[];
  primaryEntity?: string;
  children: SitemapNode[];
}

export interface FlowStep {
  id: string;
  screenRef?: string;
  action: string;
  intent?: FlowStepIntent;
  actor?: string;
  condition?: string;
  outcome?: string;
  next: string[];
}

export interface UserFlow {
  id: string;
  name: string;
  goal?: string;
  primaryActor?: string;
  startScreenRef?: string;
  successEndings?: string[];
  failureEndings?: string[];
  steps: FlowStep[];
}

export interface GlobalNavRule {
  id: string;
  title: string;
  rule: string;
  rationale?: string;
  severity?: NavRuleSeverity;
  appliesTo?: {
    roles?: string[];
    screenTypes?: ScreenType[];
    paths?: string[];
  };
}

export interface IaRole {
  id: string;
  name: string;
  description?: string;
}

export interface IaEntity {
  id: string;
  name: string;
  description?: string;
  states?: string[];
}

export interface InfoArchitecturePhase {
  sitemap: SitemapNode[];
  userFlows: UserFlow[];
  globalNavRules: GlobalNavRule[];
  roles?: IaRole[];
  entities?: IaEntity[];
}

// ─── Phase 4: 화면 설계 ───

export interface ErrorState {
  type: "network" | "validation" | "permission" | "notFound" | "custom";
  description: string;
}

export interface Interaction {
  elementId: string;
  trigger: string;
  actionKind: string;
  actionCustom?: string;
}

export type MockupViewportKey = "mobile" | "tablet" | "desktop";
export type MockupNoteMode = "same" | "none" | "custom";

export type MockupElementType =
  | "header"
  | "text"
  | "heading"
  | "button"
  | "input"
  | "image"
  | "card"
  | "list"
  | "divider"
  | "icon"
  | "bottomNav"
  | "sidebar"
  | "table"
  | "form"
  | "modal"
  | "tabs"
  | "carousel"
  | "avatar"
  | "badge"
  | "toggle"
  | "checkbox"
  | "radio"
  | "dropdown"
  | "searchbar"
  | "breadcrumb"
  | "pagination"
  | "progressbar"
  | "map"
  | "video"
  | "chart"
  | "spacer"
  | "grid"
  | "hstack"
  | "vstack";

export interface MockupElement {
  id: string;
  type: MockupElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  props: Record<string, string>;
  children?: string[];
  /** 사용자가 붙이는 별칭. 인터랙션 대상 선택 등에서 기본 라벨 대신 사용한다. */
  alias?: string;
  designNote?: string;
  designNoteByContext?: Partial<
    Record<
      `${ScreenState}:${MockupViewportKey}`,
      {
        mode: MockupNoteMode;
        note?: string;
      }
    >
  >;
}

export interface MockupViewport {
  mobile: MockupElement[];
  tablet: MockupElement[];
  desktop: MockupElement[];
}

export type ScreenState = "idle" | "loading" | "offline" | "error";

export interface MockupStateViewport {
  idle: MockupViewport;
  loading: MockupViewport;
  offline: MockupViewport;
  error: MockupViewport;
}

export interface ScreenPage {
  id: string;
  name: string;
  route?: string;
  entityIds: string[];
  uxIntent: {
    userGoal: string;
    businessIntent: string;
  };
  states: {
    idle: string;
    loading: string;
    offline: string;
    errors: ErrorState[];
  };
  interactions: Interaction[];
  inPages: string[];
  outPages: string[];
  mockup?: MockupViewport;
  mockupByState?: MockupStateViewport;
}

export interface ScreenDesignPhase {
  pages: ScreenPage[];
}

// ─── Phase 5: 데이터 모델 ───

export interface EntityField {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "enum" | "relation";
  required: boolean;
  description?: string;
  enumValues?: string[];
  relationTarget?: string;
  relationTargetField?: string;
  relationType?: "1:1" | "1:N" | "N:M";
  onDelete?: "cascade" | "restrict" | "setNull" | "noAction";
  onUpdate?: "cascade" | "restrict" | "setNull" | "noAction";
}

export interface Entity {
  id: string;
  name: string;
  fields: EntityField[];
}

export interface DataModelPhase {
  entities: Entity[];
  storageStrategy: "local" | "remote" | "hybrid" | "distributed";
  distributedStrategy?: "primaryReplica" | "sharded" | "multiRegion";
  storageNotes?: string;
}

// ─── Phase 6: 디자인 시스템 & UX 라이팅 ───

export interface ColorToken {
  name: string;
  hex: string;
  oklch?: string;
  role: string;
}

export interface TypeScaleEntry {
  name: string;
  size: string;
  lineHeight: string;
  weight: string;
  letterSpacing?: string;
}

export type ComponentCategory =
  | "button"
  | "card"
  | "input"
  | "badge"
  | "navigation"
  | "modal"
  | "table"
  | "custom";

export interface ComponentStyleToken {
  background?: string;
  textColor?: string;
  borderColor?: string;
  borderRadius?: string;
  padding?: string;
  shadow?: string;
  fontSize?: string;
  fontWeight?: string;
}

export interface ComponentStyle {
  component: string;
  category: ComponentCategory;
  variants: string;
  borderRadius: string;
  notes?: string;
  defaultStyle?: ComponentStyleToken;
  hoverStyle?: ComponentStyleToken;
  activeStyle?: ComponentStyleToken;
  disabledStyle?: ComponentStyleToken;
}

export interface GlossaryEntry {
  term: string;
  avoid: string;
  context?: string;
}

export type LayoutPresetKey =
  | "mobile-first"
  | "saas"
  | "dashboard"
  | "marketing"
  | "custom";

/** 뷰포트 3종에 대한 최대 콘텐츠 너비(px). */
export interface LayoutViewportWidths {
  mobile: number;
  tablet: number;
  desktop: number;
}

export interface DesignSystemPhase {
  visualTheme: {
    mood: string;
    density: "compact" | "comfortable" | "spacious";
    philosophy: string;
  };
  colorPalette: ColorToken[];
  typography: {
    fontFamilies: { role: string; family: string; fallback: string }[];
    scale: TypeScaleEntry[];
  };
  components: ComponentStyle[];
  layout: {
    spacingScale: string[];
    gridColumns: number;
    /** 레거시 문자열 필드 — 신규 데이터는 maxContentWidthByViewport를 쓴다. */
    maxContentWidth: string;
    whitespacePhilosophy: string;
    /** 선택한 컨테이너 프리셋 키. */
    presetKey?: LayoutPresetKey;
    /** 뷰포트별 최대 콘텐츠 너비(px). */
    maxContentWidthByViewport?: LayoutViewportWidths;
    /** 사용자가 직접 입력한 custom 프리셋 값 — 프로젝트당 1슬롯. */
    customWidths?: LayoutViewportWidths;
    /** 이 레이아웃을 이렇게 잡은 기획 의도 메모. */
    intent?: string;
  };
  elevation: {
    shadows: { level: string; value: string; usage: string }[];
    surfaceHierarchy: string;
  };
  guidelines: {
    dos: string[];
    donts: string[];
  };
  responsive: {
    breakpoints: { name: string; minWidth: string }[];
    touchTargetMin: string;
    collapsingStrategy: string;
  };
  uxWriting: {
    toneLevel: 1 | 2 | 3 | 4 | 5;
    glossary: GlossaryEntry[];
    errorMessageStyle: "descriptive" | "concise" | "friendly";
  };
  presetSelection?: {
    moodPreset?: string;
    colorPreset?: string;
    darkMode?: boolean;
    references?: string[];
  };
}

// ─── 메모 ───

export interface MemoMention {
  elementId: string;
  /** 요소 alias 또는 Type N. 요소가 나중에 삭제돼도 표시용으로 유지. */
  label: string;
}

export interface Memo {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  /** 답글인 경우 루트 스레드 메모의 id. 없으면 최상위 스레드(reply의 reply는 허용하지 않음). */
  parentId?: string;
  /** 최상위 스레드에서만 사용. 현재 화면의 UI 요소를 배지로 언급. */
  mentions?: MemoMention[];
}

export type PhaseMemos = Record<number, Memo[]>;

// ─── 전체 페이즈 데이터 ───

// ─── AI 에이전트 전용 페이즈 (Phase 2~6, type === "agent") ───

export type AgentSubType = "claude-subagent" | "openclaw";

export interface AgentRequirementsClaudeExtension {
  autonomyLevel: "read-only" | "suggest" | "plan-then-execute" | "autonomous";
  permissionBoundary: string;
  contextScope: "project" | "user" | "both";
  maxConcurrentAgents?: number;
}

export interface AgentRequirementsOpenclawExtension {
  autonomyLevel: "passive" | "reactive" | "proactive" | "autonomous";
  alwaysOnRequired: boolean;
  messagingChannels: string[];
  hardwareTarget: string;
  sandboxRequired: boolean;
}

/** Phase 2 (agent): 공통 요구사항 + 하위 유형 확장 */
export interface AgentRequirementsPhase extends RequirementsPhase {
  claude?: AgentRequirementsClaudeExtension;
  openclaw?: AgentRequirementsOpenclawExtension;
}

export interface AgentDefinition {
  id: string;
  name: string;
  role: string;
  description: string;
  model: "inherit" | "opus" | "sonnet" | "haiku";
  toolAccess: string[];
  permissionMode: "default" | "plan" | "bypassPermissions";
  memoryScope: "user" | "project" | "none";
}

export interface PipelineStep {
  id: string;
  from: string;
  to: string;
  trigger: string;
  dataFormat: string;
}

export interface ClaudePipelinePhase {
  pattern: "single" | "orchestrator-subagent" | "explore-plan-execute" | "custom";
  agents: AgentDefinition[];
  delegationRules: string[];
  dataFlow: PipelineStep[];
}

export interface OpenClawAgentConfig {
  id: string;
  name: string;
  workspace: string;
  channels: string[];
}

export interface ChannelRoute {
  id: string;
  channel: string;
  agentId: string;
  sessionType: "private" | "group";
}

export interface OpenClawArchitecturePhase {
  workspacePath: string;
  sandboxConfig: {
    enabled: boolean;
    workspaceAccess: "ro" | "rw";
    networkAccess: boolean;
  };
  multiAgent: boolean;
  agents?: OpenClawAgentConfig[];
  channelRouting?: ChannelRoute[];
}

export type AgentArchitecturePhase =
  | { kind: "claude-subagent"; claude: ClaudePipelinePhase }
  | { kind: "openclaw"; openclaw: OpenClawArchitecturePhase };

export interface ClaudeAgentBehavior {
  agentId: string;
  systemPrompt: string;
  coreExpertise: string[];
  responsibilities: string[];
  outputFormat: string;
  constraints: string[];
  color: string;
}

export type OpenClawTonePreset = "efficient" | "thoughtful" | "friendly" | "custom";

export interface HeartbeatTask {
  id: string;
  name: string;
  schedule: string;
  action: string;
  enabled: boolean;
}

export interface OpenClawBehaviorPhase {
  soul: {
    personality: string;
    communicationStyle: string[];
    values: string[];
    boundaries: string[];
    tonePreset?: OpenClawTonePreset;
  };
  identity: {
    agentName: string;
    role: string;
    selfIntroduction: string;
  };
  agents: {
    safetyDefaults: string[];
    sessionStartRules: string[];
    memoryRules: string[];
    sharedSpaceRules: string[];
  };
  user: {
    name: string;
    timezone: string;
    background: string;
    preferences: string[];
    workContext: string;
  };
  heartbeat: HeartbeatTask[];
}

export type AgentBehaviorPhase =
  | { kind: "claude-subagent"; behaviors: ClaudeAgentBehavior[] }
  | { kind: "openclaw"; openclaw: OpenClawBehaviorPhase };

export interface HookDefinition {
  id: string;
  agentId: string;
  hookType: "PreToolUse" | "PostToolUse";
  matcher: string;
  action: string;
  purpose: string;
}

export interface McpServerConfig {
  id: string;
  name: string;
  url: string;
  description: string;
}

export interface ClaudeToolsPhase {
  globalTools: string[];
  agentTools: { agentId: string; tools: string[] }[];
  hooks: HookDefinition[];
  mcpServers?: McpServerConfig[];
}

export interface ChannelConfig {
  id: string;
  platform:
    | "whatsapp"
    | "telegram"
    | "discord"
    | "slack"
    | "signal"
    | "teams"
    | "irc"
    | "other";
  identifier: string;
  purpose: string;
  allowedContacts?: string[];
}

export interface SkillConfig {
  id: string;
  name: string;
  source: string;
  description: string;
  enabled: boolean;
}

export interface OpenClawToolsPhase {
  channels: ChannelConfig[];
  tools: {
    enabled: string[];
    disabled: string[];
    notes: string;
  };
  skills: SkillConfig[];
  gatewayConfig: {
    bindHost: string;
    port: number;
    authToken?: string;
  };
}

export type AgentToolsPhase =
  | { kind: "claude-subagent"; claude: ClaudeToolsPhase }
  | { kind: "openclaw"; openclaw: OpenClawToolsPhase };

export interface RiskScenario {
  id: string;
  scenario: string;
  impact: "low" | "medium" | "high" | "critical";
  mitigation: string;
}

export interface AgentTestCase {
  id: string;
  name: string;
  input: string;
  expectedBehavior: string;
  forbiddenBehavior: string;
}

export interface AgentSafetyPhase {
  riskScenarios: RiskScenario[];
  humanInTheLoop: string[];
  testCases: AgentTestCase[];
  rollbackPlan: string;
}

export interface PhaseData {
  overview: OverviewPhase;
  userScenario: UserScenarioPhase;
  requirements: RequirementsPhase;
  infoArchitecture: InfoArchitecturePhase;
  screenDesign: ScreenDesignPhase;
  dataModel: DataModelPhase;
  designSystem: DesignSystemPhase;
  /** type === "agent"일 때 Phase 2~6 원천 데이터 */
  agentRequirements?: AgentRequirementsPhase;
  agentArchitecture?: AgentArchitecturePhase;
  agentBehavior?: AgentBehaviorPhase;
  agentTools?: AgentToolsPhase;
  agentSafety?: AgentSafetyPhase;
  memos: PhaseMemos;
}

// ─── DB 엔티티 ───

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export type ProjectType = "web" | "mobile" | "cli" | "agent";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  type: ProjectType;
  /** type === "agent"일 때 필수 */
  agentSubType?: AgentSubType;
  currentPhase: number;
  phases: PhaseData;
  createdAt: number;
  updatedAt: number;
}

// ─── 페이즈 메타 ───

export const PHASE_KEYS = [
  "overview",
  "userScenario",
  "requirements",
  "infoArchitecture",
  "screenDesign",
  "dataModel",
  "designSystem",
] as const;

export type PhaseKey = (typeof PHASE_KEYS)[number];

/** 에이전트 프로젝트 단일 페이즈 JSON / 붙여넣기용 키 (인덱스 0~6) */
export const AGENT_PHASE_KEYS = [
  "overview",
  "userScenario",
  "agentRequirements",
  "agentArchitecture",
  "agentBehavior",
  "agentTools",
  "agentSafety",
] as const;

export type AgentPhaseKey = (typeof AGENT_PHASE_KEYS)[number];

export const AGENT_PHASE_LABELS: Record<number, string> = {
  0: "기획 개요",
  1: "유저 시나리오",
  2: "에이전트 요구사항",
  3: "에이전트 아키텍처",
  4: "에이전트 행동 설계",
  5: "연동 & 도구 설계",
  6: "안전 & 테스트 설계",
};

export const PHASE_LABELS: Record<number, string> = {
  0: "기획 개요",
  1: "유저 시나리오",
  2: "요구사항 명세",
  3: "정보 구조",
  4: "화면 설계",
  5: "데이터 모델",
  6: "디자인 시스템",
};
