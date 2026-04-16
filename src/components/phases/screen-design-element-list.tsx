"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight, GripVertical, X } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { AnimatedList, AnimatedListItem } from "@/components/editor/animated-list";
import { FieldLabel } from "@/components/editor/field-label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ELEMENT_PROP_SCHEMAS, LAYOUT_TYPES, type PropField } from "@/lib/element-prop-schemas";
import type { MockupElement, MockupNoteMode } from "@/types/phases";

const ELEMENT_LABELS: Record<string, string> = {
  header: "Header", text: "Text", heading: "Heading", button: "Button",
  input: "Input", image: "Image", card: "Card", list: "List",
  divider: "Divider", icon: "Icon", bottomNav: "Bottom Nav", sidebar: "Sidebar",
  table: "Table", form: "Form", modal: "Modal", tabs: "Tabs",
  carousel: "Carousel", avatar: "Avatar", badge: "Badge", toggle: "Toggle",
  checkbox: "Checkbox", radio: "Radio", dropdown: "Dropdown", searchbar: "Searchbar",
  breadcrumb: "Breadcrumb", pagination: "Pagination", progressbar: "Progress",
  map: "Map", video: "Video", chart: "Chart", spacer: "Spacer",
  grid: "Grid", hstack: "HStack", vstack: "VStack",
};

interface ElementListProps {
  elements: MockupElement[];
  selectedIds: string[];
  onSelect: (id: string | null, additive?: boolean) => void;
  onUpdateElement?: (id: string, patch: Partial<MockupElement>) => void;
  onRemoveElement: (id: string) => void;
  onRemoveElements?: (ids: string[]) => void;
  onReorderElements?: (orderedIds: string[]) => void;
  disabled?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  getNoteValue?: (element: MockupElement) => string;
  getNoteMode?: (element: MockupElement) => MockupNoteMode;
  onUpdateNote?: (id: string, note: string) => void;
  onUpdateNoteMode?: (id: string, mode: MockupNoteMode) => void;
}

function getTopLevelElements(elements: MockupElement[]): MockupElement[] {
  const childIds = new Set(elements.flatMap((el) => el.children ?? []));
  return elements.filter((el) => !childIds.has(el.id));
}

function getChildElements(parent: MockupElement, allElements: MockupElement[]): MockupElement[] {
  if (!parent.children?.length) return [];
  return parent.children
    .map((id) => allElements.find((el) => el.id === id))
    .filter((el): el is MockupElement => el != null);
}

interface CardSharedProps {
  allElements: MockupElement[];
  selectedIds: string[];
  onSelect: (id: string | null, additive?: boolean) => void;
  onRemoveElement: (id: string) => void;
  onRemoveElements?: (ids: string[]) => void;
  onUpdateElement?: (id: string, patch: Partial<MockupElement>) => void;
  disabled?: boolean;
  compact: boolean;
  getNoteValue?: (element: MockupElement) => string;
  getNoteMode?: (element: MockupElement) => MockupNoteMode;
  onUpdateNote?: (id: string, note: string) => void;
  onUpdateNoteMode?: (id: string, mode: MockupNoteMode) => void;
}

