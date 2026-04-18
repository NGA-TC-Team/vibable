"use client";

import { useRef, useState } from "react";
import {
  MousePointer2,
  StickyNote,
  Link as LinkIcon,
  CheckSquare,
  ArrowRightLeft,
  LayoutGrid,
  Columns3,
  Table as TableIcon,
  ImageIcon,
  FileIcon,
  Square,
  Circle,
  Diamond,
  Triangle,
  Hexagon,
  Type,
  Palette,
  Highlighter,
} from "lucide-react";
import { useIdeaNoteStore, type ActiveTool } from "@/services/store/idea-note-store";
import type { ShapeKind } from "@/types/idea-note";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ToolDef {
  value: ActiveTool;
  label: string;
  icon: typeof MousePointer2;
  shortcut?: string;
}

const TOOLS_BEFORE_SHAPE: ToolDef[] = [
  { value: "select", label: "선택", icon: MousePointer2, shortcut: "V" },
  { value: "note", label: "노트", icon: StickyNote, shortcut: "N" },
  { value: "link", label: "링크", icon: LinkIcon },
  { value: "todo", label: "할 일", icon: CheckSquare, shortcut: "D" },
  { value: "line", label: "연결선", icon: ArrowRightLeft, shortcut: "L" },
  { value: "board", label: "보드", icon: LayoutGrid, shortcut: "B" },
  { value: "column", label: "컬럼", icon: Columns3, shortcut: "C" },
  { value: "table", label: "테이블", icon: TableIcon, shortcut: "K" },
  { value: "image", label: "이미지", icon: ImageIcon, shortcut: "I" },
  { value: "file", label: "파일", icon: FileIcon, shortcut: "F" },
];

const TOOLS_AFTER_SHAPE: ToolDef[] = [
  { value: "draw", label: "형광펜", icon: Highlighter, shortcut: "P" },
  { value: "text", label: "텍스트", icon: Type, shortcut: "T" },
  { value: "swatch", label: "컬러", icon: Palette },
];

const SHAPE_OPTIONS: Array<{ kind: ShapeKind; label: string; icon: typeof Square }> = [
  { kind: "rect", label: "사각형", icon: Square },
  { kind: "ellipse", label: "원", icon: Circle },
  { kind: "diamond", label: "다이아몬드", icon: Diamond },
  { kind: "triangle", label: "삼각형", icon: Triangle },
  { kind: "hexagon", label: "육각형", icon: Hexagon },
];

const SHAPE_ICON: Record<ShapeKind, typeof Square> = {
  rect: Square,
  ellipse: Circle,
  diamond: Diamond,
  triangle: Triangle,
  hexagon: Hexagon,
};

const LONG_PRESS_MS = 400;

function ShapeToolButton() {
  const activeTool = useIdeaNoteStore((s) => s.activeTool);
  const setActiveTool = useIdeaNoteStore((s) => s.setActiveTool);
  const activeShapeKind = useIdeaNoteStore((s) => s.activeShapeKind);
  const setActiveShapeKind = useIdeaNoteStore((s) => s.setActiveShapeKind);
  const [menuOpen, setMenuOpen] = useState(false);
  const longPressTimerRef = useRef<number | null>(null);

  const active = activeTool === "shape";
  const Icon = SHAPE_ICON[activeShapeKind];

  const openMenu = () => setMenuOpen(true);

  const handleMouseDown = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = window.setTimeout(() => {
      openMenu();
    }, LONG_PRESS_MS);
  };

  const clearLongPress = () => {
    if (longPressTimerRef.current !== null) {
      window.clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    clearLongPress();
    if (menuOpen) return;
    setActiveTool("shape");
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    clearLongPress();
    openMenu();
  };

  return (
    <Popover open={menuOpen} onOpenChange={setMenuOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <button
              type="button"
              onMouseDown={handleMouseDown}
              onMouseUp={clearLongPress}
              onMouseLeave={clearLongPress}
              onClick={handleClick}
              onContextMenu={handleContextMenu}
              aria-pressed={active}
              aria-label="도형"
              className={cn(
                "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
            </button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent side="right">
          도형{" "}
          <span className="ml-1 text-muted-foreground">
            S · R(사각형) · O(원)
          </span>
        </TooltipContent>
      </Tooltip>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={6}
        className="w-auto p-1.5"
      >
        <div className="flex items-center gap-1">
          {SHAPE_OPTIONS.map((opt) => {
            const ShapeIcon = opt.icon;
            const isCurrent = activeShapeKind === opt.kind;
            return (
              <button
                key={opt.kind}
                type="button"
                onClick={() => {
                  setActiveShapeKind(opt.kind);
                  setActiveTool("shape");
                  setMenuOpen(false);
                }}
                className={cn(
                  "flex size-9 items-center justify-center rounded-md transition-colors",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                aria-label={opt.label}
              >
                <ShapeIcon className="size-4" />
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function SimpleToolButton({ tool }: { tool: ToolDef }) {
  const activeTool = useIdeaNoteStore((s) => s.activeTool);
  const setActiveTool = useIdeaNoteStore((s) => s.setActiveTool);
  const Icon = tool.icon;
  const active = activeTool === tool.value;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={() => setActiveTool(tool.value)}
          aria-pressed={active}
          aria-label={tool.label}
          className={cn(
            "flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors",
            active
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon className="size-4" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {tool.label}
        {tool.shortcut && (
          <span className="ml-1 text-muted-foreground">{tool.shortcut}</span>
        )}
      </TooltipContent>
    </Tooltip>
  );
}

export function IdeaNoteToolbar() {
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex h-full flex-col items-center gap-1 border-r bg-card/50 px-1.5 py-3">
        {TOOLS_BEFORE_SHAPE.map((tool) => (
          <SimpleToolButton key={tool.value} tool={tool} />
        ))}
        <ShapeToolButton />
        {TOOLS_AFTER_SHAPE.map((tool) => (
          <SimpleToolButton key={tool.value} tool={tool} />
        ))}
      </div>
    </TooltipProvider>
  );
}
