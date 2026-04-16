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

type RendererContext = {
  allElements: MockupElement[];
  selectedIds?: string[];
  onSelect?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
};

function renderChildren(
  parent: MockupElement,
  ctx: RendererContext | undefined,
) {
  if (!ctx || !parent.children?.length) return null;
  const children = parent.children
    .map((id) => ctx.allElements.find((e) => e.id === id))
    .filter((e): e is MockupElement => e != null);
  if (children.length === 0) return null;
  return children.map((child) => (
    <MockupElementView
      key={child.id}
      element={child}
      allElements={ctx.allElements}
      selected={ctx.selectedIds?.includes(child.id)}
      onSelect={(event) => ctx.onSelect?.(child.id, event)}
    />
  ));
}

const ELEMENT_RENDERERS: Record<
  string,
  (el: MockupElement, ctx?: RendererContext) => React.ReactNode
> = {
  header: () => (
    <div className="flex h-full items-center gap-3 rounded-b-lg bg-muted/60 px-4 shadow-sm">
      <Menu className="size-4" />
      <div className="h-3 flex-1 rounded bg-foreground/15" />
    </div>
  ),
  text: () => (
    <div className="flex h-full flex-col items-center justify-center gap-1.5 px-4 py-3">
      <div className="h-2.5 w-11/12 rounded-full bg-foreground/15" />
      <div className="h-2.5 w-4/5 rounded-full bg-foreground/15" />
      <div className="h-2.5 w-3/5 rounded-full bg-foreground/15" />
    </div>
  ),
  heading: () => (
    <div className="flex h-full items-center justify-center px-4 py-3">
      <div className="h-4.5 w-2/3 rounded-full bg-foreground/20" />
    </div>
  ),
  button: (el) => (
    <div className="flex h-full items-center justify-center rounded-md bg-primary/80 px-3">
      <span className="text-xs text-primary-foreground">{el.props.text || "Button"}</span>
    </div>
  ),
  input: (el) => (
    <div className="flex h-full items-center rounded-md border bg-background px-3">
      <span className="text-xs text-muted-foreground">{el.props.placeholder || "Input..."}</span>
    </div>
  ),
  image: () => (
    <div className="flex h-full items-center justify-center rounded-md bg-muted">
      <ImageIcon className="size-6 text-muted-foreground" />
    </div>
  ),
  card: () => (
    <div className="h-full rounded-xl border bg-card px-4 py-3 shadow-sm">
      <div className="mb-3 h-3 w-1/2 rounded-full bg-foreground/15" />
      <div className="h-2 w-full rounded bg-foreground/10" />
      <div className="mt-1.5 h-2 w-3/4 rounded bg-foreground/10" />
    </div>
  ),
  list: () => (
    <div className="flex h-full flex-col items-center justify-center gap-2 px-4 py-3">
      {[1, 2, 3].map((n) => (
        <div key={n} className="flex w-11/12 items-center gap-2">
          <div className="size-1.5 rounded-full bg-foreground/30" />
          <div className="h-2 flex-1 rounded bg-foreground/15" />
        </div>
      ))}
    </div>
  ),
  divider: () => (
    <div className="flex h-full items-center">
      <div className="h-px w-full bg-border" />
    </div>
  ),
  icon: () => (
    <div className="flex h-full items-center justify-center">
      <Circle className="size-6 text-muted-foreground" />
    </div>
  ),
  bottomNav: () => (
    <div className="flex h-full items-center justify-around bg-muted/60 px-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="flex flex-col items-center gap-0.5">
          <div className="size-4 rounded bg-foreground/20" />
          <div className="h-1.5 w-6 rounded bg-foreground/10" />
        </div>
      ))}
    </div>
  ),
  sidebar: () => (
    <div className="flex h-full flex-col gap-2 border-r bg-muted/30 p-2">
      {[1, 2, 3, 4].map((n) => (
        <div key={n} className="h-3 w-full rounded bg-foreground/10" />
      ))}
    </div>
  ),
  table: () => (
    <div className="flex h-full flex-col px-3 py-2">
      <div className="flex gap-2 border-b pb-2">
        {[1, 2, 3].map((n) => <div key={n} className="h-2 flex-1 rounded bg-foreground/20" />)}
      </div>
      {[1, 2].map((row) => (
        <div key={row} className="flex gap-2 border-b py-2">
          {[1, 2, 3].map((n) => <div key={n} className="h-2 flex-1 rounded bg-foreground/10" />)}
        </div>
      ))}
    </div>
  ),
  form: () => (
    <div className="flex h-full flex-col items-center justify-center gap-2.5 px-4 py-3">
      <div className="h-2 w-2/5 rounded bg-foreground/15" />
      <div className="h-6 w-11/12 rounded border" />
      <div className="h-2 w-2/5 rounded bg-foreground/15" />
      <div className="h-6 w-11/12 rounded border" />
    </div>
  ),
  modal: () => (
    <div className="flex h-full flex-col rounded-lg border bg-card p-3 shadow-lg">
      <div className="mb-2 h-3 w-1/2 rounded bg-foreground/20" />
      <div className="flex-1" />
      <div className="flex justify-end gap-1">
        <div className="h-5 w-12 rounded bg-muted" />
        <div className="h-5 w-12 rounded bg-primary/60" />
      </div>
    </div>
  ),
  tabs: () => (
    <div className="flex h-full flex-col px-4 pt-3">
      <div className="flex gap-2 border-b pb-2">
        <div className="h-6 w-16 rounded-t-md bg-primary/20 px-2 text-[8px]" />
        <div className="h-6 w-16 rounded-t-md bg-muted px-2 text-[8px]" />
        <div className="h-6 w-16 rounded-t-md bg-muted px-2 text-[8px]" />
      </div>
      <div className="flex-1 bg-background pt-3" />
    </div>
  ),
  carousel: () => (
    <div className="flex h-full items-center gap-2 px-4 py-3">
      <ChevronRight className="size-3 rotate-180 text-muted-foreground" />
      <div className="flex-1 rounded bg-muted" style={{ height: "80%" }} />
      <ChevronRight className="size-3 text-muted-foreground" />
    </div>
  ),
  avatar: () => (
    <div className="flex h-full items-center justify-center">
      <div className="flex size-10 items-center justify-center rounded-full bg-muted">
        <User className="size-5 text-muted-foreground" />
      </div>
    </div>
  ),
  badge: (el) => (
    <div className="flex h-full items-center justify-center">
      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-medium">
        {el.props.text || "Badge"}
      </span>
    </div>
  ),
  toggle: () => (
    <div className="flex h-full items-center justify-center">
      <div className="h-5 w-9 rounded-full bg-primary/60 p-0.5">
        <div className="size-4 rounded-full bg-white shadow" style={{ marginLeft: "auto" }} />
      </div>
    </div>
  ),
  checkbox: () => (
    <div className="flex h-full items-center justify-center gap-2 px-2">
      <CheckSquare className="size-4 text-primary" />
      <div className="h-2 w-16 rounded bg-foreground/15" />
    </div>
  ),
  radio: () => (
    <div className="flex h-full items-center justify-center gap-2 px-2">
      <CircleDot className="size-4 text-primary" />
      <div className="h-2 w-16 rounded bg-foreground/15" />
    </div>
  ),
  dropdown: () => (
    <div className="flex h-full items-center justify-between rounded-md border px-3">
      <span className="text-xs text-muted-foreground">Select...</span>
      <ChevronDown className="size-3 text-muted-foreground" />
    </div>
  ),
  searchbar: () => (
    <div className="flex h-full items-center gap-2 rounded-md border px-3">
      <Search className="size-3.5 text-muted-foreground" />
      <span className="text-xs text-muted-foreground">Search...</span>
    </div>
  ),
  breadcrumb: () => (
    <div className="flex h-full items-center justify-center gap-1 px-2 text-[10px] text-muted-foreground">
      <span>Home</span>
      <ChevronRight className="size-2.5" />
      <span>Page</span>
      <ChevronRight className="size-2.5" />
      <span className="text-foreground">Current</span>
    </div>
  ),
  pagination: () => (
    <div className="flex h-full items-center justify-center gap-1">
      {["«", "1", "2", "3", "»"].map((t) => (
        <div key={t} className="flex size-5 items-center justify-center rounded border text-[8px]">
          {t}
        </div>
      ))}
    </div>
  ),
  progressbar: () => (
    <div className="flex h-full items-center px-2">
      <div className="h-2 w-full rounded-full bg-muted">
        <div className="h-2 w-2/3 rounded-full bg-primary/70" />
      </div>
    </div>
  ),
  map: () => (
    <div className="flex h-full items-center justify-center rounded bg-muted">
      <MapPin className="size-6 text-muted-foreground" />
    </div>
  ),
  video: () => (
    <div className="flex h-full items-center justify-center rounded bg-muted">
      <Video className="size-6 text-muted-foreground" />
    </div>
  ),
  chart: () => (
    <div className="flex h-full items-center justify-center rounded bg-muted">
      <BarChart3 className="size-6 text-muted-foreground" />
    </div>
  ),
  spacer: () => <div className="h-full w-full" />,
  grid: (el, ctx) => {
    const childContent = renderChildren(el, ctx);
    return (
      <div
        className="h-full w-full rounded-xl border-2 border-dashed border-muted-foreground/30 p-2"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${el.props.columns || "2"}, 1fr)`,
          gap: `${el.props.gap || "12"}px`,
        }}
      >
        {childContent ?? (
          <div className="col-span-full flex items-center justify-center text-[10px] text-muted-foreground">
            Grid ({el.props.columns || "2"}열)
          </div>
        )}
      </div>
    );
  },
  hstack: (el, ctx) => {
    const childContent = renderChildren(el, ctx);
    return (
      <div
        className="flex h-full w-full items-center rounded-xl border-2 border-dashed border-muted-foreground/30 p-2"
        style={{ gap: `${el.props.gap || "12"}px` }}
      >
        {childContent ?? (
          <div className="flex-1 text-center text-[10px] text-muted-foreground">HStack</div>
        )}
      </div>
    );
  },
  vstack: (el, ctx) => {
    const childContent = renderChildren(el, ctx);
    return (
      <div
        className="flex h-full w-full flex-col rounded-xl border-2 border-dashed border-muted-foreground/30 p-2"
        style={{ gap: `${el.props.gap || "12"}px` }}
      >
        {childContent ?? (
          <div className="flex-1 flex items-center justify-center text-[10px] text-muted-foreground">VStack</div>
        )}
      </div>
    );
  },
};

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
  list: { width: 280, height: 80 },
  divider: { width: 300, height: 8 },
  icon: { width: 40, height: 40 },
  bottomNav: { width: 375, height: 56 },
  sidebar: { width: 200, height: 300 },
  table: { width: 320, height: 100 },
  form: { width: 300, height: 120 },
  modal: { width: 280, height: 180 },
  tabs: { width: 300, height: 36 },
  carousel: { width: 300, height: 160 },
  avatar: { width: 48, height: 48 },
  badge: { width: 60, height: 24 },
  toggle: { width: 48, height: 28 },
  checkbox: { width: 140, height: 28 },
  radio: { width: 140, height: 28 },
  dropdown: { width: 200, height: 36 },
  searchbar: { width: 280, height: 36 },
  breadcrumb: { width: 200, height: 24 },
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
}

export function MockupElementView({
  element,
  allElements = [],
  selected,
  onSelect,
  selectedIds,
  onSelectId,
}: MockupElementProps) {
  const renderer = ELEMENT_RENDERERS[element.type] ?? (() => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      {element.type}
    </div>
  ));

  const ctx: RendererContext | undefined =
    allElements.length > 0
      ? { allElements, selectedIds, onSelect: onSelectId }
      : undefined;

  return (
    <div
      className={`relative h-full w-full cursor-grab active:cursor-grabbing ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(e);
      }}
    >
      {renderer(element, ctx)}
      {selected && (
        <div className="pointer-events-none absolute -top-5 left-0 flex items-center gap-1 rounded bg-primary px-1.5 py-0.5 text-[9px] font-medium text-primary-foreground shadow-sm">
          {ELEMENT_LABELS[element.type] ?? element.type}
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
    const paletteType = id.replace("palette-", "");
    const size = getDefaultSize(paletteType);
    const ghostElement: MockupElement = {
      id,
      type: paletteType as MockupElementType,
      x: 0,
      y: 0,
      width: size.width,
      height: size.height,
      props: {},
    };
    const renderer = ELEMENT_RENDERERS[ghostElement.type] ?? (() => (
      <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
        {ghostElement.type}
      </div>
    ));

    return (
      <div
        className="overflow-hidden rounded-xl ring-2 ring-primary bg-card opacity-90 shadow-2xl cursor-grabbing"
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
          {renderer(ghostElement)}
        </div>
      </div>
    );
  }

  const renderer = ELEMENT_RENDERERS[el.type] ?? (() => (
    <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
      {el.type}
    </div>
  ));

  return (
    <div
      className="overflow-hidden rounded-xl ring-2 ring-primary bg-card opacity-90 shadow-2xl cursor-grabbing"
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
        {renderer(el)}
      </div>
    </div>
  );
}