export function ScreenDesignElementList({
  elements,
  selectedIds,
  onSelect,
  onUpdateElement,
  onRemoveElement,
  onRemoveElements,
  onReorderElements,
  disabled,
  compact = false,
  emptyMessage = "미리보기에서 UI 요소를 드래그하여 추가하세요",
  getNoteValue,
  getNoteMode,
  onUpdateNote,
  onUpdateNoteMode,
}: ElementListProps) {
  const [dragActiveId, setDragActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  if (elements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {emptyMessage}
      </p>
    );
  }

  const topLevel = getTopLevelElements(elements);
  const topLevelIds = topLevel.map((el) => el.id);

  const handleDragStart = (event: DragStartEvent) => {
    setDragActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setDragActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id || !onReorderElements) return;

    const oldIndex = topLevelIds.indexOf(active.id as string);
    const newIndex = topLevelIds.indexOf(over.id as string);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = [...topLevelIds];
    reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, active.id as string);

    const childIds = elements
      .filter((el) => !reordered.includes(el.id))
      .map((el) => el.id);
    onReorderElements([...reordered, ...childIds]);
  };

  const draggedElement = dragActiveId
    ? elements.find((el) => el.id === dragActiveId)
    : null;

  const shared: CardSharedProps = {
    allElements: elements,
    selectedIds,
    onSelect,
    onRemoveElement,
    onRemoveElements,
    onUpdateElement,
    disabled,
    compact,
    getNoteValue,
    getNoteMode,
    onUpdateNote,
    onUpdateNoteMode,
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={topLevelIds} strategy={verticalListSortingStrategy}>
        <AnimatedList className={compact ? "space-y-1.5" : "space-y-2"}>
          {topLevel.map((el) => (
            <AnimatedListItem key={el.id}>
              <SortableElementCard element={el} shared={shared} depth={0} />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </SortableContext>
      <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
        {draggedElement ? (
          <div className="rounded-lg border bg-card p-2 shadow-lg opacity-90">
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {ELEMENT_LABELS[draggedElement.type] ?? draggedElement.type}
            </span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function SortableElementCard({
  element,
  shared,
  depth,
}: {
  element: MockupElement;
  shared: CardSharedProps;
  depth: number;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <ElementListCard
        element={element}
        shared={shared}
        dragListeners={listeners}
        depth={depth}
      />
    </div>
  );
}

function PropFieldEditor({
  field,
  value,
  disabled,
  onChange,
}: {
  field: PropField;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  if (field.type === "select" && field.options) {
    return (
      <Select value={value || undefined} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className="h-7 text-xs">
          <SelectValue placeholder={field.placeholder ?? "선택"} />
        </SelectTrigger>
        <SelectContent>
          {field.options.map((opt) => (
            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={field.type === "number" ? "number" : "text"}
      placeholder={field.placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className="h-7 text-xs"
    />
  );
}

function ElementListCard({
  element,
  shared,
  dragListeners,
  depth,
}: {
  element: MockupElement;
  shared: CardSharedProps;
  dragListeners?: Record<string, unknown>;
  depth: number;
}) {
  const {
    allElements, selectedIds, onSelect, onRemoveElement, onRemoveElements, onUpdateElement,
    disabled, compact, getNoteValue, getNoteMode, onUpdateNote, onUpdateNoteMode,
  } = shared;

  const isSelected = selectedIds.includes(element.id);
  const noteMode = getNoteMode?.(element) ?? "same";
  const noteValue = getNoteValue?.(element) ?? element.designNote ?? "";
  const canControlMode = Boolean(onUpdateNoteMode);
  const propSchema = ELEMENT_PROP_SCHEMAS[element.type];
  const isLayout = LAYOUT_TYPES.has(element.type);
  const children = getChildElements(element, allElements);
  const [expanded, setExpanded] = useState(true);

  const handleNoteChange = (value: string) => {
    if (onUpdateNote) {
      onUpdateNote(element.id, value);
      return;
    }
    onUpdateElement?.(element.id, { designNote: value });
  };

  const handlePropChange = (key: string, value: string) => {
    onUpdateElement?.(element.id, {
      props: { ...element.props, [key]: value },
    });
  };

  return (
    <div style={{ paddingLeft: depth * 24 }}>
      <div
        className={`group cursor-pointer rounded-xl border bg-background/80 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25 ${
          compact ? "space-y-1.5 p-2.5" : "space-y-2 p-3"
        } ${
          isSelected
            ? "border-primary/70 shadow-md shadow-primary/10"
            : "border-border/70 hover:-translate-y-px hover:border-muted-foreground/40 hover:shadow-sm"
        }`}
        onClick={(event) => onSelect(element.id, event.metaKey || event.ctrlKey)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect(element.id, e.metaKey || e.ctrlKey);
          }
        }}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {dragListeners && !disabled ? (
              <button
                className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
                {...dragListeners}
              >
                <GripVertical className="size-3.5" />
              </button>
            ) : null}
            {isLayout && children.length > 0 ? (
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
              >
                {expanded
                  ? <ChevronDown className="size-3.5" />
                  : <ChevronRight className="size-3.5" />}
              </button>
            ) : null}
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {ELEMENT_LABELS[element.type] ?? element.type}
            </span>
            {!isLayout ? (
              <span className="text-[10px] text-muted-foreground">
                {element.width}x{element.height}
              </span>
            ) : null}
          </div>
          {!disabled && (
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={(e) => {
                e.stopPropagation();
                if (selectedIds.length > 1 && selectedIds.includes(element.id) && onRemoveElements) {
                  onRemoveElements(selectedIds);
                  return;
                }

                onRemoveElement(element.id);
              }}
              className="hover:border-destructive/40 hover:text-destructive"
            >
              <X className="size-3.5" />
            </Button>
          )}
        </div>

        {propSchema && propSchema.length > 0 ? (
          <div
            className="grid gap-x-3 gap-y-1.5"
            style={{ gridTemplateColumns: compact ? "110px 1fr" : "124px 1fr" }}
            onClick={(e) => e.stopPropagation()}
          >
            {propSchema.map((field) => (
              <div key={field.key} className="contents">
                <FieldLabel
                  icon={field.icon}
                  tooltip={field.tooltip ?? `${field.label} 설정을 설명합니다.`}
                  className="min-h-7 text-muted-foreground"
                  labelClassName="text-[10px] font-medium text-muted-foreground"
                  iconClassName="size-3 text-muted-foreground"
                >
                  {field.label}
                </FieldLabel>
                <PropFieldEditor
                  field={field}
                  value={element.props[field.key] ?? ""}
                  disabled={disabled}
                  onChange={(v) => handlePropChange(field.key, v)}
                />
              </div>
            ))}
          </div>
        ) : null}

        {canControlMode ? (
          <div
            className={`grid gap-2 ${compact ? "grid-cols-[88px_1fr]" : "grid-cols-[104px_1fr]"}`}
            onClick={(e) => e.stopPropagation()}
          >
            <Select
              value={noteMode}
              onValueChange={(value) => onUpdateNoteMode?.(element.id, value as MockupNoteMode)}
              disabled={disabled}
            >
              <SelectTrigger className={compact ? "h-8 text-xs" : "text-xs"}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="same">동일</SelectItem>
                <SelectItem value="custom">개별</SelectItem>
                <SelectItem value="none">해당 상태에서 없음</SelectItem>
              </SelectContent>
            </Select>

            {noteMode === "none" ? (
              <div className="flex min-h-9 items-center rounded-md border border-dashed px-3 text-xs text-muted-foreground">
                이 조합에서는 UI 구성을 표시하지 않습니다.
              </div>
            ) : (
              <Textarea
                placeholder={
                  noteMode === "same"
                    ? "전체 기본 UI 구성 메모를 입력하세요..."
                    : "이 상태/뷰포트 전용 UI 구성을 입력하세요..."
                }
                value={noteValue}
                onChange={(e) => handleNoteChange(e.target.value)}
                rows={compact ? 2 : 3}
                disabled={disabled}
                className="text-xs"
              />
            )}
          </div>
        ) : (
          <Textarea
            placeholder="이 요소의 설계 의도, 기획 메모를 기록하세요..."
            value={noteValue}
            onChange={(e) => handleNoteChange(e.target.value)}
            rows={compact ? 1 : 2}
            disabled={disabled}
            className="text-xs"
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>

      {isLayout && expanded && children.length > 0 ? (
        <AnimatedList className={compact ? "mt-1.5 space-y-1.5" : "mt-2 space-y-2"}>
          {children.map((child) => (
            <AnimatedListItem key={child.id}>
              <ElementListCard
                element={child}
                shared={shared}
                depth={depth + 1}
              />
            </AnimatedListItem>
          ))}
        </AnimatedList>
      ) : null}
    </div>
  );
}
