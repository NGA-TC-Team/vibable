"use client";

import { Plus, X, GripVertical } from "lucide-react";
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
import { StringList } from "@/components/editor/dynamic-list";
import { SectionHeader } from "@/components/editor/section-header";
import { SECTION_TOOLTIPS, MAX_SITEMAP_DEPTH } from "@/lib/constants";
import { usePhaseData } from "@/hooks/use-phase.hook";
import type { SitemapNode, UserFlow, FlowStep } from "@/types/phases";

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

// ─── 재귀 사이트맵 노드 에디터 ───

function SitemapNodeEditor({
  node,
  path,
  depth,
  disabled,
  onUpdate,
  onAddChild,
  onRemove,
}: {
  node: SitemapNode;
  path: number[];
  depth: number;
  disabled: boolean;
  onUpdate: (path: number[], patch: Partial<SitemapNode>) => void;
  onAddChild: (path: number[]) => void;
  onRemove: (path: number[]) => void;
}) {
  return (
    <div className={depth > 0 ? "ml-4 border-l pl-3" : ""}>
      <div className="flex gap-2 py-1">
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
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => onRemove(path)}
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>
      {node.children.map((child, ci) => (
        <SitemapNodeEditor
          key={child.id}
          node={child}
          path={[...path, ci]}
          depth={depth + 1}
          disabled={disabled}
          onUpdate={onUpdate}
          onAddChild={onAddChild}
          onRemove={onRemove}
        />
      ))}
      {!disabled && depth < MAX_SITEMAP_DEPTH - 1 && (
        <Button
          variant="ghost"
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

// ─── Sortable 래퍼 ───

function SortableFlowItem({
  flow,
  flowIndex,
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => onStepReorder(flowIndex, event)}
      >
        <SortableContext
          items={flow.steps.map((s) => s.id)}
          strategy={verticalListSortingStrategy}
        >
          {flow.steps.map((step, si) => (
            <SortableStepItem
              key={step.id}
              step={step}
              stepIndex={si}
              flowIndex={flowIndex}
              disabled={disabled}
              onUpdateStep={onUpdateStep}
              onRemoveStep={onRemoveStep}
            />
          ))}
        </SortableContext>
      </DndContext>
      {!disabled && (
        <Button
          variant="ghost"
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
  disabled,
  onUpdateStep,
  onRemoveStep,
}: {
  step: FlowStep;
  stepIndex: number;
  flowIndex: number;
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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="ml-4 flex gap-2">
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
  );
}

// ─── 메인 폼 ───

export function InfoArchitectureForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const { data, patchData } = usePhaseData("infoArchitecture");
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

  const flowSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  return (
    <div className="space-y-6">
      {/* Sitemap — 4뎁스 재귀 */}
      <section className="space-y-3">
        <SectionHeader title="사이트맵" tooltip={SECTION_TOOLTIPS["infoArchitecture.sitemap"]}>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addSitemapNode}>
              <Plus className="size-3.5" />
              노드 추가
            </Button>
          )}
        </SectionHeader>
        {data.sitemap.map((node, i) => (
          <div key={node.id} className="rounded-lg border p-3 space-y-1">
            <SitemapNodeEditor
              node={node}
              path={[i]}
              depth={0}
              disabled={disabled}
              onUpdate={handleUpdateNode}
              onAddChild={handleAddChild}
              onRemove={handleRemoveNode}
            />
          </div>
        ))}
      </section>

      {/* User Flows — DnD 정렬 */}
      <section className="space-y-3">
        <SectionHeader title="유저 플로우" tooltip={SECTION_TOOLTIPS["infoArchitecture.userFlows"]}>
          {!disabled && (
            <Button variant="ghost" size="xs" onClick={addFlow}>
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
            {data.userFlows.map((flow, fi) => (
              <SortableFlowItem
                key={flow.id}
                flow={flow}
                flowIndex={fi}
                disabled={disabled}
                onUpdate={updateFlow}
                onRemove={removeFlow}
                onAddStep={addStep}
                onUpdateStep={updateStep}
                onRemoveStep={removeStep}
                onStepReorder={handleStepReorder}
              />
            ))}
          </SortableContext>
        </DndContext>
      </section>

      {/* Global Nav Rules */}
      <section className="space-y-2">
        <SectionHeader title="글로벌 네비게이션 규칙" tooltip={SECTION_TOOLTIPS["infoArchitecture.navRules"]} />
        <StringList
          items={data.globalNavRules}
          onChange={(globalNavRules) => patchData({ globalNavRules })}
          placeholder="규칙"
          disabled={disabled}
        />
      </section>
    </div>
  );
}
