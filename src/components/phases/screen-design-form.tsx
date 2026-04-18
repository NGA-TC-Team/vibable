"use client";

import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Layers3,
  Link2,
  MousePointer,
  Plus,
  Table2,
  Target,
  TriangleAlert,
  X,
} from "lucide-react";
import { ELEMENT_LABELS } from "@/components/preview/mockup/mockup-element";
import { resolveElementLabel } from "@/lib/mockup-element-label";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";
import { FieldLabel } from "@/components/editor/field-label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import type {
  ProjectType,
  ScreenPage,
  ErrorState,
  Interaction,
} from "@/types/phases";

const errorTypes = {
  network: "네트워크",
  validation: "유효성 검증",
  permission: "권한",
  notFound: "Not Found",
  custom: "커스텀",
} as const;

const PROJECT_TRIGGER_OPTIONS: Record<ProjectType, { value: string; label: string }[]> = {
  web: [
    { value: "click", label: "클릭" },
    { value: "doubleClick", label: "더블 클릭" },
    { value: "hover", label: "호버" },
    { value: "focus", label: "포커스" },
    { value: "input", label: "입력" },
    { value: "submit", label: "제출" },
    { value: "scroll", label: "스크롤" },
    { value: "shortcut", label: "단축키" },
  ],
  mobile: [
    { value: "tap", label: "탭" },
    { value: "doubleTap", label: "더블 탭" },
    { value: "longPress", label: "롱 프레스" },
    { value: "swipe", label: "스와이프" },
    { value: "pullToRefresh", label: "당겨서 새로고침" },
    { value: "input", label: "입력" },
    { value: "submit", label: "제출" },
  ],
  cli: [
    { value: "enter", label: "엔터" },
    { value: "select", label: "선택" },
    { value: "confirm", label: "확인" },
    { value: "toggle", label: "토글" },
    { value: "shortcut", label: "단축키" },
  ],
  agent: [
    { value: "click", label: "클릭" },
    { value: "doubleClick", label: "더블 클릭" },
    { value: "hover", label: "호버" },
    { value: "focus", label: "포커스" },
    { value: "input", label: "입력" },
    { value: "submit", label: "제출" },
    { value: "scroll", label: "스크롤" },
    { value: "shortcut", label: "단축키" },
  ],
};

const PROJECT_ACTION_OPTIONS: Record<ProjectType, { value: string; label: string }[]> = {
  web: [
    { value: "navigate", label: "페이지 이동" },
    { value: "openModal", label: "모달 열기" },
    { value: "openDrawer", label: "드로어 열기" },
    { value: "switchTab", label: "탭 전환" },
    { value: "submit", label: "제출" },
    { value: "toggle", label: "토글" },
    { value: "refresh", label: "새로고침" },
    { value: "openExternalLink", label: "외부 링크 열기" },
    { value: "copy", label: "복사" },
    { value: "download", label: "다운로드" },
    { value: "other", label: "기타" },
  ],
  mobile: [
    { value: "navigate", label: "화면 이동" },
    { value: "openBottomSheet", label: "바텀시트 열기" },
    { value: "openModal", label: "모달 열기" },
    { value: "switchTab", label: "탭 전환" },
    { value: "submit", label: "제출" },
    { value: "toggle", label: "토글" },
    { value: "share", label: "공유" },
    { value: "openDeepLink", label: "전화/딥링크 열기" },
    { value: "refresh", label: "새로고침" },
    { value: "other", label: "기타" },
  ],
  cli: [
    { value: "run", label: "실행" },
    { value: "navigate", label: "이동" },
    { value: "open", label: "열기" },
    { value: "copy", label: "복사" },
    { value: "submit", label: "제출" },
    { value: "toggle", label: "토글" },
    { value: "other", label: "기타" },
  ],
  agent: [
    { value: "navigate", label: "페이지 이동" },
    { value: "openModal", label: "모달 열기" },
    { value: "openDrawer", label: "드로어 열기" },
    { value: "switchTab", label: "탭 전환" },
    { value: "submit", label: "제출" },
    { value: "toggle", label: "토글" },
    { value: "refresh", label: "새로고침" },
    { value: "openExternalLink", label: "외부 링크 열기" },
    { value: "copy", label: "복사" },
    { value: "download", label: "다운로드" },
    { value: "other", label: "기타" },
  ],
};

