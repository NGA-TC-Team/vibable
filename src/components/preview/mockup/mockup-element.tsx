"use client";

import {
  Menu,
  Type,
  Heading,
  MousePointer,
  TextCursorInput,
  ImageIcon,
  SquareStack,
  List,
  Minus,
  Circle,
  PanelLeft,
  Table2,
  FileInput,
  Layers,
  LayoutGrid,
  GalleryHorizontal,
  User,
  Tag,
  ToggleLeft,
  CheckSquare,
  CircleDot,
  ChevronDown,
  Search,
  ChevronRight,
  ChevronsLeftRight,
  Loader,
  MapPin,
  Video,
  BarChart3,
  Maximize2,
  Grid3X3,
  Rows3,
  Columns3,
} from "lucide-react";
import type { MouseEvent as ReactMouseEvent } from "react";
import { LAYOUT_TYPES } from "@/lib/element-prop-schemas";
import type { MockupElement, MockupElementType } from "@/types/phases";
import {
  renderSketchElement,
  type SketchRendererContext,
} from "./sketch/sketch-renderers";

type RendererContext = {
  allElements: MockupElement[];
  selectedIds?: string[];
  onSelect?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
  onFocusDetail?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
};

function makeSketchContext(
  ctx: RendererContext | undefined,
): SketchRendererContext | undefined {
  if (!ctx) return undefined;
  return {
    allElements: ctx.allElements,
    selectedIds: ctx.selectedIds,
    onSelect: ctx.onSelect,
    onFocus: ctx.onFocusDetail,
    renderChild: (child) => (
      <MockupElementView
        key={child.id}
        element={child}
        allElements={ctx.allElements}
        selected={ctx.selectedIds?.includes(child.id)}
        selectedIds={ctx.selectedIds}
        onSelect={(event) => ctx.onSelect?.(child.id, event)}
        onSelectId={ctx.onSelect}
        onFocusDetail={ctx.onFocusDetail}
      />
    ),
  };
}

export const ELEMENT_ICONS: Record<string, React.ReactNode> = {
  header: <Menu className="size-4" />,
  text: <Type className="size-4" />,
  heading: <Heading className="size-4" />,
  button: <MousePointer className="size-4" />,
  input: <TextCursorInput className="size-4" />,
  image: <ImageIcon className="size-4" />,
  card: <SquareStack className="size-4" />,
  list: <List className="size-4" />,
  divider: <Minus className="size-4" />,
  icon: <Circle className="size-4" />,
  bottomNav: <LayoutGrid className="size-4" />,
  sidebar: <PanelLeft className="size-4" />,
  table: <Table2 className="size-4" />,
  form: <FileInput className="size-4" />,
  modal: <Layers className="size-4" />,
  tabs: <LayoutGrid className="size-4" />,
  carousel: <GalleryHorizontal className="size-4" />,
  avatar: <User className="size-4" />,
  badge: <Tag className="size-4" />,
  toggle: <ToggleLeft className="size-4" />,
  checkbox: <CheckSquare className="size-4" />,
  radio: <CircleDot className="size-4" />,
  dropdown: <ChevronDown className="size-4" />,
  searchbar: <Search className="size-4" />,
  breadcrumb: <ChevronRight className="size-4" />,
  pagination: <ChevronsLeftRight className="size-4" />,
  progressbar: <Loader className="size-4" />,
  map: <MapPin className="size-4" />,
  video: <Video className="size-4" />,
  chart: <BarChart3 className="size-4" />,
  spacer: <Maximize2 className="size-4" />,
  grid: <Grid3X3 className="size-4" />,
  hstack: <Columns3 className="size-4" />,
  vstack: <Rows3 className="size-4" />,
};

