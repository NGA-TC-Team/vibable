"use client";

import { useMemo, useState } from "react";
import { FlipHorizontal2, Layers3, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { useMockup } from "@/hooks/use-mockup.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { useSystemRuntime } from "@/services/store/hooks";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ScreenDesignElementList } from "@/components/phases/screen-design-element-list";
import { MockupCanvas } from "./mockup/mockup-canvas";
import { ScreenLinkGroup, type LinkedScreenOption } from "./mockup/screen-link-group";
import { ViewportTabs } from "./mockup/viewport-tabs";
import type {
  MockupElement,
  MockupNoteMode,
  MockupViewportKey,
  ProjectType,
  ScreenPage,
  ScreenState,
} from "@/types/phases";

const STATE_LABELS: Record<ScreenState, string> = {
  idle: "Idle",
  loading: "Loading",
  offline: "Offline",
  error: "Error",
};

const SCREEN_STATES: ScreenState[] = ["idle", "loading", "offline", "error"];
const VIEWPORT_KEYS: MockupViewportKey[] = ["mobile", "tablet", "desktop"];

function ScreenPreviewBackdrop() {
  const { prefersReducedMotion } = useSystemRuntime();
  const cells = useMemo(
    () =>
      Array.from({ length: 72 }, (_, index) => ({
        id: index,
        baseOpacity: 0.08 + ((index * 17) % 11) * 0.018,
        amplitude: 3 + (index % 4) * 2,
        duration: 4.8 + (index % 6) * 0.45,
        delay: (index % 9) * 0.18,
      })),
    [],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(148,163,184,0.035),transparent_42%),linear-gradient(180deg,rgba(248,250,252,0.025),rgba(203,213,225,0.055))]" />
      <div className="absolute inset-x-0 bottom-0 h-44 px-6 pb-5 mask-[linear-gradient(to_top,black_40%,transparent)]">
        <div
          className="grid h-full w-full gap-1.5 opacity-70"
          style={{ gridTemplateColumns: "repeat(18, minmax(0, 1fr))" }}
        >
          {cells.map((cell) => {
            if (prefersReducedMotion) {
              return (
                <div
                  key={cell.id}
                  className="aspect-square rounded-[4px] border border-slate-400/6 bg-slate-300/4"
                  style={{ opacity: cell.baseOpacity }}
                />
              );
            }

            return (
              <motion.div
                key={cell.id}
                className="aspect-square rounded-[4px] border border-slate-400/6 bg-slate-300/4"
                style={{ opacity: cell.baseOpacity }}
                animate={{
                  opacity: [cell.baseOpacity, cell.baseOpacity + 0.08, cell.baseOpacity],
                  y: [0, -cell.amplitude, 0],
                  scaleY: [1, 1.08, 1],
                }}
                transition={{
                  duration: cell.duration,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: cell.delay,
                }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getStateSummary(page: ScreenPage, state: ScreenState) {
  if (state === "error") {
    return page.states.errors
      .map((errorState) => `${errorState.type}: ${errorState.description}`)
      .filter(Boolean)
      .join(" / ");
  }

  return page.states[state];
}

function getPageLabel(page: Pick<ScreenPage, "id" | "name" | "route">) {
  return page.name || page.route || page.id;
}

function getContextKey(viewport: MockupViewportKey, state: ScreenState) {
  return `${state}:${viewport}` as const;
}

function getAllMockupElements(page: ScreenPage) {
  const seen = new Set<string>();
  const allSources = [
    ...VIEWPORT_KEYS.flatMap((viewport) => page.mockup?.[viewport] ?? []),
    ...SCREEN_STATES.flatMap((state) =>
      VIEWPORT_KEYS.flatMap((viewport) => page.mockupByState?.[state]?.[viewport] ?? []),
    ),
  ];

  return allSources.filter((element) => {
    if (seen.has(element.id)) return false;
    seen.add(element.id);
    return true;
  });
}

function getLinkedScreenOptions(
  pages: ScreenPage[],
  linkedPageIds: string[],
): LinkedScreenOption[] {
  return linkedPageIds
    .filter(Boolean)
    .map((pageId) => {
      const page = pages.find((candidate) => candidate.id === pageId);
      return page
        ? { id: page.id, label: getPageLabel(page) }
        : { id: pageId, label: pageId };
    });
}

function resolveContextNote(
  element: MockupElement,
  viewport: MockupViewportKey,
  state: ScreenState,
) {
  const override = element.designNoteByContext?.[getContextKey(viewport, state)];

  if (override?.mode === "none") {
    return { mode: "none" as MockupNoteMode, note: "" };
  }

  if (override?.mode === "custom") {
    return { mode: "custom" as MockupNoteMode, note: override.note ?? "" };
  }

  return { mode: "same" as MockupNoteMode, note: element.designNote ?? "" };
}

function mapPageElements(
  page: ScreenPage,
  mapper: (element: MockupElement) => MockupElement,
): ScreenPage {
  const mapViewport = (mockup?: ScreenPage["mockup"]) =>
    mockup
      ? {
          mobile: mockup.mobile.map(mapper),
          tablet: mockup.tablet.map(mapper),
          desktop: mockup.desktop.map(mapper),
        }
      : mockup;

  return {
    ...page,
    mockup: mapViewport(page.mockup),
    mockupByState: page.mockupByState
      ? {
          idle: mapViewport(page.mockupByState.idle)!,
          loading: mapViewport(page.mockupByState.loading)!,
          offline: mapViewport(page.mockupByState.offline)!,
          error: mapViewport(page.mockupByState.error)!,
        }
      : page.mockupByState,
  };
}

function filterPageElements(
  page: ScreenPage,
  predicate: (element: MockupElement) => boolean,
): ScreenPage {
  const filterElements = (elements: MockupElement[]) => {
    const nextElements = elements.filter(predicate);
    const validIds = new Set(nextElements.map((element) => element.id));

    return nextElements.map((element) => ({
      ...element,
      children: element.children?.filter((childId) => validIds.has(childId)),
    }));
  };

  const filterViewport = (mockup?: ScreenPage["mockup"]) =>
    mockup
      ? {
          mobile: filterElements(mockup.mobile),
          tablet: filterElements(mockup.tablet),
          desktop: filterElements(mockup.desktop),
        }
      : mockup;

  return {
    ...page,
    mockup: filterViewport(page.mockup),
    mockupByState: page.mockupByState
      ? {
          idle: filterViewport(page.mockupByState.idle)!,
          loading: filterViewport(page.mockupByState.loading)!,
          offline: filterViewport(page.mockupByState.offline)!,
          error: filterViewport(page.mockupByState.error)!,
        }
      : page.mockupByState,
  };
}

function ScreenWorkspace({
  pageId,
  projectType,
  inLinks,
  outLinks,
  onNavigateToPage,
  onRemoveElements,
}: {
  pageId: string;
  projectType: ProjectType;
  inLinks: LinkedScreenOption[];
  outLinks: LinkedScreenOption[];
  onNavigateToPage: (pageId: string) => void;
  onRemoveElements: (ids: string[]) => void;
}) {
  const { page, elements, viewport, setViewport, setElements, addElementToAll } =
    useMockup(pageId);

  if (!page) return null;

  return (
    <div className="relative h-full overflow-hidden rounded-[28px] border border-slate-300/18 bg-slate-300/5 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.08)]">
      <ScreenPreviewBackdrop />
      <div className="relative z-10 h-full">
        <MockupCanvas
          page={page}
          elements={elements}
          projectType={projectType}
          viewport={viewport}
          inLinks={inLinks}
          outLinks={outLinks}
          onNavigateToPage={onNavigateToPage}
          onViewportChange={setViewport}
          onMockupChange={setElements}
          onAddElement={addElementToAll}
          onRemoveElements={onRemoveElements}
        />
      </div>
    </div>
  );
}

export function ScreenDesignPreview() {
  const { data, patchData } = usePhaseData("screenDesign");
  const activeScreenPageId = useEditorStore((s) => s.activeScreenPageId);
  const setActiveScreenPageId = useEditorStore((s) => s.setActiveScreenPageId);
  const projectType = useEditorStore((s) => s.projectType);
  const activeViewport = useEditorStore((s) => s.activeViewport);
  const setActiveViewport = useEditorStore((s) => s.setActiveViewport);
  const activeScreenState = useEditorStore((s) => s.activeScreenState);
  const setActiveScreenState = useEditorStore((s) => s.setActiveScreenState);
  const selectedIds = useEditorStore((s) => s.selectedMockupElementIds);
  const setSelectedIds = useEditorStore((s) => s.setSelectedMockupElementIds);
  const clearSelectedIds = useEditorStore((s) => s.clearSelectedMockupElements);
  const toggleSelectedId = useEditorStore((s) => s.toggleSelectedMockupElementId);
  const setSingleSelectedId = useEditorStore((s) => s.setSingleSelectedMockupElementId);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!data) return null;

  if (data.pages.length === 0) {
    return (
      <div className="space-y-4 text-sm">
        <h2 className="text-base font-semibold">화면 설계</h2>
        <p className="text-muted-foreground/50 italic">화면을 추가하세요</p>
      </div>
    );
  }

  const activePageId = activeScreenPageId ?? data.pages[0]?.id ?? null;
  const activePage = data.pages.find((page) => page.id === activePageId) ?? null;

  const allElements = activePage ? getAllMockupElements(activePage) : [];
  const linkedInPages = activePage ? getLinkedScreenOptions(data.pages, activePage.inPages) : [];
  const linkedOutPages = activePage ? getLinkedScreenOptions(data.pages, activePage.outPages) : [];

  const stateSummary = activePage ? getStateSummary(activePage, activeScreenState) : "";

  const updateActivePage = (updater: (page: ScreenPage) => ScreenPage) => {
    if (!activePage) return;

    patchData({
      pages: data.pages.map((page) =>
        page.id === activePage.id ? updater(page) : page,
      ),
    });
  };

  const updateElementEverywhere = (
    elementId: string,
    updater: (element: MockupElement) => MockupElement,
  ) => {
    updateActivePage((page) =>
      mapPageElements(page, (element) =>
        element.id === elementId ? updater(element) : element,
      ),
    );
  };

  const reorderElements = (orderedIds: string[]) => {
    updateActivePage((page) => {
      const reorderViewport = (mockup?: ScreenPage["mockup"]) => {
        if (!mockup) return mockup;
        const sortByIds = (els: MockupElement[]) => {
          const idxMap = new Map(orderedIds.map((id, i) => [id, i]));
          return [...els].sort(
            (a, b) => (idxMap.get(a.id) ?? Infinity) - (idxMap.get(b.id) ?? Infinity),
          );
        };
        return {
          mobile: sortByIds(mockup.mobile),
          tablet: sortByIds(mockup.tablet),
          desktop: sortByIds(mockup.desktop),
        };
      };

      return {
        ...page,
        mockup: reorderViewport(page.mockup),
        mockupByState: page.mockupByState
          ? {
              idle: reorderViewport(page.mockupByState.idle)!,
              loading: reorderViewport(page.mockupByState.loading)!,
              offline: reorderViewport(page.mockupByState.offline)!,
              error: reorderViewport(page.mockupByState.error)!,
            }
          : page.mockupByState,
      };
    });
  };

  const removeElementsEverywhere = (elementIds: string[]) => {
    if (elementIds.length === 0) return;

    const removalSet = new Set(elementIds);
    updateActivePage((page) =>
      filterPageElements(page, (element) => !removalSet.has(element.id)),
    );
    setSelectedIds(selectedIds.filter((id) => !removalSet.has(id)));
  };

  const removeElementEverywhere = (elementId: string) => {
    removeElementsEverywhere([elementId]);
  };

  const updateElementMode = (elementId: string, mode: MockupNoteMode) => {
    updateElementEverywhere(elementId, (element) => {
      const contextKey = getContextKey(activeViewport, activeScreenState);
      const nextOverrides = { ...(element.designNoteByContext ?? {}) };

      if (mode === "same") {
        delete nextOverrides[contextKey];
        return {
          ...element,
          designNoteByContext:
            Object.keys(nextOverrides).length > 0 ? nextOverrides : undefined,
        };
      }

      if (mode === "none") {
        nextOverrides[contextKey] = { mode: "none" };
        return { ...element, designNoteByContext: nextOverrides };
      }

      const previousCustomNote =
        nextOverrides[contextKey]?.mode === "custom"
          ? nextOverrides[contextKey]?.note ?? ""
          : element.designNote ?? "";

      nextOverrides[contextKey] = {
        mode: "custom",
        note: previousCustomNote,
      };

      return { ...element, designNoteByContext: nextOverrides };
    });
  };

  const updateElementNote = (elementId: string, note: string) => {
    const targetElement = allElements.find((element) => element.id === elementId);
    if (!targetElement) return;

    const { mode } = resolveContextNote(targetElement, activeViewport, activeScreenState);

    updateElementEverywhere(elementId, (element) => {
      if (mode === "custom") {
        const contextKey = getContextKey(activeViewport, activeScreenState);
        return {
          ...element,
          designNoteByContext: {
            ...(element.designNoteByContext ?? {}),
            [contextKey]: {
              mode: "custom",
              note,
            },
          },
        };
      }

      return { ...element, designNote: note };
    });
  };

  const handleListSelection = (elementId: string | null, additive = false) => {
    if (!elementId) {
      clearSelectedIds();
      return;
    }

    if (additive) {
      toggleSelectedId(elementId);
      return;
    }

    setSingleSelectedId(elementId);
  };

  const selectedCount = selectedIds.length;

  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className="flex items-center justify-between gap-3">
        <Select value={activePageId ?? undefined} onValueChange={setActiveScreenPageId}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="화면 선택" />
          </SelectTrigger>
          <SelectContent>
            {data.pages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name || "이름 없음"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          type="button"
          aria-label={isFlipped ? "미리보기 앞면 보기" : "미리보기 뒷면 보기"}
          aria-pressed={isFlipped}
          onClick={() => setIsFlipped((prev) => !prev)}
          className="shrink-0"
        >
          <FlipHorizontal2 className="size-4" />
        </Button>
      </div>
      {activePageId && (
        <div className="min-h-0 flex-1" style={{ perspective: 1600 }}>
          <motion.div
            className="relative h-full w-full"
            style={{ transformStyle: "preserve-3d" }}
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.26, ease: [0.22, 0.8, 0.24, 1] }}
          >
            <div
              className={`absolute inset-0 ${isFlipped ? "pointer-events-none" : "pointer-events-auto z-10"}`}
              aria-hidden={isFlipped}
              style={{ backfaceVisibility: "hidden" }}
            >
              <ScreenWorkspace
                key={`${activePageId}-front`}
                pageId={activePageId}
                projectType={projectType}
                inLinks={linkedInPages}
                outLinks={linkedOutPages}
                onNavigateToPage={setActiveScreenPageId}
                onRemoveElements={removeElementsEverywhere}
              />
            </div>
            {activePage && (
              <div
                className={`absolute inset-0 ${isFlipped ? "pointer-events-auto z-10" : "pointer-events-none"}`}
                aria-hidden={!isFlipped}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <div className="flex h-full flex-col gap-3 overflow-hidden rounded-[28px] border bg-card px-4 py-4 shadow-sm">
                  <Card size="sm" className="gap-3 rounded-2xl border py-3 shadow-none">
                    <CardHeader className="gap-2 border-b pb-3">
                      <CardTitle className="flex items-center justify-between gap-3 text-sm">
                        <span>{activePage.name || "이름 없는 화면"}</span>
                        <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                          {STATE_LABELS[activeScreenState]} · {activeViewport}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {activePage.route ? `Route: ${activePage.route}` : "라우트가 아직 없습니다."}
                      </CardDescription>
                      {stateSummary ? (
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {stateSummary}
                        </p>
                      ) : null}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3">
                        <ScreenLinkGroup
                          title="In"
                          pages={linkedInPages}
                          onNavigate={setActiveScreenPageId}
                        />
                        <div className="flex min-w-0 justify-center">
                          <div className="flex items-center justify-center gap-3">
                            <ViewportTabs
                              value={activeViewport}
                              onChange={setActiveViewport}
                              projectType={projectType}
                            />
                            {projectType !== "mobile" ? <div className="h-5 w-px bg-border" /> : null}
                            <ToggleGroup
                              type="single"
                              value={activeScreenState}
                              onValueChange={(value) =>
                                value && setActiveScreenState(value as ScreenState)
                              }
                              size="sm"
                              className="rounded-3xl bg-muted/60 p-1"
                            >
                              {SCREEN_STATES.map((state) => (
                                <ToggleGroupItem
                                  key={state}
                                  value={state}
                                  className="rounded-2xl border border-transparent text-xs data-[state=on]:border-border data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
                                >
                                  {STATE_LABELS[state]}
                                </ToggleGroupItem>
                              ))}
                            </ToggleGroup>
                          </div>
                        </div>
                        <ScreenLinkGroup
                          title="Out"
                          pages={linkedOutPages}
                          onNavigate={setActiveScreenPageId}
                          align="right"
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border bg-muted/15">
                    <div className="flex h-full flex-col overflow-hidden">
                      <div className="border-b px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Layers3 className="size-4 text-muted-foreground" />
                              <h3 className="text-sm font-semibold">UI 구성</h3>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              한 번 추가한 요소는 기본적으로 모든 뷰포트/상태에 포함됩니다.
                              현재 조합에서만 다르게 쓰려면 `개별`, 제외하려면 `해당 상태에서 없음`을 선택하세요.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">
                              {allElements.length}개 요소
                            </span>
                            {selectedCount > 0 ? (
                              <Button
                                variant="outline"
                                size="xs"
                                type="button"
                                onClick={() => removeElementsEverywhere(selectedIds)}
                                className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              >
                                <Trash2 className="size-3.5" />
                                선택 {selectedCount}개 삭제
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <div className="min-h-0 flex-1 overflow-auto p-4">
                        <ScreenDesignElementList
                          elements={allElements}
                          selectedIds={selectedIds}
                          onSelect={handleListSelection}
                          onUpdateElement={(id, patch) =>
                            updateElementEverywhere(id, (el) => ({ ...el, ...patch }))
                          }
                          onRemoveElement={removeElementEverywhere}
                          onRemoveElements={removeElementsEverywhere}
                          onReorderElements={reorderElements}
                          getNoteMode={(element) =>
                            resolveContextNote(
                              element,
                              activeViewport,
                              activeScreenState,
                            ).mode
                          }
                          getNoteValue={(element) =>
                            resolveContextNote(
                              element,
                              activeViewport,
                              activeScreenState,
                            ).note
                          }
                          onUpdateNote={updateElementNote}
                          onUpdateNoteMode={updateElementMode}
                          emptyMessage="어느 뷰포트/상태에서든 목업 요소를 추가하면 여기서 공통 UI 구성을 관리할 수 있습니다."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