function getAllMockupElements(page: ScreenPage) {
  const seen = new Set<string>();
  const viewports = ["mobile", "tablet", "desktop"] as const;
  const states = ["idle", "loading", "offline", "error"] as const;
  const sources = [
    ...viewports.flatMap((viewport) => page.mockup?.[viewport] ?? []),
    ...states.flatMap((state) =>
      viewports.flatMap((viewport) => page.mockupByState?.[state]?.[viewport] ?? []),
    ),
  ];

  return sources.filter((element) => {
    if (seen.has(element.id)) return false;
    seen.add(element.id);
    return true;
  });
}

function getElementOptions(page: ScreenPage) {
  const typeCount = new Map<string, number>();

  return getAllMockupElements(page).map((element) => {
    const nextCount = (typeCount.get(element.type) ?? 0) + 1;
    typeCount.set(element.type, nextCount);
    const resolved = resolveElementLabel(element, nextCount, ELEMENT_LABELS);

    return {
      id: element.id,
      label: resolved.label,
      typeLabel: resolved.typeLabel,
      hasAlias: resolved.hasAlias,
    };
  });
}

function getPageLabel(page: Pick<ScreenPage, "name" | "route">) {
  return page.name || page.route || "이름 없는 화면";
}

function toggleIncluded(ids: string[], targetId: string) {
  return ids.includes(targetId)
    ? ids.filter((id) => id !== targetId)
    : [...ids, targetId];
}

