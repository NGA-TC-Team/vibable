<p align="center">
  <img src="public/vibable-logo.png" width="128" height="128" alt="Vibable logo" />
</p>

<h1 align="center">Vibable</h1>

<p align="center">
  <strong>Plan it before you prompt it.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="MIT License" /></a>
  <img src="https://img.shields.io/badge/Next.js-16-black?logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/React-19-61dafb?logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Bun-1.x-fbf0df?logo=bun&logoColor=black" alt="Bun" />
</p>

<br />

<!-- TODO: insert screenshot -->

---

## Table of Contents

1. [Overview](#1-overview)
2. [Quick Start](#2-quick-start)
3. [Architecture Overview](#3-architecture-overview)
4. [Project Structure](#4-project-structure)
5. [Workflow Tracks and Phases](#5-workflow-tracks-and-phases)
6. [Data Model and Schema](#6-data-model-and-schema)
7. [Intelligent IA Layer](#7-intelligent-ia-layer)
8. [Preview System](#8-preview-system)
9. [Export System](#9-export-system)
10. [State Management](#10-state-management)
11. [Coding Conventions](#11-coding-conventions)
12. [Testing](#12-testing)
13. [Tech Stack Reference](#13-tech-stack-reference)
14. [Contributing](#14-contributing)
15. [License](#15-license)

---

## 1. Overview

Vibable is a local-first, browser-only planning editor that structures product specifications and AI-agent architectures across 7 sequential phases before handing off to an AI coding system (Claude Code, OpenClaw, etc.).

Two workflow tracks are available at project creation time: the **App Track** for web, mobile, and CLI projects, and the **Agent Track** for Claude Subagent or OpenClaw configurations. All data persists entirely in the browser's IndexedDB — no server, no account, no network required. The editor works offline and can export plans as JSON, Markdown, PDF, or ready-to-deploy agent configuration bundles.

**Key properties at a glance:**

| Property | Value |
|----------|-------|
| App version | `0.1.0` |
| Schema version | `2` |
| Storage backend | IndexedDB (Dexie v4) |
| Auto-save debounce | 500 ms |
| URL share cap | 64 KB (lz-string compressed) |
| Max sitemap depth | 4 levels |
| UI language | Korean (`lang="ko"`) |

---

## 2. Quick Start

### Prerequisites

| Tool | Minimum Version | Notes |
|------|-----------------|-------|
| Node.js | 20 | LTS recommended |
| pnpm | 10 | Package manager |
| Bun | 1.x | Dev runner (`playwright.config.ts` uses `bun run dev`) |

### Install and Run

```bash
git clone https://github.com/NGA-TC-Team/vibable.git
cd vibable

pnpm install        # install dependencies

bun run dev         # start development server (recommended)
# open http://localhost:3000
```

### Available Scripts

| Command | Runner | Description |
|---------|--------|-------------|
| `dev` | `bun run dev` | Start Next.js development server |
| `build` | `bun run build` | Production build |
| `start` | `bun run start` | Start production server |
| `lint` | `bun run lint` | Run ESLint |
| `test` | `bun run test` | Run Vitest unit tests (single run) |
| `test:watch` | `bun run test:watch` | Run Vitest in watch mode |
| `test:e2e` | `bun run test:e2e` | Run Playwright E2E tests |
| `test:all` | `bun run test:all` | Vitest + Playwright (sequential) |

> **Note:** `pnpm` manages packages. `bun run` executes scripts. Both are required.

---

## 3. Architecture Overview

### 3.1 High-Level Architecture

<!-- TODO: insert screenshot -->

```
  Browser (100% client-side)
  ┌──────────────────────────────────────────────────────────────┐
  │                                                              │
  │  Next.js 16 App Router (RSC shell — no "use client" on      │
  │  page.tsx files per AGENTS.md convention)                    │
  │                                                              │
  │  ┌──────────────────┐  resizable  ┌──────────────────────┐  │
  │  │   Form Panel     │◄──────────►│   Preview Panel       │  │
  │  │  (phases/)       │             │   (preview/)          │  │
  │  └────────┬─────────┘             └──────────────────────┘  │
  │           │ updatePhaseData()                                │
  │  ┌────────▼──────────────────────────────────┐              │
  │  │          Zustand editor-store              │  in-memory   │
  │  │  currentPhase · phaseData · UI toggles     │              │
  │  └────────┬──────────────────────────────────┘              │
  │           │ useAutoSave hook (500 ms debounce)               │
  │  ┌────────▼──────────────────────────────────┐              │
  │  │     TanStack Query  +  Dexie (IndexedDB)  │  persistent  │
  │  │     workspaces / projects tables           │              │
  │  └───────────────────────────────────────────┘              │
  └──────────────────────────────────────────────────────────────┘
```

### 3.2 Data Flow (Write Path)

1. User edits a form field → component calls `updatePhaseData(updater)` on `useEditorStore`
2. Zustand runs the updater and publishes a new `phaseData` snapshot
3. `use-auto-save.hook.ts` subscribes to the store; the 500 ms debounced timer fires
4. `updateProject.mutateAsync({ id, phases: phaseData })` via TanStack Query
5. Dexie writes `projects.put(...)` to IndexedDB

**Flush on hide:** `use-auto-save` attaches `visibilitychange` and `beforeunload` listeners that bypass the debounce and flush immediately.

**Retry on failure:** up to 3 retries with a 3 000 ms delay (`AUTOSAVE_MAX_RETRIES = 3`, `AUTOSAVE_RETRY_DELAY_MS = 3000`). Save status is reflected in `EditorState.saveStatus: "idle" | "saving" | "saved" | "error"`.

### 3.3 URL Sharing Flow

```
phaseData (stripped of memos)
  → JSON.stringify
  → lz-string.compressToEncodedURIComponent
  → URL: /?data=<encoded>&name=<name>&type=<type>&sub=<agentSubType>
  → (recipient)
  → lz-string.decompressFromEncodedURIComponent
  → JSON.parse
  → phaseDataSchema.safeParse   ← Zod validation
  → load into editor (read-only)
```

Payload is capped at **64 KB** (`SHARE_URL_MAX_BYTES`). Larger projects require JSON export + manual import.

### 3.4 URL Routing

| Route | Component | Purpose |
|-------|-----------|---------|
| `/` | `app/page.tsx` | Redirect to `/workspace` |
| `/workspace` | `app/workspace/page.tsx` | Project list |
| `/workspace/[projectId]` | `app/workspace/[projectId]/page.tsx` | Full editor |
| `/workspace/shared` | `app/workspace/shared/page.tsx` | Read-only shared view |

---

## 4. Project Structure

```
vibable/
├── e2e/                              # Playwright E2E test suites (10 files)
├── specs/                            # Internal planning documents
├── public/                           # Static assets (logos, fonts, OG images)
│   ├── ai-provider-logo/             # Claude, Gemini, Grok, OpenAI icons
│   └── fonts/                        # Noto Sans KR (used in PDF export)
│
└── src/
    ├── app/                          # Next.js App Router
    │   ├── layout.tsx                # Root layout (fonts, metadata, providers)
    │   ├── page.tsx                  # / → redirect to /workspace
    │   ├── providers.tsx             # TanStack Query + ThemeProvider wrapper
    │   ├── loading.tsx               # Global loading UI (meteor animation)
    │   ├── error.tsx                 # Error boundary UI
    │   ├── not-found.tsx             # 404 page
    │   └── workspace/
    │       ├── page.tsx              # Project list
    │       ├── [projectId]/          # Editor for a project
    │       └── shared/               # Shared URL read-only view
    │
    ├── components/
    │   ├── editor/                   # Editor chrome
    │   │   ├── editor-layout.tsx     # ResizablePanelGroup host
    │   │   ├── phase-nav.tsx         # Phase stepper
    │   │   ├── sidebar-meteor.tsx    # Decorative meteor animation
    │   │   └── memo-modal.tsx        # Per-phase sticky notes
    │   │
    │   ├── phases/                   # 19 phase form components
    │   │   ├── overview-form.tsx
    │   │   ├── user-scenario-form.tsx
    │   │   ├── requirements-form.tsx
    │   │   ├── info-architecture-form.tsx
    │   │   ├── screen-design-form.tsx
    │   │   ├── screen-design-element-list.tsx
    │   │   ├── data-model-form.tsx
    │   │   ├── design-system-form.tsx
    │   │   ├── agent-requirements-form.tsx
    │   │   ├── claude-pipeline-form.tsx
    │   │   ├── claude-behavior-form.tsx
    │   │   ├── claude-tools-form.tsx
    │   │   ├── openclaw-architecture-form.tsx
    │   │   ├── openclaw-behavior-form.tsx
    │   │   ├── openclaw-tools-form.tsx
    │   │   └── agent-safety-form.tsx
    │   │
    │   ├── preview/                  # Real-time preview panels
    │   │   ├── sitemap-diagram.tsx   # React Flow + dagre sitemap tree
    │   │   ├── user-flow-diagram.tsx # React Flow + dagre user flow graph
    │   │   ├── info-arch-table-view.tsx
    │   │   ├── info-arch-diagnostics-view.tsx
    │   │   ├── requirements-preview.tsx
    │   │   ├── screen-design-preview.tsx
    │   │   └── mockup/               # Wireframe canvas
    │   │       ├── mockup-canvas.tsx         # Interactive canvas host
    │   │       ├── mockup-element.tsx        # Individual element renderer
    │   │       ├── element-palette.tsx       # Drag source palette
    │   │       ├── container-width-picker.tsx
    │   │       ├── drag-anchor.ts
    │   │       └── sketch/
    │   │           ├── rough-primitives.tsx  # RoughJS hand-drawn layer
    │   │           └── sketch-renderers.tsx  # 30+ element type renderers
    │   │
    │   ├── export/                   # Export generators
    │   │   ├── export-buttons.tsx            # UI dropdown menu
    │   │   ├── phase-md-generator.ts         # Per-phase Markdown
    │   │   ├── design-md-generator.ts        # DESIGN.md (design system)
    │   │   ├── pdf-document.tsx              # React PDF renderer
    │   │   ├── pdf-export-progress-toast.tsx # Progress feedback
    │   │   ├── claude-agent-generator.ts     # Claude Subagent ZIP files
    │   │   └── openclaw-workspace-generator.ts # OpenClaw workspace files
    │   │
    │   ├── workspace/                # Project CRUD UI
    │   └── ui/                       # shadcn/ui primitive components
    │
    ├── hooks/                        # Custom hooks (must be *.hook.ts files)
    │   ├── use-auto-save.hook.ts     # Debounced save + flush-on-hide
    │   ├── use-backup.hook.ts        # Workspace backup/restore
    │   ├── use-export.hook.ts        # Export orchestration
    │   ├── use-phase.hook.ts         # Phase data accessors
    │   ├── use-project.hook.ts       # Project CRUD via TanStack Query
    │   ├── use-share.hook.ts         # lz-string share link
    │   ├── use-mockup.hook.ts        # Mockup canvas state
    │   ├── use-json-paste.hook.ts    # Clipboard JSON import
    │   └── use-meteor-enabled.hook.ts # localStorage toggle for meteor UI
    │
    ├── services/
    │   └── store/
    │       ├── editor-store.ts       # Zustand editor state (primary store)
    │       ├── app-store.ts          # App-level state
    │       └── system-store.ts       # System-level toggles (reduced motion etc.)
    │
    ├── lib/
    │   ├── db.ts                     # Dexie instance ("vibable" DB, v1)
    │   ├── constants.ts              # APP_VERSION, SCHEMA_VERSION, debounce timings
    │   ├── schemas/                  # 13 Zod v4 schemas (one per phase domain)
    │   ├── templates/                # Default PhaseData per project type
    │   ├── presets/                  # Design system presets
    │   ├── ia-to-screen-design.ts    # Phase 3 → Phase 4 auto-seed
    │   ├── info-arch-diagnostics.ts  # 14 IA quality diagnostic checks
    │   ├── info-arch-score.ts        # IA readiness score (0–100)
    │   ├── layout-presets.ts         # 4 responsive layout presets
    │   ├── agent-zip.ts              # fflate ZIP builder for agent bundles
    │   ├── download.ts               # Browser download utilities
    │   ├── export-phase-scope.ts     # Phase key resolver per project type
    │   ├── strip-memos.ts            # Remove memo data before sharing/export
    │   ├── element-prop-schemas.ts   # Prop schemas for 30+ mockup element types
    │   ├── overview-groups.ts        # SuccessMetricGroup / MilestoneGroup helpers
    │   ├── mockup-element-label.ts   # Element display label utilities
    │   ├── example-project.ts        # Sample project data for onboarding
    │   └── utils.ts
    │
    └── types/
        └── phases.ts                 # Master TypeScript type definitions (~900 lines)
```

---

## 5. Workflow Tracks and Phases

### 5.1 App Track (`type: "web" | "mobile" | "cli"`)

```
  Phase 0          Phase 1          Phase 2          Phase 3
  Overview    ──►  User        ──►  Requirements ──►  Information
                   Scenarios                          Architecture
                                                           │
                                                           │ auto-seed
                                                           ▼
  Phase 6          Phase 5          Phase 4
  Design      ◄──  Data Model  ◄──  Screen Design
  System
```

**Phase 3 → 4 auto-seed:** Clicking "Seed from IA" in Phase 3 calls `seedScreenDesignFromIa()` which flattens every sitemap node into a `ScreenPage` stub, derives `inPages`/`outPages` from user flow step connections, and appends only new pages (existing ones are preserved by id match).

#### App Track Phase Descriptions

| # | Phase | Key Content |
|---|-------|-------------|
| 0 | **Overview** | Project name, elevator pitch, background, core value proposition, business goals, target users, scope (MVP/Full/Prototype), competitors, constraints, success metrics, timeline, tech stack |
| 1 | **User Scenarios** | Personas (demographics, behaviors, goals, pain points), user stories (As a / I want / So that), success and failure scenarios |
| 2 | **Requirements** | Functional requirements (priority: must/should/could/won't, acceptance criteria, rationale, source), non-functional requirements, constraints, glossary, clarifications |
| 3 | **Information Architecture** | Sitemap (nested tree, screen types, audience, primary entity), user flows (steps with intent, actor, condition, outcome), global navigation rules, roles, entities |
| 4 | **Screen Design** | Screen pages (route, UX intent, states, interactions, in/out pages), mockup canvas (3 viewports × 4 screen states), interaction definitions |
| 5 | **Data Model** | Entities with typed fields and relationships, storage strategy (local/remote/hybrid/distributed) |
| 6 | **Design System** | Visual theme, color tokens (hex + OKLCH), typography scale, component style variants, layout (spacing, grid, max-width), elevation, UX writing guidelines |

### 5.2 Agent Track (`type: "agent"`, `agentSubType: "claude-subagent" | "openclaw"`)

```
  Phase 0          Phase 1          Phase 2
  Overview    ──►  User        ──►  Agent Requirements
                   Scenarios        (extends RequirementsPhase with
                                    Claude or OpenClaw extensions)

  Phase 3          Phase 4          Phase 5          Phase 6
  Agent       ──►  Agent       ──►  Agent       ──►  Safety &
  Architecture     Behavior         Tools            Tests
  (discriminated   (discriminated   (discriminated
   union: kind)     union: kind)     union: kind)
```

**Discriminated union:** Phases 3, 4, and 5 each carry a `kind: "claude-subagent" | "openclaw"` field. Always guard on `kind` before reading sub-type fields.

#### Agent Track Phase Descriptions

| # | Phase | Claude Subagent | OpenClaw |
|---|-------|-----------------|----------|
| 0 | Overview | Same as App Track | Same as App Track |
| 1 | User Scenarios | Same as App Track | Same as App Track |
| 2 | Agent Requirements | + `autonomyLevel`, `permissionBoundary`, `contextScope`, `maxConcurrentAgents` | + `autonomyLevel`, `alwaysOnRequired`, `messagingChannels`, `hardwareTarget`, `sandboxRequired` |
| 3 | Architecture | Pipeline pattern, agent list, delegation rules, data flow | Workspace path, sandbox config, multi-agent topology, channel routing |
| 4 | Behavior | System prompts, core expertise, responsibilities, output format, constraints, color | SOUL (personality, style, values, boundaries), IDENTITY (name, role, intro), heartbeat tasks |
| 5 | Tools | Global tools, per-agent tools, hooks, MCP server configs | Channels (WhatsApp/Telegram/Discord/Slack/etc.), tools (enabled/disabled), skills, gateway config |
| 6 | Safety | Risk scenarios (low/medium/high/critical), human-in-the-loop checkpoints, test cases, rollback plan | Same |

---

## 6. Data Model and Schema

### 6.1 Database

Dexie v4 wraps IndexedDB. Database name: `"vibable"`, schema version: `1`.

| Table | Primary Key | Indexes | TypeScript Type |
|-------|-------------|---------|-----------------|
| `workspaces` | `id` (string UUID) | `createdAt` | `Workspace` |
| `projects` | `id` (string UUID) | `workspaceId`, `updatedAt` | `Project` |

A default workspace (`id = "default"`, name: `"내 워크스페이스"`) is created on first launch via `ensureDefaultWorkspace()` in `src/lib/db.ts`.

### 6.2 Core Entity Types

Full definitions live in `src/types/phases.ts`.

```typescript
// Top-level DB entity
interface Project {
  id: string;
  workspaceId: string;
  name: string;
  type: "web" | "mobile" | "cli" | "agent";
  agentSubType?: "claude-subagent" | "openclaw"; // required when type === "agent"
  currentPhase: number;    // 0–6, last-viewed phase index
  phases: PhaseData;       // all phase content
  createdAt: number;       // Unix ms
  updatedAt: number;       // Unix ms
}

// All phase content (nested in Project.phases)
interface PhaseData {
  // App Track — always present
  overview: OverviewPhase;
  userScenario: UserScenarioPhase;
  requirements: RequirementsPhase;
  infoArchitecture: InfoArchitecturePhase;
  screenDesign: ScreenDesignPhase;
  dataModel: DataModelPhase;
  designSystem: DesignSystemPhase;
  // Agent Track — only when type === "agent"
  agentRequirements?: AgentRequirementsPhase;
  agentArchitecture?: AgentArchitecturePhase; // discriminated union on .kind
  agentBehavior?: AgentBehaviorPhase;         // discriminated union on .kind
  agentTools?: AgentToolsPhase;               // discriminated union on .kind
  agentSafety?: AgentSafetyPhase;
  // Internal editor state (stripped before share/export)
  memos: PhaseMemos; // Record<phaseIndex, Memo[]>
}
```

### 6.3 Key Sub-Types Reference

| Type | Defined in | Notable Fields |
|------|-----------|----------------|
| `SitemapNode` | `types/phases.ts` | `children: SitemapNode[]` (recursive, max depth 4), `screenType`, `purpose`, `primaryTask`, `audience[]`, `primaryEntity` |
| `UserFlow` | `types/phases.ts` | `goal`, `primaryActor`, `startScreen`, `steps: FlowStep[]`, `successEndings: string[]`, `failureEndings: string[]` |
| `FlowStep` | `types/phases.ts` | `screenRef` (sitemap node id), `intent: FlowStepIntent`, `actor`, `condition`, `outcome`, `next: string[]` |
| `ScreenPage` | `types/phases.ts` | `route`, `entityIds[]`, `uxIntent`, `states`, `interactions[]`, `inPages[]`, `outPages[]`, `mockup?: MockupViewport`, `mockupByState?` |
| `MockupElement` | `types/phases.ts` | `type: MockupElementType` (33 variants), `props`, `children[]`, `alias`, `designNote` |
| `EntityField` | `types/phases.ts` | `type`, `required`, `relationType`, `onDelete`, `onUpdate` |
| `AgentDefinition` | `types/phases.ts` | `model`, `toolAccess[]`, `permissionMode`, `memoryScope` |

### 6.4 Zod Validation

All phase data is validated at runtime using **Zod v4**. Schemas live in `src/lib/schemas/` (13 files). The root `phaseDataSchema` in `phase-data.ts` composes all per-phase schemas using `.default()` factories so that an empty object always parses to a valid `PhaseData` — agents and App Track phases that do not apply are simply `undefined`.

```typescript
// Every import from the editor or URL share goes through:
const result = phaseDataSchema.safeParse(raw);
if (!result.success) { /* show error, reject import */ }
```

Schema constants in `src/lib/constants.ts`:

```typescript
export const APP_VERSION    = "0.1.0";
export const SCHEMA_VERSION = 2;       // increment when PhaseData shape changes
```

---

## 7. Intelligent IA Layer

Phase 3 (Information Architecture) has three utility modules that go beyond form storage.

### 7.1 Diagnostic Engine — `src/lib/info-arch-diagnostics.ts`

`diagnoseInfoArchitecture(ia)` runs 14 structural checks and returns `IaDiagnostic[]`.

| Kind | Severity | Description |
|------|----------|-------------|
| `orphan-sitemap-node` | info | Sitemap node not referenced by any flow step |
| `missing-screen-ref` | warning | Flow step has no `screenRef` |
| `unknown-screen-ref` | warning | Step `screenRef` points to a non-existent sitemap node id |
| `dangling-next` | warning | Step `next[]` contains a step id not found in the same flow |
| `flow-without-steps` | warning | Flow has zero steps |
| `unreachable-step` | warning | Step cannot be reached from the flow's start step |
| `node-missing-purpose` | info | Sitemap node `purpose` field is empty |
| `flow-missing-goal` | info | Flow `goal` field is empty |
| `flow-no-endings-marked` | info | Neither `successEndings` nor `failureEndings` is set |
| `review-screen-unassigned` | info | `screenType === "review"` node has an empty `audience[]` |
| `nav-rule-missing-body` | warning | Global nav rule `rule` text is empty |
| `nav-rule-unknown-screen-type` | warning | Nav rule `appliesTo.screenTypes` contains an invalid value |
| `unknown-role-ref` | info | `audience`/`primaryActor`/`actor` references a name not in `ia.roles` |
| `unknown-entity-ref` | info | `primaryEntity` references a name not in `ia.entities` |

`groupDiagnostics(diagnostics)` returns `Record<IaDiagnosticKind, IaDiagnostic[]>` for grouped display.

### 7.2 Quality Scoring — `src/lib/info-arch-score.ts`

`computeIaQualityScore(ia)` returns an `IaQualityScore` with an `overall` (0–100) and five sub-scores:

| Dimension | Weight | Measures |
|-----------|--------|---------|
| `structure` | 50% | Node count + `screenType` assignment rate |
| `intent` | 20% | `purpose` and `primaryTask` fill rate |
| `flowCoverage` | 20% | `screenRef` fill rate + goal and endpoint completeness |
| `connectivity` | 20% | Starts at 100; deducts per warning diagnostic |
| `governance` | 20% | Nav rule fill rate + roles/entities defined |

The score drives the in-editor "IA readiness" badge. Score ≥ 80 shows "다음 페이즈로 넘어갈 준비가 됐어요."

### 7.3 IA → Screen Design Bridge — `src/lib/ia-to-screen-design.ts`

`seedScreenDesignFromIa(ia, existingPhase, entityNameToId)` behavior:

1. Flattens the recursive sitemap tree into a flat list of `SitemapNode`
2. Skips nodes whose `id` already exists in `existingPhase.pages` (idempotent — safe to call multiple times)
3. Builds `inPages`/`outPages` by traversing all `UserFlow` step connections
4. Resolves `primaryEntity` name → entity `id` via the `entityNameToId` map (sourced from Data Model phase)
5. Returns `{ phase: ScreenDesignPhase, added: string[], skipped: string[] }` — callers show a toast with counts

---

## 8. Preview System

### 8.1 Diagram Previews

| Phase | View | Component | Library |
|-------|------|-----------|---------|
| Phase 3 — Sitemap | `infoArchView: "sitemap"` | `sitemap-diagram.tsx` | React Flow + dagre |
| Phase 3 — User Flow | `infoArchView: "userFlow"` | `user-flow-diagram.tsx` | React Flow + dagre |
| Phase 3 — Diagnostics | `infoArchView: "diagnostics"` | `info-arch-diagnostics-view.tsx` | Plain list |
| Phase 3 — Table | `infoArchDisplayMode: "table"` | `info-arch-table-view.tsx` | Plain table |
| Phase 5 — Data Model ER | — | `data-model-preview.tsx` | React Flow + dagre |

View is controlled by `infoArchView` and `infoArchDisplayMode` in `useEditorStore`.

### 8.2 Mockup Canvas (Phase 4)

<!-- TODO: insert screenshot -->

The canvas is structured as a **3 × 4 matrix**: viewport tabs (mobile / tablet / desktop) × screen state tabs (idle / loading / offline / error). Each cell holds an independent `MockupElement[]` array.

**Element categories and types:**

| Category | Types |
|----------|-------|
| Layout | `header`, `sidebar`, `card`, `divider`, `spacer`, `modal`, `tabs`, `grid`, `hstack`, `vstack` |
| Content | `heading`, `text`, `image`, `icon`, `avatar`, `badge`, `list`, `table`, `carousel` |
| Input | `button`, `input`, `searchbar`, `toggle`, `checkbox`, `radio`, `dropdown`, `form` |
| Navigation | `bottomNav`, `breadcrumb`, `pagination` |
| Data | `chart`, `map`, `video`, `progressbar` |

**Sketch (RoughJS) rendering layer** (`src/components/preview/mockup/sketch/`):

- `rough-primitives.tsx` — wraps RoughJS to draw hand-drawn rectangles, lines, and ellipses. Uses a deterministic string-to-number seed (`hashSeed()`) for consistent re-renders. Clears children before redrawing to prevent accumulation.
- `sketch-renderers.tsx` — maps each `MockupElementType` to its sketch visual. Large boxes and dividers use rough strokes; small primitives (dots, checks) use plain HTML/CSS to avoid stroke clutter. Fill colors use `color-mix(in oklch, currentColor N%, transparent)` for theme compatibility.

**Interaction:** elements are reordered via `@dnd-kit/sortable`. Double-clicking an element syncs focus to the properties panel.

### 8.3 Layout Presets — `src/lib/layout-presets.ts`

| Preset | Mobile | Tablet | Desktop | Intended for |
|--------|--------|--------|---------|-------------|
| `mobile-first` | 360px | 640px | 840px | Narrow content |
| `saas` | 360px | 720px | 1080px | SaaS dashboards |
| `dashboard` | 360px | 768px | 1440px | Data-dense analytics |
| `marketing` | 360px | 768px | 1200px | Hero/section pages |
| `custom` | user-defined | user-defined | user-defined | Any |

---

## 9. Export System

### 9.1 Export Formats

| Format | Generator | Output File | Available For |
|--------|-----------|-------------|---------------|
| **JSON — full project** | inline serialization | `{name}.json` | All types |
| **JSON — current phase** | `export-phase-scope.ts` | `{name}-phase-{n}.json` | All types |
| **Phase Markdown** | `phase-md-generator.ts` | clipboard or `.md` | All except Phase 4 |
| **DESIGN.md** | `design-md-generator.ts` | `DESIGN.md` | Web, Mobile only |
| **PDF** | `pdf-document.tsx` + `@react-pdf/renderer` | `{name}.pdf` | All types |
| **Claude Agent Bundle ZIP** | `claude-agent-generator.ts` + `agent-zip.ts` | `{name}-claude.zip` | Agent / claude-subagent |
| **OpenClaw Workspace ZIP** | `openclaw-workspace-generator.ts` + `agent-zip.ts` | `{name}-openclaw.zip` | Agent / openclaw |
| **Workspace Backup** | `use-backup.hook.ts` | `vibable_backup_{ts}.vibable` | Workspace-level |

### 9.2 Claude Agent Bundle ZIP

Produced by `buildClaudeAgentFiles(project)` in `claude-agent-generator.ts`.

```
.claude/agents/{agent-slug}.md     # one file per agent
DELEGATION_SNIPPET.md              # paste-ready snippet for CLAUDE.md
```

Each agent file has YAML frontmatter followed by a Markdown body:

```yaml
---
name: "researcher"
description: "Deep web research and synthesis"
model: claude-opus-4-5
tools:
  - WebSearch
  - Read
color: "cyan"
permissionMode: default
memory: project
---

# Researcher

<system prompt text>

## Core Expertise
- ...

## Responsibilities
- ...

## Output Format
...

## Constraints
- ...

## Hooks (if any)
- **PostToolUse** matcher `WebSearch`: ...
```

`DELEGATION_SNIPPET.md` lists all agents with model/tools and the delegation rules from Phase 3 Architecture, ready to paste into a project `CLAUDE.md`.

### 9.3 OpenClaw Workspace ZIP

Produced by `buildOpenClawWorkspaceFiles(project)` in `openclaw-workspace-generator.ts`.

| File | Content |
|------|---------|
| `SOUL.md` | Personality, communication style, values, boundaries |
| `IDENTITY.md` | Agent name, role, self-introduction |
| `AGENTS.md` | Safety defaults, session start rules, memory rules, shared space rules |
| `USER.md` | User name, timezone, background, preferences, work context |
| `TOOLS.md` | Enabled and disabled tool lists with notes |
| `HEARTBEAT.md` | Scheduled tasks (name, schedule, action, enabled flag) |
| `BOOT.md` | First-run checklist placeholder |
| `MEMORY.md` | Long-term memory placeholder |
| `openclaw.json.snippet` | Gateway config (host, port, auth), channel routing, enabled skills — paste into `openclaw.json` |

### 9.4 Backup Format

`.vibable` files are **gzip-compressed JSON** using the browser's `CompressionStream` API with `"gzip"` codec. Falls back to plain `.json` if `CompressionStream` is unavailable. Import merges on conflict by `updatedAt` timestamp (newer wins).

---

## 10. State Management

### 10.1 Zustand Stores

| Store | File | Responsibility |
|-------|------|----------------|
| `useEditorStore` | `services/store/editor-store.ts` | Current phase, phaseData snapshot, all UI toggles |
| `useAppStore` | `services/store/app-store.ts` | App-level state |
| `useSystemStore` | `services/store/system-store.ts` | System-level toggles (e.g., `prefersReducedMotion`) |

### 10.2 EditorState Key Fields

```typescript
type EditorState = {
  currentPhase: number;                        // 0–6
  phaseData: PhaseData | null;                 // live working copy
  projectType: ProjectType;
  agentSubType: AgentSubType | null;
  saveStatus: "idle" | "saving" | "saved" | "error";
  lastSavedAt: number | null;
  activeViewport: "mobile" | "tablet" | "desktop";
  activeScreenPageId: string | null;
  activeScreenState: "idle" | "loading" | "offline" | "error";
  infoArchView: "sitemap" | "userFlow" | "diagnostics";
  infoArchDisplayMode: "diagram" | "table";
  selectedFlowId: string | null;
  selectedMockupElementIds: string[];
  isPreviewCollapsed: boolean;
  isSidebarCollapsed: boolean;
  isPrintPreview: boolean;
  isReadOnly: boolean;
};
```

### 10.3 TanStack Query

Used for async CRUD against Dexie. Mutation keys mirror Dexie operations (`createProject`, `updateProject`, `deleteProject`). On import or restore, `queryClient.invalidateQueries()` refreshes the project list.

### 10.4 nuqs

URL search params (e.g. `?phase=3`) are managed by nuqs for shareable editor state within a session.

---

## 11. Coding Conventions

Conventions are enforced by `AGENTS.md` and `CLAUDE.md` at the project root.

### 11.1 Server vs Client Components

`page.tsx` files **must remain Server Components**. Client logic goes in a sibling `{PageName}Client.tsx`.

```typescript
// ✅ Correct
// app/workspace/page.tsx  — Server Component
import { WorkspaceClient } from "./_components/WorkspaceClient";
export default function WorkspacePage() {
  return <WorkspaceClient />;
}

// app/workspace/_components/WorkspaceClient.tsx
"use client";
export function WorkspaceClient() { /* client logic here */ }

// ❌ Wrong
// app/workspace/page.tsx
"use client"; // forbidden on page.tsx
export default function WorkspacePage() { /* ... */ }
```

### 11.2 Custom Hook Convention

All custom hooks must live in dedicated `src/hooks/{name}.hook.ts` files. Never inline hook logic inside component files.

```typescript
// ✅ Correct
// hooks/use-dashboard.hook.ts
export function useDashboard() { /* ... */ }

// components/DashboardClient.tsx
import { useDashboard } from "@/hooks/use-dashboard.hook";

// ❌ Wrong
// components/DashboardClient.tsx
function DashboardClient() {
  const [state, setState] = useState(...); // inline hook logic
}
```

### 11.3 Functional Style

- No class components, no imperative patterns
- `map` / `filter` / `reduce` instead of `for` / `while`
- Pure functions with explicit side-effect separation
- Immutable updates in Zustand (`set` always creates new objects)

### 11.4 TypeScript Conventions

- Domain types go in `src/types/phases.ts`; module-local types stay colocated
- TypeScript types are inferred from Zod schemas via `z.infer<typeof schema>`
- Agent-track discriminated unions (`kind: "claude-subagent" | "openclaw"`) must be exhaustively guarded before accessing sub-type fields

---

## 12. Testing

### 12.1 Unit Tests (Vitest)

- Config: `vitest.config.ts` — `jsdom` environment, `globals: true`
- Pattern: `src/**/*.test.ts` — test files live in `__tests__/` subdirectories next to source
- Run: `bun run test` (single run) or `bun run test:watch` (watch mode)
- Coverage targets: all pure functions and utilities in `src/lib/`, all custom hooks

### 12.2 E2E Tests (Playwright)

- Config: `playwright.config.ts` — Chromium only, `webServer: { command: "bun run dev" }`, base URL `http://localhost:3000`
- Run: `bun run test:e2e`

| Suite | File | What It Tests |
|-------|------|---------------|
| Workspace CRUD | `workspace.spec.ts` | Create, rename, delete projects |
| Editor Navigation | `editor-navigation.spec.ts` | Phase switching, persistence |
| JSON Export | `export-json.spec.ts` | Full and per-phase JSON download |
| DESIGN.md Export | `export-design-md.spec.ts` | Design system Markdown generation |
| Agent Export | `agent-export.spec.ts` | Claude and OpenClaw ZIP bundles |
| JSON Paste | `json-paste.spec.ts` | Import project from clipboard JSON |
| URL Share | `share.spec.ts` | lz-string share link generate / parse |
| Multi-project | `multi-project.spec.ts` | Multiple projects in one browser |
| Editor Memo | `editor-memo.spec.ts` | Per-phase sticky note CRUD |
| Dark Mode | `dark-mode.spec.ts` | Theme toggle persistence |

### 12.3 CI Configuration

| Setting | Value |
|---------|-------|
| `forbidOnly` | `true` on CI |
| `retries` | `2` on CI, `0` locally |
| `workers` | `1` on CI, unlimited locally |
| `reporter` | `html` |

---

## 13. Tech Stack Reference

| Domain | Library | Version | Purpose |
|--------|---------|---------|---------|
| Framework | Next.js | 16.2.4 | App Router, RSC |
| UI Library | React | 19.2.4 | — |
| Language | TypeScript | ^5 | — |
| Styling | Tailwind CSS | ^4 | Utility classes |
| Components | shadcn/ui + Radix UI | `radix-ui ^1.4.3` | Accessible UI primitives |
| State | Zustand | ^5.0.12 | Editor in-memory state |
| Async State | TanStack Query | ^5.99.0 | DB queries + mutations |
| URL State | nuqs | ^2.8.9 | Search param synchronization |
| Storage | Dexie | ^4.4.2 | IndexedDB ORM |
| Diagrams | @xyflow/react (React Flow) | ^12.10.2 | IA and data model graphs |
| Graph Layout | dagre | ^0.8.5 | Auto-layout for React Flow |
| DnD | @dnd-kit/core + sortable | ^6.3.1 + ^10.0.0 | Mockup canvas drag-and-drop |
| Animation | Framer Motion | ^12.38.0 | UI transitions and loading effects |
| Charts | Recharts | 3.8.0 | Design system preview charts |
| Wireframes | roughjs | ^4.6.6 | Hand-drawn sketch rendering |
| Validation | Zod | ^4.3.6 | Phase data runtime validation |
| PDF Export | @react-pdf/renderer | ^4.5.1 | Client-side PDF generation |
| URL Compression | lz-string | ^1.5.0 | Share link compression (64 KB cap) |
| ZIP | fflate | 0.8.2 | Agent bundle ZIP creation |
| Markdown | react-markdown + remark-gfm | ^10.1.0 | Phase markdown preview |
| Toast | Sonner | ^2.0.7 | Notifications |
| Unit Testing | Vitest | ^4.1.4 | — |
| E2E Testing | @playwright/test | ^1.59.1 | Chromium automation |
| Package Manager | pnpm | 10 | Dependency management |

---

## 14. Contributing

1. Open an issue first to discuss the change before submitting a PR.
2. Follow the ESLint configuration — run `bun run lint` before pushing.
3. Write Vitest unit tests for all pure functions and utilities (`src/lib/`).
4. Write Playwright E2E tests for any new user-facing workflow.
5. **Functional style only** — no class components, no imperative patterns. Use `map`/`filter`/`reduce`.
6. **All custom hooks** must be in dedicated `src/hooks/{name}.hook.ts` files.
7. **`page.tsx` files must remain Server Components** — use a `{PageName}Client.tsx` sibling for client logic.
8. **Agent-track discriminated unions** (`kind: "claude-subagent" | "openclaw"`) must be exhaustively handled with a `kind` guard before reading sub-type fields.

---

## 15. License

[MIT](LICENSE) © 2026 Vibable Contributors

### Third-Party Licenses

| License | Packages |
|---------|---------|
| **MIT** | react, react-dom, next, zustand, zod, framer-motion, @xyflow/react, @dnd-kit/core, @dnd-kit/sortable, recharts, @react-pdf/renderer, @tanstack/react-query, tailwindcss, radix-ui, shadcn, sonner, vaul, cmdk, embla-carousel-react, nuqs, next-themes, react-resizable-panels, react-pdf, react-day-picker, lz-string, date-fns, clsx, tailwind-merge, dagre, input-otp, @base-ui/react, fflate, vitest, eslint, roughjs |
| **Apache-2.0** | class-variance-authority, dexie, @playwright/test, typescript |
| **ISC** | lucide-react |
