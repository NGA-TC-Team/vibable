"use client";

import { useState } from "react";
import {
  Plus,
  X,
  GripVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SectionGroup } from "@/components/editor/section-group";
import {
  SECTION_TOOLTIPS,
  MAX_SITEMAP_DEPTH,
  SCREEN_TYPE_LABELS,
  FLOW_STEP_INTENT_LABELS,
  NAV_RULE_SEVERITY_LABELS,
} from "@/lib/constants";
import { toast } from "sonner";
import { Sparkles } from "lucide-react";
import { usePhaseData } from "@/hooks/use-phase.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { flattenSitemap } from "@/lib/info-arch-utils";
import { seedScreenDesignFromIa } from "@/lib/ia-to-screen-design";
import {
  SCREEN_TYPES,
  FLOW_STEP_INTENTS,
  NAV_RULE_SEVERITIES,
} from "@/lib/schemas/info-architecture";
import type {
  SitemapNode,
  UserFlow,
  FlowStep,
  ScreenType,
  FlowStepIntent,
  GlobalNavRule,
  NavRuleSeverity,
  IaRole,
  IaEntity,
} from "@/types/phases";

// ─── path 기반 불변 트리 헬퍼 ───

function updateNodeAtPath(
  sitemap: SitemapNode[],
  path: number[],
  patch: Partial<SitemapNode>,
): SitemapNode[] {
  if (path.length === 1) {
    return sitemap.map((n, i) => (i === path[0] ? { ...n, ...patch } : n));
  }
  const [head, ...rest] = path;
  return sitemap.map((n, i) =>
    i === head
      ? { ...n, children: updateNodeAtPath(n.children, rest, patch) }
      : n,
  );
}

function addChildAtPath(
  sitemap: SitemapNode[],
  path: number[],
): SitemapNode[] {
  const child: SitemapNode = {
    id: crypto.randomUUID(),
    label: "",
    path: "",
    children: [],
  };
  if (path.length === 0) return [...sitemap, child];
  if (path.length === 1) {
    return sitemap.map((n, i) =>
      i === path[0] ? { ...n, children: [...n.children, child] } : n,
    );
  }
  const [head, ...rest] = path;
  return sitemap.map((n, i) =>
    i === head
      ? { ...n, children: addChildAtPath(n.children, rest) }
      : n,
  );
}

function removeNodeAtPath(
  sitemap: SitemapNode[],
  path: number[],
): SitemapNode[] {
  if (path.length === 1) {
    return sitemap.filter((_, i) => i !== path[0]);
  }
  const [head, ...rest] = path;
  return sitemap.map((n, i) =>
    i === head
      ? { ...n, children: removeNodeAtPath(n.children, rest) }
      : n,
  );
}

function reorderSiblingsAtParent(
  sitemap: SitemapNode[],
  parentPath: number[],
  oldIndex: number,
  newIndex: number,
): SitemapNode[] {
  if (parentPath.length === 0) {
    return arrayMove(sitemap, oldIndex, newIndex);
  }
  const [head, ...rest] = parentPath;
  return sitemap.map((n, i) =>
    i === head
      ? {
          ...n,
          children: reorderSiblingsAtParent(n.children, rest, oldIndex, newIndex),
        }
      : n,
  );
}

function getSiblingsAtParent(
  sitemap: SitemapNode[],
  parentPath: number[],
): SitemapNode[] {
  if (parentPath.length === 0) return sitemap;
  const [head, ...rest] = parentPath;
  return getSiblingsAtParent(sitemap[head]?.children ?? [], rest);
}

function getNodeMaxDepth(node: SitemapNode, currentDepth: number): number {
  if (node.children.length === 0) return currentDepth;
  return Math.max(
    ...node.children.map((c) => getNodeMaxDepth(c, currentDepth + 1)),
  );
}

/** 이전 형제의 자식으로 이동. 자기 서브트리 깊이 + 새 깊이가 MAX_DEPTH를 넘으면 noop. */
function indentNodeAtPath(
  sitemap: SitemapNode[],
  path: number[],
  maxDepth: number,
): SitemapNode[] {
  if (path.length === 0) return sitemap;
  const selfIndex = path[path.length - 1];
  if (selfIndex === 0) return sitemap;
  const parentPath = path.slice(0, -1);
  const siblings = getSiblingsAtParent(sitemap, parentPath);
  const self = siblings[selfIndex];
  if (!self) return sitemap;
  const newDepth = parentPath.length + 1;
  const subtreeDepth = getNodeMaxDepth(self, newDepth);
  if (subtreeDepth >= maxDepth) return sitemap;

  const mutateAtParent = (
    nodes: SitemapNode[],
    p: number[],
  ): SitemapNode[] => {
    if (p.length === 0) {
      const prev = nodes[selfIndex - 1];
      const target = nodes[selfIndex];
      const updatedPrev: SitemapNode = {
        ...prev,
        children: [...prev.children, target],
      };
      return [
        ...nodes.slice(0, selfIndex - 1),
        updatedPrev,
        ...nodes.slice(selfIndex + 1),
      ];
    }
    const [head, ...rest] = p;
    return nodes.map((n, i) =>
      i === head
        ? { ...n, children: mutateAtParent(n.children, rest) }
        : n,
    );
  };
  return mutateAtParent(sitemap, parentPath);
}

