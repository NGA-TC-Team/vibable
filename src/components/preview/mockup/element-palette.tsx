"use client";

import { useDraggable } from "@dnd-kit/core";
import { ELEMENT_ICONS, ELEMENT_LABELS } from "./mockup-element";
import type { MockupElementType } from "@/types/phases";

const CATEGORIES: { label: string; types: MockupElementType[] }[] = [
  {
    label: "레이아웃",
    types: ["header", "sidebar", "card", "divider", "spacer", "modal", "tabs"],
  },
  {
    label: "콘텐츠",
    types: ["heading", "text", "image", "icon", "avatar", "badge", "list", "table", "carousel"],
  },
  {
    label: "입력",
    types: ["button", "input", "searchbar", "toggle", "checkbox", "radio", "dropdown", "form"],
  },
  {
    label: "네비게이션",
    types: ["bottomNav", "breadcrumb", "pagination"],
  },
  {
    label: "데이터",
    types: ["chart", "map", "video", "progressbar"],
  },
];

function PaletteItem({ type }: { type: MockupElementType }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-1.5 rounded px-2 py-1 text-xs hover:bg-accent transition-colors ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      {ELEMENT_ICONS[type]}
      <span>{ELEMENT_LABELS[type] ?? type}</span>
    </button>
  );
}

export function ElementPalette() {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-2">
      {CATEGORIES.map((cat) => (
        <div key={cat.label}>
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {cat.label}
          </p>
          <div className="flex flex-col">
            {cat.types.map((type) => (
              <PaletteItem key={type} type={type} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
