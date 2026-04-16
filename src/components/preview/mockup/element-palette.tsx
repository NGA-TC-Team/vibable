"use client";

import {
  Database,
  LayoutTemplate,
  MousePointerClick,
  Navigation,
  Newspaper,
} from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import { Separator } from "@/components/ui/separator";
import { ELEMENT_ICONS, ELEMENT_LABELS } from "./mockup-element";
import type { MockupElementType } from "@/types/phases";

const CATEGORIES: {
  label: string;
  icon: React.ReactNode;
  types: MockupElementType[];
}[] = [
  {
    label: "레이아웃",
    icon: <LayoutTemplate className="size-3.5" />,
    types: ["header", "sidebar", "card", "divider", "spacer", "modal", "tabs", "grid", "hstack", "vstack"],
  },
  {
    label: "콘텐츠",
    icon: <Newspaper className="size-3.5" />,
    types: ["heading", "text", "image", "icon", "avatar", "badge", "list", "table", "carousel"],
  },
  {
    label: "입력",
    icon: <MousePointerClick className="size-3.5" />,
    types: ["button", "input", "searchbar", "toggle", "checkbox", "radio", "dropdown", "form"],
  },
  {
    label: "네비게이션",
    icon: <Navigation className="size-3.5" />,
    types: ["bottomNav", "breadcrumb", "pagination"],
  },
  {
    label: "데이터",
    icon: <Database className="size-3.5" />,
    types: ["chart", "map", "video", "progressbar"],
  },
];

function PaletteItem({ type, isActive }: { type: MockupElementType; isActive: boolean }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${type}`,
    data: { type, source: "palette" },
  });

  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex cursor-grab items-center gap-2 rounded-xl px-3 py-2 text-xs transition-colors hover:bg-accent active:cursor-grabbing ${
        isDragging || isActive ? "opacity-30" : ""
      }`}
    >
      {ELEMENT_ICONS[type]}
      <span>{ELEMENT_LABELS[type] ?? type}</span>
    </button>
  );
}

export function ElementPalette({ activeId }: { activeId?: string | null }) {
  return (
    <div className="flex h-full flex-col gap-6 px-2 py-4">
      {CATEGORIES.map((cat, index) => (
        <div key={cat.label} className="space-y-3">
          {index > 0 ? <Separator className="mb-1" /> : null}
          <div className="mb-2 flex items-center gap-1.5 pl-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {cat.icon}
            <p>{cat.label}</p>
          </div>
          <div className="flex flex-col gap-1">
            {cat.types.map((type) => (
              <PaletteItem
                key={type}
                type={type}
                isActive={activeId === `palette-${type}`}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