function PageReferenceList({
  label,
  items,
  allPages,
  currentPageId,
  disabled,
  onChange,
}: {
  label: string;
  items: string[];
  allPages: ScreenPage[];
  currentPageId: string;
  disabled: boolean;
  onChange: (items: string[]) => void;
}) {
  const candidates = allPages.filter((candidate) => candidate.id !== currentPageId);
  const canAdd = candidates.some((candidate) => !items.includes(candidate.id));

  const addReference = () => {
    const nextId = candidates.find((candidate) => !items.includes(candidate.id))?.id;
    if (!nextId) return;
    onChange([...items, nextId]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel
          icon={Link2}
          tooltip={
            label.includes("In")
              ? "현재 화면으로 유입되는 연결 화면을 관리합니다."
              : "현재 화면에서 이동할 수 있는 연결 화면을 관리합니다."
          }
        >
          {label}
        </FieldLabel>
        {!disabled && (
          <Button
            variant="outline"
            size="xs"
            onClick={addReference}
            disabled={!canAdd}
          >
            <Plus className="size-3" />
            추가
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="pl-1 text-xs text-muted-foreground">연결된 화면이 없습니다.</p>
      ) : null}

      <AnimatedList className="space-y-2">
        {items.map((item, index) => {
          const selectablePages = candidates.filter(
            (candidate) =>
              candidate.id === item || !items.some((value, valueIndex) => valueIndex !== index && value === candidate.id),
          );

          return (
            <AnimatedListItem key={`${label}-${index}-${item}`}>
              <div className="flex items-center gap-2">
                <Select
                  value={item || undefined}
                  onValueChange={(value) => {
                    const nextItems = [...items];
                    nextItems[index] = value;
                    onChange(nextItems);
                  }}
                  disabled={disabled}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="화면 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectablePages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {getPageLabel(page)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onChange(items.filter((_, itemIndex) => itemIndex !== index))}
                    className="hover:border-destructive/40 hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </AnimatedListItem>
          );
        })}
      </AnimatedList>
    </div>
  );
}

function ScreenPageEditor({
  page,
  pageIndex,
  allPages,
  entityOptions,
  projectType,
  disabled,
  updatePage,
  removePage,
  addError,
  updateError,
  removeError,
  addInteraction,
  updateInteraction,
  removeInteraction,
}: {
  page: ScreenPage;
  pageIndex: number;
  allPages: ScreenPage[];
  entityOptions: { id: string; name: string }[];
  projectType: ProjectType;
  disabled: boolean;
  updatePage: (index: number, patch: Partial<ScreenPage>) => void;
  removePage: (index: number) => void;
  addError: (pageIndex: number) => void;
  updateError: (pageIndex: number, errIndex: number, patch: Partial<ErrorState>) => void;
  removeError: (pageIndex: number, errIndex: number) => void;
  addInteraction: (pageIndex: number) => void;
  updateInteraction: (pageIndex: number, intIndex: number, patch: Partial<Interaction>) => void;
  removeInteraction: (pageIndex: number, intIndex: number) => void;
}) {
  const pi = pageIndex;
  const selectedEntityIds = page.entityIds ?? [];
  const elementOptions = getElementOptions(page);
  const triggerOptions = PROJECT_TRIGGER_OPTIONS[projectType];
  const actionOptions = PROJECT_ACTION_OPTIONS[projectType];

  return (
    <div className="space-y-4 rounded-2xl border p-4">
      <div className="flex gap-2">
        <Input
          placeholder="화면 이름"
          value={page.name}
          onChange={(e) => updatePage(pi, { name: e.target.value })}
          disabled={disabled}
        />
        <Input
          placeholder="라우트"
          value={page.route ?? ""}
          onChange={(e) => updatePage(pi, { route: e.target.value })}
          disabled={disabled}
          className="w-36"
        />
        {!disabled && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => removePage(pi)}
            className="hover:border-destructive/40 hover:text-destructive"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={Table2}
          tooltip="이 화면이 직접 다루는 주요 데이터 엔티티를 연결합니다."
        >
          핵심 엔티티
        </FieldLabel>
        {entityOptions.length === 0 ? (
          <p className="pl-1 text-xs text-muted-foreground">
            데이터 모델 단계에서 엔티티를 만들면 여기서 참조할 수 있습니다.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {entityOptions.map((entity) => {
              const isSelected = selectedEntityIds.includes(entity.id);

              return (
                <Button
                  key={entity.id}
                  type="button"
                  variant={isSelected ? "secondary" : "outline"}
                  size="xs"
                  disabled={disabled}
                  onClick={() =>
                    updatePage(pi, {
                      entityIds: toggleIncluded(selectedEntityIds, entity.id),
                    })
                  }
                >
                  {entity.name || "이름 없는 엔티티"}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <FieldLabel
            icon={Target}
            tooltip="사용자가 이 화면에서 달성하려는 핵심 목적입니다."
          >
            유저 목표
          </FieldLabel>
          <Textarea
            placeholder="유저가 이 화면에서 달성하려는 것"
            value={page.uxIntent.userGoal}
            onChange={(e) =>
              updatePage(pi, {
                uxIntent: { ...page.uxIntent, userGoal: e.target.value },
              })
            }
            rows={2}
            disabled={disabled}
          />
        </div>
        <div className="space-y-1">
          <FieldLabel
            icon={Building2}
            tooltip="비즈니스 관점에서 이 화면이 수행해야 하는 역할을 적습니다."
          >
            비즈니스 의도
          </FieldLabel>
          <Textarea
            placeholder="비즈니스 측면에서의 의도"
            value={page.uxIntent.businessIntent}
            onChange={(e) =>
              updatePage(pi, {
                uxIntent: { ...page.uxIntent, businessIntent: e.target.value },
              })
            }
            rows={2}
            disabled={disabled}
          />
        </div>
      </div>

      <div className="space-y-2">
        <FieldLabel
          icon={Layers3}
          tooltip="Idle, Loading, Offline 등 상태별로 어떻게 달라지는지 요약합니다."
        >
          상태별 UI
        </FieldLabel>
        <Input
          placeholder="Idle 상태"
          value={page.states.idle}
          onChange={(e) => updatePage(pi, { states: { ...page.states, idle: e.target.value } })}
          disabled={disabled}
        />
        <Input
          placeholder="Loading 상태"
          value={page.states.loading}
          onChange={(e) => updatePage(pi, { states: { ...page.states, loading: e.target.value } })}
          disabled={disabled}
        />
        <Input
          placeholder="Offline 상태"
          value={page.states.offline}
          onChange={(e) => updatePage(pi, { states: { ...page.states, offline: e.target.value } })}
          disabled={disabled}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel
            icon={TriangleAlert}
            tooltip="이 화면에서 고려해야 할 에러 유형과 대응 문구를 정리합니다."
          >
            에러 상태
          </FieldLabel>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={() => addError(pi)}>
              <Plus className="size-3" />
              추가
            </Button>
          )}
        </div>
        <AnimatedList className="space-y-2">
          {page.states.errors.map((err, ei) => (
            <AnimatedListItem key={`${page.id}-error-${ei}`}>
              <div className="flex items-center gap-2">
                <Select
                  value={err.type}
                  onValueChange={(v) => updateError(pi, ei, { type: v as ErrorState["type"] })}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(errorTypes).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="설명"
                  value={err.description}
                  onChange={(e) => updateError(pi, ei, { description: e.target.value })}
                  disabled={disabled}
                />
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => removeError(pi, ei)}
                    className="hover:border-destructive/40 hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <FieldLabel
            icon={MousePointer}
            tooltip="UI 요소별 트리거와 액션을 연결해 화면 동작을 정의합니다."
          >
            인터랙션
          </FieldLabel>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={() => addInteraction(pi)}>
              <Plus className="size-3" />
              추가
            </Button>
          )}
        </div>
        {elementOptions.length === 0 ? (
          <p className="pl-1 text-xs text-muted-foreground">
            목업에 UI 요소를 추가하면 여기서 인터랙션 대상으로 선택할 수 있습니다.
          </p>
        ) : null}
        <AnimatedList className="space-y-2">
          {page.interactions.map((int, ii) => (
            <AnimatedListItem key={`${page.id}-interaction-${ii}`}>
              <div
                className="grid gap-2 rounded-xl border border-border/60 p-3 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)_minmax(0,1.1fr)_auto]"
              >
                <Select
                  value={int.elementId || undefined}
                  onValueChange={(value) => updateInteraction(pi, ii, { elementId: value })}
                  disabled={disabled || elementOptions.length === 0}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="UI 요소 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {elementOptions.map((option) => (
                      <SelectItem key={option.id} value={option.id}>
                        <span className="flex items-center gap-2">
                          <span>{option.label}</span>
                          {option.hasAlias ? (
                            <span className="rounded bg-muted px-1 py-0.5 text-[9px] font-medium text-muted-foreground">
                              {option.typeLabel}
                            </span>
                          ) : null}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={int.trigger || undefined}
                  onValueChange={(value) => updateInteraction(pi, ii, { trigger: value })}
                  disabled={disabled}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="트리거 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {triggerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="space-y-2">
                  <Select
                    value={int.actionKind || undefined}
                    onValueChange={(value) =>
                      updateInteraction(pi, ii, {
                        actionKind: value,
                        actionCustom: value === "other" ? int.actionCustom ?? "" : undefined,
                      })
                    }
                    disabled={disabled}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="액션 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {int.actionKind === "other" ? (
                    <Input
                      placeholder="기타 액션을 입력하세요"
                      value={int.actionCustom ?? ""}
                      onChange={(e) =>
                        updateInteraction(pi, ii, { actionCustom: e.target.value })
                      }
                      disabled={disabled}
                    />
                  ) : null}
                </div>
                <div className="flex items-center justify-end">
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => removeInteraction(pi, ii)}
                      className="hover:border-destructive/40 hover:text-destructive"
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </div>

      <PageReferenceList
        label="연결 페이지 (In)"
        items={page.inPages}
        allPages={allPages}
        currentPageId={page.id}
        disabled={disabled}
        onChange={(inPages) => updatePage(pi, { inPages })}
      />
      <PageReferenceList
        label="연결 페이지 (Out)"
        items={page.outPages}
        allPages={allPages}
        currentPageId={page.id}
        disabled={disabled}
        onChange={(outPages) => updatePage(pi, { outPages })}
      />
    </div>
  );
}

export function ScreenDesignForm({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("screenDesign");
  const { data: dataModel } = usePhaseData("dataModel");
  const activeScreenPageId = useEditorStore((s) => s.activeScreenPageId);
  const setActiveScreenPageId = useEditorStore((s) => s.setActiveScreenPageId);
  const projectType = useEditorStore((s) => s.projectType);
  if (!data) return null;

  const entityOptions =
    dataModel?.entities.map((entity) => ({
      id: entity.id,
      name: entity.name,
    })) ?? [];

  const activeId = activeScreenPageId ?? data.pages[0]?.id ?? null;

  const activeIndex = data.pages.findIndex((p) => p.id === activeId);
  const activePage = activeIndex >= 0 ? data.pages[activeIndex] : null;

  const addPage = () => {
    const page: ScreenPage = {
      id: crypto.randomUUID(),
      name: "",
      route: "",
      entityIds: [],
      uxIntent: { userGoal: "", businessIntent: "" },
      states: { idle: "", loading: "", offline: "", errors: [] },
      interactions: [],
      inPages: [],
      outPages: [],
      mockup: { mobile: [], tablet: [], desktop: [] },
    };
    patchData({ pages: [...data.pages, page] });
    setActiveScreenPageId(page.id);
  };

  const updatePage = (index: number, patch: Partial<ScreenPage>) => {
    const pages = [...data.pages];
    pages[index] = { ...pages[index], ...patch };
    patchData({ pages });
  };

  const removePage = (index: number) => {
    const remaining = data.pages.filter((_, i) => i !== index);
    patchData({ pages: remaining });
    if (data.pages[index]?.id === activeId) {
      setActiveScreenPageId(remaining[0]?.id ?? null);
    }
  };

  const addError = (pageIndex: number) => {
    const pages = [...data.pages];
    const err: ErrorState = { type: "custom", description: "" };
    pages[pageIndex] = {
      ...pages[pageIndex],
      states: { ...pages[pageIndex].states, errors: [...pages[pageIndex].states.errors, err] },
    };
    patchData({ pages });
  };

  const updateError = (pageIndex: number, errIndex: number, patch: Partial<ErrorState>) => {
    const pages = [...data.pages];
    const errors = [...pages[pageIndex].states.errors];
    errors[errIndex] = { ...errors[errIndex], ...patch };
    pages[pageIndex] = { ...pages[pageIndex], states: { ...pages[pageIndex].states, errors } };
    patchData({ pages });
  };

  const removeError = (pageIndex: number, errIndex: number) => {
    const pages = [...data.pages];
    pages[pageIndex] = {
      ...pages[pageIndex],
      states: { ...pages[pageIndex].states, errors: pages[pageIndex].states.errors.filter((_, i) => i !== errIndex) },
    };
    patchData({ pages });
  };

  const addInteraction = (pageIndex: number) => {
    const pages = [...data.pages];
    const interaction: Interaction = {
      elementId: "",
      trigger: "",
      actionKind: "",
      actionCustom: undefined,
    };
    pages[pageIndex] = { ...pages[pageIndex], interactions: [...pages[pageIndex].interactions, interaction] };
    patchData({ pages });
  };

  const updateInteraction = (pageIndex: number, intIndex: number, patch: Partial<Interaction>) => {
    const pages = [...data.pages];
    const interactions = [...pages[pageIndex].interactions];
    interactions[intIndex] = { ...interactions[intIndex], ...patch };
    patchData({ pages: pages.map((page, index) => (index === pageIndex ? { ...page, interactions } : page)) });
  };

  const removeInteraction = (pageIndex: number, intIndex: number) => {
    const pages = [...data.pages];
    pages[pageIndex] = {
      ...pages[pageIndex],
      interactions: pages[pageIndex].interactions.filter((_, i) => i !== intIndex),
    };
    patchData({ pages });
  };

  const currentPageIndex = data.pages.findIndex((p) => p.id === activeId);
  const hasPrevPage = currentPageIndex > 0;
  const hasNextPage = currentPageIndex >= 0 && currentPageIndex < data.pages.length - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          type="button"
          aria-label="이전 화면"
          onClick={() => {
            if (hasPrevPage) setActiveScreenPageId(data.pages[currentPageIndex - 1].id);
          }}
          disabled={!hasPrevPage}
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Select value={activeId ?? undefined} onValueChange={setActiveScreenPageId}>
          <SelectTrigger className="flex-1">
            <SelectValue placeholder="화면 선택" />
          </SelectTrigger>
          <SelectContent>
            {data.pages.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {getPageLabel(p)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="icon-sm"
          type="button"
          aria-label="다음 화면"
          onClick={() => {
            if (hasNextPage) setActiveScreenPageId(data.pages[currentPageIndex + 1].id);
          }}
          disabled={!hasNextPage}
        >
          <ChevronRight className="size-4" />
        </Button>
        {!disabled && (
          <Button variant="outline" size="xs" onClick={addPage}>
            <Plus className="size-3.5" />
            화면 추가
          </Button>
        )}
      </div>
      {activePage && activeIndex >= 0 && (
        <ScreenPageEditor
          key={activePage.id}
          page={activePage}
          pageIndex={activeIndex}
          allPages={data.pages}
          entityOptions={entityOptions}
          projectType={projectType}
          disabled={disabled}
          updatePage={updatePage}
          removePage={removePage}
          addError={addError}
          updateError={updateError}
          removeError={removeError}
          addInteraction={addInteraction}
          updateInteraction={updateInteraction}
          removeInteraction={removeInteraction}
        />
      )}
    </div>
  );
}
