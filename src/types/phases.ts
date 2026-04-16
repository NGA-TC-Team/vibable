// ─── Phase 0: 기획 개요 ───

export interface OverviewPhase {
  projectName: string;
  background: string;
  businessGoals: string[];
  targetUsers: string;
  techStack?: string;
}

// ─── Phase 1: 유저 시나리오 ───

export interface Persona {
  id: string;
  name: string;
  role: string;
  painPoints: string[];
  goals: string[];
}

export interface UserStory {
  id: string;
  personaId: string;
  asA: string;
  iWant: string;
  soThat: string;
}

export interface UserScenarioPhase {
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

export interface RequirementsPhase {
  functional: FunctionalRequirement[];
  nonFunctional: NonFunctionalRequirement[];
}

// ─── Phase 3: 정보 구조 ───

export interface SitemapNode {
  id: string;
  label: string;
  path?: string;
  children: SitemapNode[];
}

export interface FlowStep {
  id: string;
  screenRef?: string;
  action: string;
  next: string[];
}

export interface UserFlow {
  id: string;
  name: string;
  steps: FlowStep[];
}

export interface InfoArchitecturePhase {
  sitemap: SitemapNode[];
  userFlows: UserFlow[];
  globalNavRules: string[];
}

// ─── Phase 4: 화면 설계 ───

export interface ErrorState {
  type: "network" | "validation" | "permission" | "notFound" | "custom";
  description: string;
}

export interface Interaction {
  element: string;
  trigger: string;
  action: string;
}

export interface ScreenPage {
  id: string;
  name: string;
  route?: string;
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
  relationType?: "1:1" | "1:N" | "N:M";
}

export interface Entity {
  id: string;
  name: string;
  fields: EntityField[];
}

export interface DataModelPhase {
  entities: Entity[];
  storageStrategy: "local" | "remote" | "hybrid";
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

export interface ComponentStyle {
  component: string;
  variants: string;
  borderRadius: string;
  notes?: string;
}

export interface GlossaryEntry {
  term: string;
  avoid: string;
  context?: string;
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
    maxContentWidth: string;
    whitespacePhilosophy: string;
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

export interface Memo {
  id: string;
  content: string;
  createdAt: number;
  updatedAt: number;
}

export type PhaseMemos = Record<number, Memo[]>;

// ─── 전체 페이즈 데이터 ───

export interface PhaseData {
  overview: OverviewPhase;
  userScenario: UserScenarioPhase;
  requirements: RequirementsPhase;
  infoArchitecture: InfoArchitecturePhase;
  screenDesign: ScreenDesignPhase;
  dataModel: DataModelPhase;
  designSystem: DesignSystemPhase;
  memos: PhaseMemos;
}

// ─── DB 엔티티 ───

export interface Workspace {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
}

export type ProjectType = "web" | "mobile" | "cli";

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  type: ProjectType;
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

export const PHASE_LABELS: Record<number, string> = {
  0: "기획 개요",
  1: "유저 시나리오",
  2: "요구사항 명세",
  3: "정보 구조",
  4: "화면 설계",
  5: "데이터 모델",
  6: "디자인 시스템",
};
