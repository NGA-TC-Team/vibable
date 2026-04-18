"use client";

import { type MouseEvent as ReactMouseEvent } from "react";
import { ChevronDown, ChevronRight, ImageIcon, Menu, MapPin, User, Video } from "lucide-react";
import type { MockupElement, MockupElementType } from "@/types/phases";
import { Handwritten, RoughBox, RoughLine } from "./rough-primitives";

export type SketchRendererContext = {
  allElements: MockupElement[];
  selectedIds?: string[];
  onSelect?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
  onFocus?: (id: string, event: ReactMouseEvent<HTMLDivElement>) => void;
  renderChild: (child: MockupElement) => React.ReactNode;
};

/**
 * 설계 지침
 * ---
 * - roughjs는 **큰 외곽 박스 / 구분선 / 표 그리드**에만 제한적으로 쓴다. 작은 원·점·체크마크에
 *   rough stroke를 쓰면 여러 패스가 덧칠되어 낙서처럼 보이므로, 그런 요소는 일반 HTML/CSS로
 *   그린다.
 * - 채움색은 `color-mix(in oklch, currentColor NN%, transparent)` 형식만 사용. 테마 토큰이
 *   oklch라 `hsl(var(--foreground))`는 무효 — color-mix가 다크/라이트 대응에 가장 안전.
 * - 텍스트는 `<Handwritten>`으로 손글씨 느낌.
 */

const WIREFRAME_FILL = (pct: number) =>
  `color-mix(in oklch, currentColor ${pct}%, transparent)`;

function Frame({ children, className = "" }: { children?: React.ReactNode; className?: string }) {
  return <div className={`relative h-full w-full ${className}`}>{children}</div>;
}

function SketchHeader({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(4)}
          fillStyle="solid"
          strokeWidth={1.1}
          roughness={0.9}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center gap-3 px-4">
        <Menu className="size-4 opacity-70" />
        <div className="flex-1 truncate">
          <Handwritten size="sm" weight="semibold">
            {el.props.text || "Brand"}
          </Handwritten>
        </div>
        <div className="flex h-6 w-14 items-center justify-center rounded-md bg-foreground/85">
          <Handwritten size="xs" weight="semibold" className="text-background">
            Go
          </Handwritten>
        </div>
      </div>
    </Frame>
  );
}

function SketchText({ el }: { el: MockupElement }) {
  const lineWidths = [0.94, 0.82, 0.62];
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4 py-3">
      {lineWidths.map((w, i) => (
        <div
          key={i}
          className="h-[3px] rounded-full bg-foreground/30"
          style={{ width: `${w * 100}%` }}
        />
      ))}
    </div>
  );
}

function SketchHeading({ el }: { el: MockupElement }) {
  return (
    <div className="flex h-full items-center px-3">
      <Handwritten size="lg" weight="bold" className="truncate">
        {el.props.text || "Heading"}
      </Handwritten>
    </div>
  );
}

function SketchButton({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(82)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3">
        <Handwritten size="sm" weight="semibold" className="text-background">
          {el.props.text || "Button"}
        </Handwritten>
      </div>
    </Frame>
  );
}

function SketchInput({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center px-3">
        <Handwritten size="sm" className="opacity-55">
          {el.props.placeholder || "Input..."}
        </Handwritten>
      </div>
    </Frame>
  );
}

function SketchImage({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(6)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.9}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <ImageIcon className="size-7 opacity-50" />
      </div>
    </Frame>
  );
}

function SketchCard({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(2)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.9}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col gap-2 px-4 py-3">
        <Handwritten size="sm" weight="semibold" className="truncate">
          {el.props.text || "Card title"}
        </Handwritten>
        <div className="h-[3px] w-[90%] rounded-full bg-foreground/25" />
        <div className="h-[3px] w-[70%] rounded-full bg-foreground/25" />
      </div>
    </Frame>
  );
}

function SketchList({ el }: { el: MockupElement }) {
  const rows = Math.max(2, Math.min(5, Math.floor(el.height / 22)));
  const widths = [0.76, 0.88, 0.66, 0.82, 0.58];
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4 py-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="size-1.5 shrink-0 rounded-full bg-foreground/70" />
          <div
            className="h-[3px] rounded-full bg-foreground/25"
            style={{ width: `${(widths[i % widths.length] ?? 0.7) * 100}%` }}
          />
        </div>
      ))}
    </div>
  );
}