export const ELEMENT_LABELS: Record<string, string> = {
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

const DEFAULT_SIZES: Record<string, { width: number; height: number }> = {
  header: { width: 375, height: 48 },
  text: { width: 300, height: 60 },
  heading: { width: 300, height: 36 },
  button: { width: 120, height: 36 },
  input: { width: 280, height: 36 },
  image: { width: 200, height: 150 },
  card: { width: 300, height: 120 },
  list: { width: 280, height: 96 },
  divider: { width: 300, height: 8 },
  icon: { width: 40, height: 40 },
  bottomNav: { width: 375, height: 56 },
  sidebar: { width: 200, height: 320 },
  table: { width: 320, height: 120 },
  form: { width: 300, height: 140 },
  modal: { width: 280, height: 180 },
  tabs: { width: 300, height: 36 },
  carousel: { width: 300, height: 160 },
  avatar: { width: 48, height: 48 },
  badge: { width: 70, height: 24 },
  toggle: { width: 48, height: 28 },
  checkbox: { width: 140, height: 28 },
  radio: { width: 140, height: 28 },
  dropdown: { width: 200, height: 36 },
  searchbar: { width: 280, height: 36 },
  breadcrumb: { width: 220, height: 24 },
  pagination: { width: 180, height: 28 },
  progressbar: { width: 260, height: 20 },
  map: { width: 300, height: 200 },
  video: { width: 300, height: 180 },
  chart: { width: 300, height: 200 },
  spacer: { width: 100, height: 40 },
  grid: { width: 300, height: 200 },
  hstack: { width: 300, height: 60 },
  vstack: { width: 200, height: 200 },
};

export function getDefaultSize(type: string) {
  return DEFAULT_SIZES[type] ?? { width: 100, height: 40 };
}

interface MockupElementProps {
  element: MockupElement;
  allElements?: MockupElement[];
  selected?: boolean;
  onSelect?: (event: ReactMouseEvent<HTMLDivElement>) => void;
  selectedIds?: string[];
  onSelectId?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
  onFocusDetail?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
}

export function MockupElementView({
  element,
  allElements = [],
  selected,
  onSelect,
  selectedIds,
  onSelectId,
  onFocusDetail,
}: MockupElementProps) {
  const ctx: RendererContext | undefined =
    allElements.length > 0
      ? { allElements, selectedIds, onSelect: onSelectId, onFocusDetail }
      : undefined;

  const displayLabel = element.alias?.trim() || ELEMENT_LABELS[element.type] || element.type;

  return (
    <div
      className={`relative h-full w-full cursor-grab text-foreground active:cursor-grabbing ${selected ? "outline outline-2 outline-primary outline-offset-2" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(e);
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        onFocusDetail?.(element.id, e);
      }}
    >
      {renderSketchElement(element, makeSketchContext(ctx))}
      {selected && (
        <div className="pointer-events-none absolute -top-5 left-0 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground shadow-sm">
          {displayLabel}
          {!LAYOUT_TYPES.has(element.type) ? (
            <span className="opacity-70">{element.width}x{element.height}</span>
          ) : null}
        </div>
      )}
    </div>
  );
}

export function GhostPreview({
  id,
  elements,
  scale = 1,
}: {
  id: string;
  elements: MockupElement[];
  scale?: number;
}) {
  const el = elements.find((e) => e.id === id);
  if (!el) {
    const paletteType = id.replace("palette-", "") as MockupElementType;
    const size = getDefaultSize(paletteType);
    const ghostElement: MockupElement = {
      id,
      type: paletteType,
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
      props: {},
    };
    return (
      <div
        className="overflow-hidden rounded-lg bg-background/95 text-foreground opacity-95 shadow-2xl ring-2 ring-primary"
        style={{ width: size.width * scale, height: size.height * scale }}
      >
        <div
          style={{
            width: size.width,
            height: size.height,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {renderSketchElement(ghostElement)}
        </div>
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden rounded-lg bg-background/95 text-foreground opacity-95 shadow-2xl ring-2 ring-primary"
      style={{ width: el.width * scale, height: el.height * scale }}
    >
      <div
        style={{
          width: el.width,
          height: el.height,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        {renderSketchElement(el)}
      </div>
    </div>
  );
}