/** 상위의 형제가 된다(부모 바로 뒤로 삽입). 이미 루트면 noop. */
function outdentNodeAtPath(
  sitemap: SitemapNode[],
  path: number[],
): SitemapNode[] {
  if (path.length <= 1) return sitemap;
  const selfIndex = path[path.length - 1];
  const parentPath = path.slice(0, -1);
  const parentIndex = parentPath[parentPath.length - 1];
  const grandParentPath = parentPath.slice(0, -1);

  const mutateAtGrandParent = (
    nodes: SitemapNode[],
    p: number[],
  ): SitemapNode[] => {
    if (p.length === 0) {
      const parent = nodes[parentIndex];
      const target = parent.children[selfIndex];
      const updatedParent: SitemapNode = {
        ...parent,
        children: parent.children.filter((_, i) => i !== selfIndex),
      };
      return [
        ...nodes.slice(0, parentIndex),
        updatedParent,
        target,
        ...nodes.slice(parentIndex + 1),
      ];
    }
    const [head, ...rest] = p;
    return nodes.map((n, i) =>
      i === head
        ? { ...n, children: mutateAtGrandParent(n.children, rest) }
        : n,
    );
  };
  return mutateAtGrandParent(sitemap, grandParentPath);
}

// ─── 재귀 사이트맵 노드 에디터 ───