function SketchDivider({ el }: { el: MockupElement }) {
  return (
    <div className="flex h-full items-center">
      <RoughLine
        width={el.width}
        height={el.height}
        x1={4}
        y1={el.height / 2}
        x2={el.width - 4}
        y2={el.height / 2}
        seed={el.id}
        strokeWidth={1.2}
        roughness={1}
      />
    </div>
  );
}

function SketchIcon({ el }: { el: MockupElement }) {
  const size = Math.min(el.width, el.height) - 4;
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="rounded-full border border-foreground/60"
        style={{ width: size, height: size }}
      />
    </div>
  );
}

function SketchBottomNav({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(4)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.9}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-around px-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div className="size-4 rounded-md border border-foreground/60" />
            <div className="h-[3px] w-5 rounded-full bg-foreground/30" />
          </div>
        ))}
      </div>
    </Frame>
  );
}

const SIDEBAR_LABELS = ["Dashboard", "Deals", "Notes", "Emails", "Reports", "Settings", "Help"];

function SketchSidebar({ el }: { el: MockupElement }) {
  const rows = Math.max(3, Math.min(SIDEBAR_LABELS.length, Math.floor(el.height / 36)));
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(3)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.9}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col gap-2 px-3 py-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-sm border border-foreground/50" />
            <Handwritten size="xs" className="opacity-80">
              {SIDEBAR_LABELS[i] ?? `Item ${i + 1}`}
            </Handwritten>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function SketchTable({ el }: { el: MockupElement }) {
  const cols = 3;
  const headerHeight = 24;
  const availableRows = Math.max(2, Math.min(5, Math.floor((el.height - headerHeight - 6) / 22)));
  const bodyHeight = el.height - headerHeight;
  const rowHeight = bodyHeight / availableRows;
  const headers = ["Name", "Status", "Date"];
  const cellLabels = [
    ["Acme Inc.", "Active", "2026-04-01"],
    ["Globex", "Paused", "2026-03-28"],
    ["Initech", "Active", "2026-03-22"],
    ["Umbrella", "Archived", "2026-03-15"],
    ["Soylent", "Active", "2026-03-08"],
  ];
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-x-1 inset-y-1 flex flex-col overflow-hidden text-foreground">
        <div
          className="flex items-center border-b border-foreground/40 bg-foreground/10"
          style={{ height: headerHeight }}
        >
          {headers.slice(0, cols).map((label, i) => (
            <div
              key={label}
              className="flex flex-1 items-center px-2"
              style={i < cols - 1 ? { borderRight: "1px solid color-mix(in oklch, currentColor 25%, transparent)" } : undefined}
            >
              <Handwritten size="xs" weight="bold">
                {label}
              </Handwritten>
            </div>
          ))}
        </div>
        <div className="flex flex-1 flex-col">
          {Array.from({ length: availableRows }).map((_, r) => (
            <div
              key={r}
              className={`flex items-center ${r < availableRows - 1 ? "border-b border-foreground/15" : ""}`}
              style={{ height: rowHeight }}
            >
              {Array.from({ length: cols }).map((_, c) => {
                const sample = cellLabels[r % cellLabels.length]?.[c] ?? "";
                return (
                  <div
                    key={c}
                    className="flex flex-1 items-center px-2"
                    style={c < cols - 1 ? { borderRight: "1px solid color-mix(in oklch, currentColor 12%, transparent)" } : undefined}
                  >
                    <Handwritten size="xs" className="truncate opacity-70">
                      {sample}
                    </Handwritten>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </Frame>
  );
}

function SketchForm({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-center absolute inset-0 flex flex-col justify-center gap-3 px-4 py-3">
        <div>
          <Handwritten size="xs" weight="medium" className="opacity-70">
            Name
          </Handwritten>
          <div className="mt-1 h-5 rounded border border-foreground/50" />
        </div>
        <div>
          <Handwritten size="xs" weight="medium" className="opacity-70">
            Email
          </Handwritten>
          <div className="mt-1 h-5 rounded border border-foreground/50" />
        </div>
      </div>
    </Frame>
  );
}

function SketchModal({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0 rounded-lg bg-background">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={1.2}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex flex-col gap-2 px-4 py-3">
        <Handwritten size="sm" weight="bold">
          {el.props.text || "Dialog title"}
        </Handwritten>
        <div className="h-[3px] w-[88%] rounded-full bg-foreground/25" />
        <div className="flex-1" />
        <div className="flex justify-end gap-2">
          <div className="flex h-6 w-14 items-center justify-center rounded border border-foreground/60">
            <Handwritten size="xs">Cancel</Handwritten>
          </div>
          <div className="flex h-6 w-14 items-center justify-center rounded bg-foreground/85">
            <Handwritten size="xs" weight="semibold" className="text-background">
              OK
            </Handwritten>
          </div>
        </div>
      </div>
    </Frame>
  );
}

function SketchTabs({ el }: { el: MockupElement }) {
  const tabs = ["Overview", "Detail", "Log"];
  return (
    <Frame>
      <div className="absolute inset-x-3 bottom-2 h-px bg-foreground/40" />
      <div className="pointer-events-none absolute inset-x-3 top-1 flex gap-4 pb-2">
        {tabs.map((label, i) => (
          <div
            key={label}
            className={`relative flex items-center justify-center px-2 ${
              i === 0 ? "border-b-2 border-foreground" : ""
            }`}
            style={{ height: Math.max(22, el.height - 10) }}
          >
            <Handwritten size="xs" weight={i === 0 ? "semibold" : "normal"}>
              {label}
            </Handwritten>
          </div>
        ))}
      </div>
    </Frame>
  );
}

function SketchCarousel({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(4)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-4">
        <ChevronRight className="size-4 rotate-180 opacity-60" />
        <Handwritten size="sm">Slide 1 / 3</Handwritten>
        <ChevronRight className="size-4 opacity-60" />
      </div>
    </Frame>
  );
}

function SketchAvatar({ el }: { el: MockupElement }) {
  const size = Math.min(el.width, el.height) - 4;
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="flex items-center justify-center rounded-full border border-foreground/50 bg-foreground/5"
        style={{ width: size, height: size }}
      >
        <User className="size-5 opacity-70" />
      </div>
    </div>
  );
}

function SketchBadge({ el }: { el: MockupElement }) {
  return (
    <div className="flex h-full items-center justify-center">
      <span className="rounded-full bg-foreground/15 px-2 py-0.5">
        <Handwritten size="xs" weight="semibold">
          {el.props.text || "Badge"}
        </Handwritten>
      </span>
    </div>
  );
}

function SketchToggle({ el }: { el: MockupElement }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div
        className="relative rounded-full bg-foreground/20"
        style={{ width: el.width - 4, height: el.height - 4 }}
      >
        <span
          className="absolute top-1/2 right-1 size-4 -translate-y-1/2 rounded-full bg-background shadow-sm"
        />
      </div>
    </div>
  );
}

function SketchCheckbox({ el }: { el: MockupElement }) {
  return (
    <div className="flex h-full items-center gap-2 px-2">
      <span className="flex size-4 items-center justify-center rounded border border-foreground/60 bg-foreground/5">
        <svg viewBox="0 0 12 12" className="size-3 text-foreground/80">
          <path d="M2 6 L5 9 L10 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <Handwritten size="xs">{el.props.text || "Check"}</Handwritten>
    </div>
  );
}

function SketchRadio({ el }: { el: MockupElement }) {
  return (
    <div className="flex h-full items-center gap-2 px-2">
      <span className="flex size-4 items-center justify-center rounded-full border border-foreground/60">
        <span className="size-2 rounded-full bg-foreground/80" />
      </span>
      <Handwritten size="xs">{el.props.text || "Option"}</Handwritten>
    </div>
  );
}

function SketchDropdown({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-3">
        <Handwritten size="sm" className="opacity-70">
          {el.props.placeholder || "Select..."}
        </Handwritten>
        <ChevronDown className="size-3.5 opacity-60" />
      </div>
    </Frame>
  );
}

function SketchSearchbar({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center gap-2 px-3">
        <span className="flex size-3.5 items-center justify-center rounded-full border border-foreground/60">
          <span className="size-1 rounded-full bg-foreground/70" />
        </span>
        <Handwritten size="sm" className="opacity-70">
          {el.props.placeholder || "Search..."}
        </Handwritten>
      </div>
    </Frame>
  );
}

function SketchBreadcrumb() {
  return (
    <div className="flex h-full items-center gap-2 px-2">
      <Handwritten size="xs" className="opacity-60">Home</Handwritten>
      <ChevronRight className="size-3 opacity-60" />
      <Handwritten size="xs" className="opacity-60">Section</Handwritten>
      <ChevronRight className="size-3 opacity-60" />
      <Handwritten size="xs" weight="semibold">Current</Handwritten>
    </div>
  );
}

function SketchPagination() {
  const items = ["‹", "1", "2", "3", "›"];
  return (
    <div className="flex h-full items-center justify-center gap-1">
      {items.map((t, i) => (
        <div
          key={`${t}-${i}`}
          className={`flex size-6 items-center justify-center rounded border border-foreground/50 ${
            i === 2 ? "bg-foreground/10" : ""
          }`}
        >
          <Handwritten size="xs">{t}</Handwritten>
        </div>
      ))}
    </div>
  );
}

function SketchProgressbar({ el }: { el: MockupElement }) {
  const pct = Math.max(0, Math.min(100, Number(el.props.value) || 60)) / 100;
  return (
    <div className="flex h-full items-center px-2">
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-foreground/15">
        <div className="h-full rounded-full bg-foreground/75" style={{ width: `${pct * 100}%` }} />
      </div>
    </div>
  );
}

function SketchMap({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(4)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <MapPin className="size-6 opacity-70" />
      </div>
    </Frame>
  );
}

function SketchVideo({ el }: { el: MockupElement }) {
  return (
    <Frame>
      <div className="absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          fill={WIREFRAME_FILL(6)}
          fillStyle="solid"
          strokeWidth={1}
          roughness={0.8}
        />
      </div>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <Video className="size-6 opacity-70" />
      </div>
    </Frame>
  );
}

function SketchBarChart({ el }: { el: MockupElement }) {
  const bars = [0.45, 0.82, 0.55, 0.95, 0.7, 0.4, 0.68];
  return (
    <Frame className="px-3 py-3">
      <div className="absolute inset-x-3 bottom-3 h-px bg-foreground/50" />
      <div className="absolute bottom-3 left-3 top-3 w-px bg-foreground/50" />
      <div className="absolute inset-x-5 bottom-4 top-4 flex items-end justify-between gap-1">
        {bars.map((h, i) => (
          <div
            key={i}
            className="w-3 rounded-sm bg-foreground/75"
            style={{ height: `${h * 100}%` }}
          />
        ))}
      </div>
    </Frame>
  );
}

function SketchLineChart({ el }: { el: MockupElement }) {
  const points = [0.3, 0.55, 0.42, 0.78, 0.6, 0.88, 0.72];
  const innerLeft = 12;
  const innerRight = el.width - 12;
  const baseY = el.height - 14;
  const topY = 14;
  const stepX = (innerRight - innerLeft) / (points.length - 1);
  const coords = points.map((p, i) => ({
    x: innerLeft + i * stepX,
    y: baseY - (baseY - topY) * p,
  }));
  const pathD = coords
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  return (
    <Frame>
      <svg
        viewBox={`0 0 ${el.width} ${el.height}`}
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
      >
        <line x1={innerLeft} y1={baseY} x2={innerRight} y2={baseY} stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        <line x1={innerLeft} y1={baseY} x2={innerLeft} y2={topY} stroke="currentColor" strokeOpacity="0.5" strokeWidth="1" />
        <path d={pathD} fill="none" stroke="currentColor" strokeOpacity="0.85" strokeWidth="1.8" strokeLinejoin="round" />
        {coords.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={2.5} fill="currentColor" />
        ))}
      </svg>
    </Frame>
  );
}

function SketchPieChart({ el }: { el: MockupElement }) {
  const size = Math.min(el.width, el.height) - 8;
  return (
    <div className="flex h-full items-center justify-center">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="text-foreground/80"
        style={{ width: size, height: size }}
      >
        <circle cx={size / 2} cy={size / 2} r={size / 2 - 1} fill="currentColor" fillOpacity="0.12" stroke="currentColor" strokeOpacity="0.6" strokeWidth="1" />
        <line x1={size / 2} y1={size / 2} x2={size - 2} y2={size / 2} stroke="currentColor" strokeOpacity="0.6" />
        <line x1={size / 2} y1={size / 2} x2={size / 2 - size * 0.28} y2={size / 2 - size * 0.42} stroke="currentColor" strokeOpacity="0.6" />
        <line x1={size / 2} y1={size / 2} x2={size / 2 - size * 0.44} y2={size / 2 + size * 0.22} stroke="currentColor" strokeOpacity="0.6" />
      </svg>
    </div>
  );
}

function SketchChart({ el }: { el: MockupElement }) {
  const chartType = el.props.chartType || "bar";
  if (chartType === "line" || chartType === "area") return <SketchLineChart el={el} />;
  if (chartType === "pie") return <SketchPieChart el={el} />;
  return <SketchBarChart el={el} />;
}

function SketchSpacer() {
  return <div className="h-full w-full" />;
}

function SketchContainer({
  el,
  ctx,
  direction,
}: {
  el: MockupElement;
  ctx?: SketchRendererContext;
  direction: "grid" | "hstack" | "vstack";
}) {
  const children = el.children
    ?.map((id) => ctx?.allElements.find((e) => e.id === id))
    .filter((e): e is MockupElement => e != null) ?? [];

  const gap = Number(el.props.gap) || 12;
  const columns = Number(el.props.columns) || 2;

  const outerStyle: React.CSSProperties =
    direction === "grid"
      ? {
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
        }
      : {
          display: "flex",
          flexDirection: direction === "hstack" ? "row" : "column",
          gap: `${gap}px`,
          alignItems: direction === "hstack" ? "center" : "stretch",
        };

  return (
    <Frame className="p-2">
      <div className="pointer-events-none absolute inset-0">
        <RoughBox
          width={el.width}
          height={el.height}
          seed={el.id}
          strokeWidth={0.9}
          roughness={0.9}
        />
      </div>
      <div className="relative h-full w-full" style={outerStyle}>
        {children.length > 0 ? (
          children.map((child) => ctx?.renderChild(child))
        ) : (
          <div className="col-span-full flex items-center justify-center">
            <Handwritten size="xs" className="opacity-60">
              {direction === "grid"
                ? `Grid (${columns} cols)`
                : direction === "hstack"
                  ? "HStack"
                  : "VStack"}
            </Handwritten>
          </div>
        )}
      </div>
    </Frame>
  );
}

type RendererFn = (el: MockupElement, ctx?: SketchRendererContext) => React.ReactNode;

export const SKETCH_RENDERERS: Record<MockupElementType, RendererFn> = {
  header: (el) => <SketchHeader el={el} />,
  text: (el) => <SketchText el={el} />,
  heading: (el) => <SketchHeading el={el} />,
  button: (el) => <SketchButton el={el} />,
  input: (el) => <SketchInput el={el} />,
  image: (el) => <SketchImage el={el} />,
  card: (el) => <SketchCard el={el} />,
  list: (el) => <SketchList el={el} />,
  divider: (el) => <SketchDivider el={el} />,
  icon: (el) => <SketchIcon el={el} />,
  bottomNav: (el) => <SketchBottomNav el={el} />,
  sidebar: (el) => <SketchSidebar el={el} />,
  table: (el) => <SketchTable el={el} />,
  form: (el) => <SketchForm el={el} />,
  modal: (el) => <SketchModal el={el} />,
  tabs: (el) => <SketchTabs el={el} />,
  carousel: (el) => <SketchCarousel el={el} />,
  avatar: (el) => <SketchAvatar el={el} />,
  badge: (el) => <SketchBadge el={el} />,
  toggle: (el) => <SketchToggle el={el} />,
  checkbox: (el) => <SketchCheckbox el={el} />,
  radio: (el) => <SketchRadio el={el} />,
  dropdown: (el) => <SketchDropdown el={el} />,
  searchbar: (el) => <SketchSearchbar el={el} />,
  breadcrumb: () => <SketchBreadcrumb />,
  pagination: () => <SketchPagination />,
  progressbar: (el) => <SketchProgressbar el={el} />,
  map: (el) => <SketchMap el={el} />,
  video: (el) => <SketchVideo el={el} />,
  chart: (el) => <SketchChart el={el} />,
  spacer: () => <SketchSpacer />,
  grid: (el, ctx) => <SketchContainer el={el} ctx={ctx} direction="grid" />,
  hstack: (el, ctx) => <SketchContainer el={el} ctx={ctx} direction="hstack" />,
  vstack: (el, ctx) => <SketchContainer el={el} ctx={ctx} direction="vstack" />,
};

export function renderSketchElement(
  element: MockupElement,
  ctx?: SketchRendererContext,
): React.ReactNode {
  const renderer = SKETCH_RENDERERS[element.type];
  if (!renderer) {
    return (
      <div className="flex h-full items-center justify-center">
        <Handwritten size="xs" className="opacity-60">
          {element.type}
        </Handwritten>
      </div>
    );
  }
  return renderer(element, ctx);
}
