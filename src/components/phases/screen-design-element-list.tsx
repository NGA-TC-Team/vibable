"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MockupElement, MockupNoteMode } from "@/types/phases";

const ELEMENT_LABELS: Record<string, string> = {
  header: "Header",
  text: "Text",
  heading: "Heading",
  button: "Button",
  input: "Input",
  image: "Image",
  card: "Card",
  list: "List",
  divider: "Divider",
  icon: "Icon",
  bottomNav: "Bottom Nav",
  sidebar: "Sidebar",
  table: "Table",
  form: "Form",
  modal: "Modal",
  tabs: "Tabs",
  carousel: "Carousel",
  avatar: "Avatar",
  badge: "Badge",
  toggle: "Toggle",
  checkbox: "Checkbox",
  radio: "Radio",
  dropdown: "Dropdown",
  searchbar: "Searchbar",
  breadcrumb: "Breadcrumb",
  pagination: "Pagination",
  progressbar: "Progress",
  map: "Map",
  video: "Video",
  chart: "Chart",
  spacer: "Spacer",
  grid: "Grid",
  hstack: "HStack",
  vstack: "VStack",
};

interface ElementListProps {
  elements: MockupElement[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onUpdateElement?: (id: string, patch: Partial<MockupElement>) => void;
  onRemoveElement: (id: string) => void;
  disabled?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  getNoteValue?: (element: MockupElement) => string;
  getNoteMode?: (element: MockupElement) => MockupNoteMode;
  onUpdateNote?: (id: string, note: string) => void;
  onUpdateNoteMode?: (id: string, mode: MockupNoteMode) => void;
}

export function ScreenDesignElementList({
  elements,
  selectedId,
  onSelect,
  onUpdateElement,
  onRemoveElement,
  disabled,
  compact = false,
  emptyMessage = "미리보기에서 UI 요소를 드래그하여 추가하세요",
  getNoteValue,
  getNoteMode,
  onUpdateNote,
  onUpdateNoteMode,
}: ElementListProps) {
  if (elements.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className={compact ? "space-y-1.5" : "space-y-2"}>
      {elements.map((el) => (
        <ElementListCard
          key={el.id}
          element={el}
          selected={selectedId === el.id}
          onSelect={onSelect}
          onRemoveElement={onRemoveElement}
          onUpdateElement={onUpdateElement}
          disabled={disabled}
          compact={compact}
          getNoteValue={getNoteValue}
          getNoteMode={getNoteMode}
          onUpdateNote={onUpdateNote}
          onUpdateNoteMode={onUpdateNoteMode}
        />
      ))}
    </div>
  );
}

function ElementListCard({
  element,
  selected,
  onSelect,
  onRemoveElement,
  onUpdateElement,
  disabled,
  compact,
  getNoteValue,
  getNoteMode,
  onUpdateNote,
  onUpdateNoteMode,
}: {
  element: MockupElement;
  selected: boolean;
  onSelect: (id: string | null) => void;
  onRemoveElement: (id: string) => void;
  onUpdateElement?: (id: string, patch: Partial<MockupElement>) => void;
  disabled?: boolean;
  compact: boolean;
  getNoteValue?: (element: MockupElement) => string;
  getNoteMode?: (element: MockupElement) => MockupNoteMode;
  onUpdateNote?: (id: string, note: string) => void;
  onUpdateNoteMode?: (id: string, mode: MockupNoteMode) => void;
}) {
  const noteMode = getNoteMode?.(element) ?? "same";
  const noteValue = getNoteValue?.(element) ?? element.designNote ?? "";
  const canControlMode = Boolean(onUpdateNoteMode);

  const handleNoteChange = (value: string) => {
    if (onUpdateNote) {
      onUpdateNote(element.id, value);
      return;
    }

    onUpdateElement?.(element.id, { designNote: value });
  };

  return (
    <div
      className={`cursor-pointer rounded-lg border transition-colors ${
        compact ? "space-y-1.5 p-2.5" : "space-y-2 p-3"
      } ${
        selected ? "border-primary bg-primary/5" : "hover:border-muted-foreground/30"
      }`}
      onClick={() => onSelect(element.id)}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            {ELEMENT_LABELS[element.type] ?? element.type}
          </span>
          <span className="text-[10px] text-muted-foreground">
            {element.width}×{element.height}
          </span>
        </div>
        {!disabled && (
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveElement(element.id);
            }}
            className="hover:border-destructive/40 hover:text-destructive"
          >
            <X className="size-3.5" />
          </Button>
        )}
      </div>

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
  );
}