function SitemapNodeEditor({
  node,
  path,
  depth,
  disabled,
  canIndent,
  canOutdent,
  onUpdate,
  onAddChild,
  onRemove,
  onReorderSiblings,
  onIndent,
  onOutdent,
}: {
  node: SitemapNode;
  path: number[];
  depth: number;
  disabled: boolean;
  canIndent: boolean;
  canOutdent: boolean;
  onUpdate: (path: number[], patch: Partial<SitemapNode>) => void;
  onAddChild: (path: number[]) => void;
  onRemove: (path: number[]) => void;
  onReorderSiblings: (parentPath: number[], event: DragEndEvent) => void;
  onIndent: (path: number[]) => void;
  onOutdent: (path: number[]) => void;
}) {
  const [intentOpen, setIntentOpen] = useState(false);
  const hasIntent =
    !!node.purpose || !!node.screenType || !!node.primaryTask;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const childSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={depth > 0 ? "ml-4 border-l pl-3" : ""}
    >
      <div className="flex gap-2 py-1">
        {!disabled && (
          <button
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <Input
          placeholder="페이지 이름"
          value={node.label}
          onChange={(e) => onUpdate(path, { label: e.target.value })}
          disabled={disabled}
        />
        <Input
          placeholder="경로 (예: /dashboard)"
          value={node.path ?? ""}
          onChange={(e) => onUpdate(path, { path: e.target.value })}
          disabled={disabled}
          className="w-40"
        />
        {!disabled && (
          <>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onOutdent(path)}
              disabled={!canOutdent}
              title="상위로 이동"
            >
              <ChevronLeft className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onIndent(path)}
              disabled={!canIndent}
              title="하위로 이동 (이전 형제의 자식이 됨)"
            >
              <ChevronRight className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={() => onRemove(path)}
            >
              <X className="size-3.5" />
            </Button>
          </>
        )}
      </div>

      <Collapsible open={intentOpen} onOpenChange={setIntentOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="text-xs text-muted-foreground hover:text-foreground"
            disabled={disabled && !hasIntent}
          >
            <ChevronDown
              className={`size-3 transition-transform ${
                intentOpen ? "" : "-rotate-90"
              }`}
            />
            의도 확장
            {hasIntent && !intentOpen && (
              <span className="ml-1 text-[10px] text-muted-foreground/70">
                {node.screenType ? `· ${SCREEN_TYPE_LABELS[node.screenType]}` : ""}
                {node.purpose ? ` · ${node.purpose}` : ""}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-2 rounded-lg bg-muted/30 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select
              value={node.screenType ?? ""}
              onValueChange={(v) =>
                onUpdate(path, {
                  screenType: (v || undefined) as ScreenType | undefined,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger size="sm" className="w-36">
                <SelectValue placeholder="화면 역할" />
              </SelectTrigger>
              <SelectContent>
                {SCREEN_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {SCREEN_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              placeholder="존재 이유 (예: 프로젝트 현황을 한눈에 본다)"
              value={node.purpose ?? ""}
              onChange={(e) => onUpdate(path, { purpose: e.target.value })}
              disabled={disabled}
              className="flex-1"
            />
          </div>
          <Input
            placeholder="핵심 과업 (예: 최근 7일 활동 확인)"
            value={node.primaryTask ?? ""}
            onChange={(e) => onUpdate(path, { primaryTask: e.target.value })}
            disabled={disabled}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              placeholder="접근 대상 (쉼표로 구분, 예: admin, member)"
              value={(node.audience ?? []).join(", ")}
              onChange={(e) =>
                onUpdate(path, {
                  audience: e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
              disabled={disabled}
              className="flex-1"
            />
            <Input
              placeholder="핵심 객체 (예: Project)"
              value={node.primaryEntity ?? ""}
              onChange={(e) =>
                onUpdate(path, { primaryEntity: e.target.value })
              }
              disabled={disabled}
              className="w-full sm:w-40"
              list="ia-entities"
            />
          </div>
        </CollapsibleContent>
      </Collapsible>

      <DndContext
        sensors={childSensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => onReorderSiblings(path, event)}
      >
        <SortableContext
          items={node.children.map((c) => c.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatedList className="space-y-1">
            {node.children.map((child, ci) => {
              const childSubtreeDepth = getNodeMaxDepth(child, depth + 1 + 1);
              const childCanIndent =
                ci > 0 && childSubtreeDepth < MAX_SITEMAP_DEPTH;
              return (
                <AnimatedListItem key={child.id}>
                  <SitemapNodeEditor
                    node={child}
                    path={[...path, ci]}
                    depth={depth + 1}
                    disabled={disabled}
                    canIndent={childCanIndent}
                    canOutdent={true}
                    onUpdate={onUpdate}
                    onAddChild={onAddChild}
                    onRemove={onRemove}
                    onReorderSiblings={onReorderSiblings}
                    onIndent={onIndent}
                    onOutdent={onOutdent}
                  />
                </AnimatedListItem>
              );
            })}
          </AnimatedList>
        </SortableContext>
      </DndContext>
      {!disabled && depth < MAX_SITEMAP_DEPTH - 1 && (
        <Button
          variant="outline"
          size="xs"
          className="ml-1 mt-1"
          onClick={() => onAddChild(path)}
        >
          <Plus className="size-3" />
          하위 추가
        </Button>
      )}
    </div>
  );
}

// ─── Flow 메타 에디터 ───

function FlowMetaEditor({
  flow,
  flowIndex,
  sitemapOptions,
  disabled,
  onUpdate,
}: {
  flow: UserFlow;
  flowIndex: number;
  sitemapOptions: Array<{ id: string; label: string; path: string; depth: number }>;
  disabled: boolean;
  onUpdate: (index: number, patch: Partial<UserFlow>) => void;
}) {
  const [open, setOpen] = useState(false);
  const hasMeta =
    !!flow.goal ||
    !!flow.primaryActor ||
    !!flow.startScreenRef ||
    (flow.successEndings ?? []).length > 0 ||
    (flow.failureEndings ?? []).length > 0;

  const stepOptions = flow.steps.map((s, i) => ({
    id: s.id,
    label: `${i + 1}. ${s.action?.trim() || "(설명 없음)"}`,
  }));

  const toggleEnding = (
    kind: "successEndings" | "failureEndings",
    stepId: string,
  ) => {
    const current = (flow[kind] ?? []) as string[];
    const next = current.includes(stepId)
      ? current.filter((id) => id !== stepId)
      : [...current, stepId];
    onUpdate(flowIndex, { [kind]: next });
  };

  const renderEndingPicker = (
    kind: "successEndings" | "failureEndings",
    label: string,
    emptyLabel: string,
  ) => {
    const current = (flow[kind] ?? []) as string[];
    const available = stepOptions.filter((s) => !current.includes(s.id));
    return (
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{label}</span>
        {current.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {current.map((id) => {
              const target = stepOptions.find((s) => s.id === id);
              return (
                <Badge key={id} variant="secondary" className="gap-1">
                  {target?.label ?? id}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={() => toggleEnding(kind, id)}
                      className="ml-1 opacity-60 hover:opacity-100"
                    >
                      <X className="size-3" />
                    </button>
                  )}
                </Badge>
              );
            })}
          </div>
        )}
        {!disabled && (
          <Select
            value=""
            onValueChange={(v) => v && toggleEnding(kind, v)}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder={emptyLabel} />
            </SelectTrigger>
            <SelectContent>
              {available.length === 0 ? (
                <SelectItem value="__empty__" disabled>
                  추가 가능한 스텝이 없습니다
                </SelectItem>
              ) : (
                available.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
        )}
      </div>
    );
  };

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="xs"
          className="ml-6 text-xs text-muted-foreground hover:text-foreground"
          disabled={disabled && !hasMeta}
        >
          <ChevronDown
            className={`size-3 transition-transform ${
              open ? "" : "-rotate-90"
            }`}
          />
          플로우 메타
          {hasMeta && !open && (
            <span className="ml-1 text-[10px] text-muted-foreground/70">
              {flow.goal ? `· ${flow.goal}` : ""}
            </span>
          )}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="ml-6 mt-1 space-y-2 rounded-lg bg-muted/30 p-3">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="완료 정의 (예: 주문이 생성되고 결제가 완료된다)"
            value={flow.goal ?? ""}
            onChange={(e) => onUpdate(flowIndex, { goal: e.target.value })}
            disabled={disabled}
            className="flex-1"
          />
          <Input
            placeholder="주 수행자 (예: member)"
            value={flow.primaryActor ?? ""}
            onChange={(e) =>
              onUpdate(flowIndex, { primaryActor: e.target.value })
            }
            disabled={disabled}
            className="w-full sm:w-44"
            list="ia-roles"
          />
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">시작 화면</span>
          <Select
            value={flow.startScreenRef || ""}
            onValueChange={(v) =>
              onUpdate(flowIndex, {
                startScreenRef: v === "__none__" ? "" : v,
              })
            }
            disabled={disabled}
          >
            <SelectTrigger size="sm" className="w-full">
              <SelectValue placeholder="선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">(없음)</SelectItem>
              {sitemapOptions.map((opt) => (
                <SelectItem key={opt.id} value={opt.id}>
                  {"— ".repeat(opt.depth)}
                  {opt.label || "(이름 없음)"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {renderEndingPicker(
          "successEndings",
          "성공 종료 스텝",
          "성공 종료 스텝 추가",
        )}
        {renderEndingPicker(
          "failureEndings",
          "실패/이탈 종료 스텝",
          "실패 종료 스텝 추가",
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}

// ─── Sortable 래퍼 ───

function SortableFlowItem({
  flow,
  flowIndex,
  sitemapOptions,
  disabled,
  onUpdate,
  onRemove,
  onAddStep,
  onUpdateStep,
  onRemoveStep,
  onStepReorder,
}: {
  flow: UserFlow;
  flowIndex: number;
  sitemapOptions: Array<{ id: string; label: string; path: string; depth: number }>;
  disabled: boolean;
  onUpdate: (index: number, patch: Partial<UserFlow>) => void;
  onRemove: (index: number) => void;
  onAddStep: (flowIndex: number) => void;
  onUpdateStep: (fi: number, si: number, patch: Partial<FlowStep>) => void;
  onRemoveStep: (fi: number, si: number) => void;
  onStepReorder: (flowIndex: number, event: DragEndEvent) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: flow.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div ref={setNodeRef} style={style} className="rounded-lg border p-3 space-y-2">
      <div className="flex gap-2">
        {!disabled && (
          <button
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
        <Input
          placeholder="플로우 이름"
          value={flow.name}
          onChange={(e) => onUpdate(flowIndex, { name: e.target.value })}
          disabled={disabled}
        />
        {!disabled && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(flowIndex)}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <FlowMetaEditor
        flow={flow}
        flowIndex={flowIndex}
        sitemapOptions={sitemapOptions}
        disabled={disabled}
        onUpdate={onUpdate}
      />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => onStepReorder(flowIndex, event)}
      >
        <SortableContext
          items={flow.steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <AnimatedList className="space-y-2">
            {flow.steps.map((step, si) => (
              <AnimatedListItem key={step.id}>
                <SortableStepItem
                  step={step}
                  stepIndex={si}
                  flowIndex={flowIndex}
                  siblingSteps={flow.steps}
                  sitemapOptions={sitemapOptions}
                  disabled={disabled}
                  onUpdateStep={onUpdateStep}
                  onRemoveStep={onRemoveStep}
                />
              </AnimatedListItem>
            ))}
          </AnimatedList>
        </SortableContext>
      </DndContext>
      {!disabled && (
        <Button
          variant="outline"
          size="xs"
          className="ml-4"
          onClick={() => onAddStep(flowIndex)}
        >
          <Plus className="size-3" />
          스텝 추가
        </Button>
      )}
    </div>
  );
}

function SortableStepItem({
  step,
  stepIndex,
  flowIndex,
  siblingSteps,
  sitemapOptions,
  disabled,
  onUpdateStep,
  onRemoveStep,
}: {
  step: FlowStep;
  stepIndex: number;
  flowIndex: number;
  siblingSteps: FlowStep[];
  sitemapOptions: Array<{ id: string; label: string; path: string; depth: number }>;
  disabled: boolean;
  onUpdateStep: (fi: number, si: number, patch: Partial<FlowStep>) => void;
  onRemoveStep: (fi: number, si: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: step.id });
  const [linksOpen, setLinksOpen] = useState(false);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const siblingById = new Map(siblingSteps.map((s) => [s.id, s]));
  const availableNextOptions = siblingSteps.filter(
    (s) => s.id !== step.id && !step.next.includes(s.id),
  );
  const hasLinks = !!step.screenRef || step.next.length > 0;
  const refLabel = step.screenRef
    ? sitemapOptions.find((o) => o.id === step.screenRef)?.label ?? step.screenRef
    : null;

  const addNext = (targetId: string) => {
    if (!targetId) return;
    onUpdateStep(flowIndex, stepIndex, { next: [...step.next, targetId] });
  };
  const removeNext = (targetId: string) => {
    onUpdateStep(flowIndex, stepIndex, {
      next: step.next.filter((id) => id !== targetId),
    });
  };

  return (
    <div ref={setNodeRef} style={style} className="ml-4 space-y-1">
      <div className="flex gap-2">
        {!disabled && (
          <button
            className="mt-2 cursor-grab touch-none text-muted-foreground hover:text-foreground"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3" />
          </button>
        )}
        <span className="mt-2 text-xs text-muted-foreground">
          {stepIndex + 1}.
        </span>
        <Input
          placeholder="액션"
          value={step.action}
          onChange={(e) =>
            onUpdateStep(flowIndex, stepIndex, { action: e.target.value })
          }
          disabled={disabled}
        />
        {!disabled && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemoveStep(flowIndex, stepIndex)}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

      <Collapsible open={linksOpen} onOpenChange={setLinksOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="ml-7 text-xs text-muted-foreground hover:text-foreground"
            disabled={disabled && !hasLinks}
          >
            <ChevronDown
              className={`size-3 transition-transform ${
                linksOpen ? "" : "-rotate-90"
              }`}
            />
            연결
            {hasLinks && !linksOpen && (
              <span className="ml-1 text-[10px] text-muted-foreground/70">
                {refLabel ? `@${refLabel}` : ""}
                {step.next.length > 0 ? ` → ${step.next.length}개` : ""}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="ml-7 mt-1 space-y-2 rounded-lg bg-muted/30 p-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">연결 화면</span>
            <Select
              value={step.screenRef || ""}
              onValueChange={(v) =>
                onUpdateStep(flowIndex, stepIndex, {
                  screenRef: v === "__none__" ? "" : v,
                })
              }
              disabled={disabled}
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue placeholder="사이트맵 노드 선택" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">(연결 없음)</SelectItem>
                {sitemapOptions.length === 0 ? (
                  <SelectItem value="__empty__" disabled>
                    사이트맵에 노드가 없습니다
                  </SelectItem>
                ) : (
                  sitemapOptions.map((opt) => (
                    <SelectItem key={opt.id} value={opt.id}>
                      {"— ".repeat(opt.depth)}
                      {opt.label || "(이름 없음)"}
                      {opt.path ? ` · ${opt.path}` : ""}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">의도</span>
              <Select
                value={step.intent ?? ""}
                onValueChange={(v) =>
                  onUpdateStep(flowIndex, stepIndex, {
                    intent: (v || undefined) as FlowStepIntent | undefined,
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="선택" />
                </SelectTrigger>
                <SelectContent>
                  {FLOW_STEP_INTENTS.map((i) => (
                    <SelectItem key={i} value={i}>
                      {FLOW_STEP_INTENT_LABELS[i]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">수행 주체</span>
              <Input
                placeholder="예: member, admin"
                value={step.actor ?? ""}
                onChange={(e) =>
                  onUpdateStep(flowIndex, stepIndex, { actor: e.target.value })
                }
                disabled={disabled}
                list="ia-roles"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">분기 조건</span>
            <Input
              placeholder="예: 장바구니가 비어있지 않을 때"
              value={step.condition ?? ""}
              onChange={(e) =>
                onUpdateStep(flowIndex, stepIndex, {
                  condition: e.target.value,
                })
              }
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">결과/산출물</span>
            <Input
              placeholder="예: 주문 상태가 confirmed로 변경됨"
              value={step.outcome ?? ""}
              onChange={(e) =>
                onUpdateStep(flowIndex, stepIndex, { outcome: e.target.value })
              }
              disabled={disabled}
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">다음 스텝</span>
            {step.next.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {step.next.map((targetId) => {
                  const target = siblingById.get(targetId);
                  return (
                    <Badge key={targetId} variant="secondary" className="gap-1">
                      {target?.action?.trim() || targetId}
                      {!disabled && (
                        <button
                          type="button"
                          onClick={() => removeNext(targetId)}
                          className="ml-1 opacity-60 hover:opacity-100"
                        >
                          <X className="size-3" />
                        </button>
                      )}
                    </Badge>
                  );
                })}
              </div>
            )}
            {!disabled && (
              <Select value="" onValueChange={addNext}>
                <SelectTrigger size="sm" className="w-full">
                  <SelectValue placeholder="다음 스텝 추가" />
                </SelectTrigger>
                <SelectContent>
                  {availableNextOptions.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      추가 가능한 스텝이 없습니다
                    </SelectItem>
                  ) : (
                    availableNextOptions.map((s, idx) => (
                      <SelectItem key={s.id} value={s.id}>
                        {siblingSteps.findIndex((x) => x.id === s.id) + 1}.{" "}
                        {s.action?.trim() || "(설명 없음)"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// ─── 메인 폼 ───

export function InfoArchitectureForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { data, patchData } = usePhaseData("infoArchitecture");
  // React hooks는 early return 이전에 모두 호출되어야 한다. 센서는 data에 의존하지 않으므로
  // 상단에서 한 번만 초기화해 hook 카운트를 안정시킨다.
  const flowSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const updatePhaseData = useEditorStore((s) => s.updatePhaseData);
  if (!data) return null;

  const handleUpdateNode = (path: number[], patch: Partial<SitemapNode>) => {
    patchData({ sitemap: updateNodeAtPath(data.sitemap, path, patch) });
  };

  const handleAddChild = (path: number[]) => {
    patchData({ sitemap: addChildAtPath(data.sitemap, path) });
  };

  const handleRemoveNode = (path: number[]) => {
    patchData({ sitemap: removeNodeAtPath(data.sitemap, path) });
  };

  const handleIndent = (path: number[]) => {
    patchData({
      sitemap: indentNodeAtPath(data.sitemap, path, MAX_SITEMAP_DEPTH),
    });
  };

  const handleSeedScreenDesign = () => {
    if (!data || data.sitemap.length === 0) {
      toast.error("시드할 사이트맵 노드가 없습니다");
      return;
    }
    const entityNameToId = new Map(
      (data.entities ?? [])
        .filter((e) => e.name)
        .map((e) => [e.name, e.id]),
    );
    updatePhaseData((prev) => {
      const result = seedScreenDesignFromIa(
        data,
        prev.screenDesign,
        entityNameToId,
      );
      if (result.added.length === 0) {
        toast.info(
          `추가할 신규 화면이 없습니다 (기존 ${result.skipped.length}개 보존)`,
        );
        return prev;
      }
      toast.success(
        `화면설계에 ${result.added.length}개 추가됨 · 기존 ${result.skipped.length}개 보존`,
      );
      return { ...prev, screenDesign: result.phase };
    });
  };

  const handleOutdent = (path: number[]) => {
    patchData({ sitemap: outdentNodeAtPath(data.sitemap, path) });
  };

  const handleReorderSiblings = (parentPath: number[], event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const getSiblings = (
      nodes: SitemapNode[],
      p: number[],
    ): SitemapNode[] => {
      if (p.length === 0) return nodes;
      const [head, ...rest] = p;
      return getSiblings(nodes[head]?.children ?? [], rest);
    };
    const siblings = getSiblings(data.sitemap, parentPath);
    const oldIdx = siblings.findIndex((n) => n.id === active.id);
    const newIdx = siblings.findIndex((n) => n.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    patchData({
      sitemap: reorderSiblingsAtParent(
        data.sitemap,
        parentPath,
        oldIdx,
        newIdx,
      ),
    });
  };

  const addSitemapNode = () => {
    const node: SitemapNode = {
      id: crypto.randomUUID(),
      label: "",
      path: "",
      children: [],
    };
    patchData({ sitemap: [...data.sitemap, node] });
  };

  const addFlow = () => {
    const flow: UserFlow = {
      id: crypto.randomUUID(),
      name: "",
      steps: [],
    };
    patchData({ userFlows: [...data.userFlows, flow] });
  };

  const updateFlow = (index: number, patch: Partial<UserFlow>) => {
    const flows = [...data.userFlows];
    flows[index] = { ...flows[index], ...patch };
    patchData({ userFlows: flows });
  };

  const removeFlow = (index: number) => {
    patchData({ userFlows: data.userFlows.filter((_, i) => i !== index) });
  };

  const addStep = (flowIndex: number) => {
    const flows = [...data.userFlows];
    const step: FlowStep = {
      id: crypto.randomUUID(),
      action: "",
      next: [],
    };
    flows[flowIndex] = {
      ...flows[flowIndex],
      steps: [...flows[flowIndex].steps, step],
    };
    patchData({ userFlows: flows });
  };

  const updateStep = (
    flowIndex: number,
    stepIndex: number,
    patch: Partial<FlowStep>,
  ) => {
    const flows = [...data.userFlows];
    const steps = [...flows[flowIndex].steps];
    steps[stepIndex] = { ...steps[stepIndex], ...patch };
    flows[flowIndex] = { ...flows[flowIndex], steps };
    patchData({ userFlows: flows });
  };

  const removeStep = (flowIndex: number, stepIndex: number) => {
    const flows = [...data.userFlows];
    flows[flowIndex] = {
      ...flows[flowIndex],
      steps: flows[flowIndex].steps.filter((_, i) => i !== stepIndex),
    };
    patchData({ userFlows: flows });
  };

  const handleFlowReorder = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = data.userFlows.findIndex((f) => f.id === active.id);
    const newIdx = data.userFlows.findIndex((f) => f.id === over.id);
    patchData({ userFlows: arrayMove(data.userFlows, oldIdx, newIdx) });
  };

  const handleStepReorder = (flowIndex: number, event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const flow = data.userFlows[flowIndex];
    const oldIdx = flow.steps.findIndex((s) => s.id === active.id);
    const newIdx = flow.steps.findIndex((s) => s.id === over.id);
    const flows = [...data.userFlows];
    flows[flowIndex] = { ...flow, steps: arrayMove(flow.steps, oldIdx, newIdx) };
    patchData({ userFlows: flows });
  };

  const sitemapOptions = flattenSitemap(data.sitemap).map((n) => ({
    id: n.id,
    label: n.label,
    path: n.path,
    depth: n.depth,
  }));

  return (
    <SectionGroup>
      <datalist id="ia-roles">
        {(data.roles ?? [])
          .filter((r) => r.name)
          .map((r) => (
            <option key={r.id} value={r.name} />
          ))}
      </datalist>
      <datalist id="ia-entities">
        {(data.entities ?? [])
          .filter((e) => e.name)
          .map((e) => (
            <option key={e.id} value={e.name} />
          ))}
      </datalist>

      {/* Sitemap — 4뎁스 재귀 */}
      <section className="space-y-3">
        <SectionHeader title="사이트맵" tooltip={SECTION_TOOLTIPS["infoArchitecture.sitemap"]}>
          {!disabled && (
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="xs"
                onClick={handleSeedScreenDesign}
                title={SECTION_TOOLTIPS["infoArchitecture.seedScreenDesign"]}
              >
                <Sparkles className="size-3.5" />
                화면설계 시드
              </Button>
              <Button variant="outline" size="xs" onClick={addSitemapNode}>
                <Plus className="size-3.5" />
                노드 추가
              </Button>
            </div>
          )}
        </SectionHeader>
        <DndContext
          sensors={flowSensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) => handleReorderSiblings([], event)}
        >
          <SortableContext
            items={data.sitemap.map((n) => n.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatedList className="space-y-3">
              {data.sitemap.map((node, i) => {
                const subtreeDepth = getNodeMaxDepth(node, 1);
                return (
                  <AnimatedListItem key={node.id}>
                    <div className="space-y-1 rounded-lg border p-3">
                      <SitemapNodeEditor
                        node={node}
                        path={[i]}
                        depth={0}
                        disabled={disabled}
                        canIndent={i > 0 && subtreeDepth < MAX_SITEMAP_DEPTH}
                        canOutdent={false}
                        onUpdate={handleUpdateNode}
                        onAddChild={handleAddChild}
                        onRemove={handleRemoveNode}
                        onReorderSiblings={handleReorderSiblings}
                        onIndent={handleIndent}
                        onOutdent={handleOutdent}
                      />
                    </div>
                  </AnimatedListItem>
                );
              })}
            </AnimatedList>
          </SortableContext>
        </DndContext>
      </section>

      {/* User Flows — DnD 정렬 */}
      <section className="space-y-3">
        <SectionHeader title="유저 플로우" tooltip={SECTION_TOOLTIPS["infoArchitecture.userFlows"]}>
          {!disabled && (
            <Button variant="outline" size="xs" onClick={addFlow}>
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <DndContext
          sensors={flowSensors}
          collisionDetection={closestCenter}
          onDragEnd={handleFlowReorder}
        >
          <SortableContext
            items={data.userFlows.map((f) => f.id)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatedList className="space-y-3">
              {data.userFlows.map((flow, fi) => (
                <AnimatedListItem key={flow.id}>
                  <SortableFlowItem
                    flow={flow}
                    flowIndex={fi}
                    sitemapOptions={sitemapOptions}
                    disabled={disabled}
                    onUpdate={updateFlow}
                    onRemove={removeFlow}
                    onAddStep={addStep}
                    onUpdateStep={updateStep}
                    onRemoveStep={removeStep}
                    onStepReorder={handleStepReorder}
                  />
                </AnimatedListItem>
              ))}
            </AnimatedList>
          </SortableContext>
        </DndContext>
      </section>

      {/* Global Nav Rules */}
      <section className="space-y-2">
        <SectionHeader
          title="글로벌 네비게이션 규칙"
          tooltip={SECTION_TOOLTIPS["infoArchitecture.navRules.structured"]}
        >
          {!disabled && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                const rule: GlobalNavRule = {
                  id: crypto.randomUUID(),
                  title: "",
                  rule: "",
                  rationale: "",
                };
                patchData({
                  globalNavRules: [...data.globalNavRules, rule],
                });
              }}
            >
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <AnimatedList className="space-y-2">
          {data.globalNavRules.map((rule, idx) => (
            <AnimatedListItem key={rule.id}>
              <NavRuleEditor
                rule={rule}
                disabled={disabled}
                onUpdate={(patch) => {
                  const next = [...data.globalNavRules];
                  next[idx] = { ...next[idx], ...patch };
                  patchData({ globalNavRules: next });
                }}
                onRemove={() =>
                  patchData({
                    globalNavRules: data.globalNavRules.filter(
                      (_, i) => i !== idx,
                    ),
                  })
                }
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      {/* Roles — 3차 */}
      <section className="space-y-2">
        <SectionHeader
          title="역할 (Roles)"
          tooltip={SECTION_TOOLTIPS["infoArchitecture.roles"]}
        >
          {!disabled && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                const role: IaRole = {
                  id: crypto.randomUUID(),
                  name: "",
                  description: "",
                };
                patchData({ roles: [...(data.roles ?? []), role] });
              }}
            >
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <AnimatedList className="space-y-2">
          {(data.roles ?? []).map((role, idx) => (
            <AnimatedListItem key={role.id}>
              <div className="flex gap-2 rounded-lg border p-2">
                <Input
                  placeholder="역할 이름 (예: admin)"
                  value={role.name}
                  onChange={(e) => {
                    const next = [...(data.roles ?? [])];
                    next[idx] = { ...next[idx], name: e.target.value };
                    patchData({ roles: next });
                  }}
                  disabled={disabled}
                  className="w-40"
                />
                <Input
                  placeholder="설명"
                  value={role.description ?? ""}
                  onChange={(e) => {
                    const next = [...(data.roles ?? [])];
                    next[idx] = { ...next[idx], description: e.target.value };
                    patchData({ roles: next });
                  }}
                  disabled={disabled}
                  className="flex-1"
                />
                {!disabled && (
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() =>
                      patchData({
                        roles: (data.roles ?? []).filter((_, i) => i !== idx),
                      })
                    }
                  >
                    <X className="size-3.5" />
                  </Button>
                )}
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>

      {/* Entities — 3차 */}
      <section className="space-y-2">
        <SectionHeader
          title="엔티티 (Entities)"
          tooltip={SECTION_TOOLTIPS["infoArchitecture.entities"]}
        >
          {!disabled && (
            <Button
              variant="outline"
              size="xs"
              onClick={() => {
                const entity: IaEntity = {
                  id: crypto.randomUUID(),
                  name: "",
                  description: "",
                  states: [],
                };
                patchData({ entities: [...(data.entities ?? []), entity] });
              }}
            >
              <Plus className="size-3.5" />
              추가
            </Button>
          )}
        </SectionHeader>
        <AnimatedList className="space-y-2">
          {(data.entities ?? []).map((entity, idx) => (
            <AnimatedListItem key={entity.id}>
              <div className="space-y-2 rounded-lg border p-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="엔티티 이름 (예: Project)"
                    value={entity.name}
                    onChange={(e) => {
                      const next = [...(data.entities ?? [])];
                      next[idx] = { ...next[idx], name: e.target.value };
                      patchData({ entities: next });
                    }}
                    disabled={disabled}
                    className="w-48"
                  />
                  <Input
                    placeholder="설명"
                    value={entity.description ?? ""}
                    onChange={(e) => {
                      const next = [...(data.entities ?? [])];
                      next[idx] = {
                        ...next[idx],
                        description: e.target.value,
                      };
                      patchData({ entities: next });
                    }}
                    disabled={disabled}
                    className="flex-1"
                  />
                  {!disabled && (
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() =>
                        patchData({
                          entities: (data.entities ?? []).filter(
                            (_, i) => i !== idx,
                          ),
                        })
                      }
                    >
                      <X className="size-3.5" />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="상태 값 (쉼표 구분, 예: draft, published, archived)"
                  value={(entity.states ?? []).join(", ")}
                  onChange={(e) => {
                    const next = [...(data.entities ?? [])];
                    next[idx] = {
                      ...next[idx],
                      states: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    };
                    patchData({ entities: next });
                  }}
                  disabled={disabled}
                />
              </div>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </section>
    </SectionGroup>
  );
}

function NavRuleEditor({
  rule,
  disabled,
  onUpdate,
  onRemove,
}: {
  rule: GlobalNavRule;
  disabled: boolean;
  onUpdate: (patch: Partial<GlobalNavRule>) => void;
  onRemove: () => void;
}) {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  return (
    <div className="space-y-2 rounded-lg border p-3">
      <div className="flex gap-2">
        <Input
          placeholder="제목 (예: 로그인 전 접근 제한)"
          value={rule.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          disabled={disabled}
          className="flex-1"
        />
        <Select
          value={rule.severity ?? ""}
          onValueChange={(v) =>
            onUpdate({ severity: (v || undefined) as NavRuleSeverity | undefined })
          }
          disabled={disabled}
        >
          <SelectTrigger size="sm" className="w-24">
            <SelectValue placeholder="중요도" />
          </SelectTrigger>
          <SelectContent>
            {NAV_RULE_SEVERITIES.map((s) => (
              <SelectItem key={s} value={s}>
                {NAV_RULE_SEVERITY_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {!disabled && (
          <Button variant="ghost" size="icon-xs" onClick={onRemove}>
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      <Input
        placeholder="규칙 본문"
        value={rule.rule}
        onChange={(e) => onUpdate({ rule: e.target.value })}
        disabled={disabled}
      />
      <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            size="xs"
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            <ChevronDown
              className={`size-3 transition-transform ${
                advancedOpen ? "" : "-rotate-90"
              }`}
            />
            근거·적용 대상
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-1 space-y-2 rounded-lg bg-muted/30 p-3">
          <Input
            placeholder="근거 (예: 보안 요건, PM 가이드)"
            value={rule.rationale ?? ""}
            onChange={(e) => onUpdate({ rationale: e.target.value })}
            disabled={disabled}
          />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Input
              placeholder="역할 (쉼표 구분)"
              value={(rule.appliesTo?.roles ?? []).join(", ")}
              onChange={(e) =>
                onUpdate({
                  appliesTo: {
                    ...rule.appliesTo,
                    roles: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              disabled={disabled}
            />
            <Input
              placeholder="화면 역할 (쉼표 구분, hub/list 등)"
              value={(rule.appliesTo?.screenTypes ?? []).join(", ")}
              onChange={(e) =>
                onUpdate({
                  appliesTo: {
                    ...rule.appliesTo,
                    screenTypes: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter((s): s is ScreenType =>
                        (SCREEN_TYPES as readonly string[]).includes(s),
                      ),
                  },
                })
              }
              disabled={disabled}
            />
            <Input
              placeholder="경로 패턴 (쉼표 구분)"
              value={(rule.appliesTo?.paths ?? []).join(", ")}
              onChange={(e) =>
                onUpdate({
                  appliesTo: {
                    ...rule.appliesTo,
                    paths: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  },
                })
              }
              disabled={disabled}
            />
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
