"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { usePhaseData } from "@/hooks/use-phase.hook";
import {
  DEFAULT_CUSTOM_WIDTHS,
  LAYOUT_PRESETS,
  resolveLayoutWidths,
} from "@/lib/layout-presets";
import type { LayoutPresetKey, LayoutViewportWidths } from "@/types/phases";

type ViewportAxis = keyof LayoutViewportWidths;

const AXIS_LABELS: Record<ViewportAxis, string> = {
  mobile: "모바일",
  tablet: "태블릿",
  desktop: "데스크톱",
};

/**
 * 뷰포트/상태 바 아래에 배치되는 컨테이너 폭 프리셋 선택 그룹.
 * 선택 시 DesignSystemPhase.layout에 값을 반영한다.
 */
export function ContainerWidthPicker({ disabled = false }: { disabled?: boolean }) {
  const { data, patchData } = usePhaseData("designSystem");
  const layout = data?.layout;
  const presetKey: LayoutPresetKey | undefined = layout?.presetKey;
  const customWidths: LayoutViewportWidths =
    layout?.customWidths ?? DEFAULT_CUSTOM_WIDTHS;

  const widths = useMemo(
    () => resolveLayoutWidths(presetKey, layout?.customWidths),
    [presetKey, layout?.customWidths],
  );

  if (!data || !layout) return null;

  const handlePresetChange = (nextKey: LayoutPresetKey) => {
    const nextWidths =
      nextKey === "custom"
        ? layout.customWidths ?? DEFAULT_CUSTOM_WIDTHS
        : resolveLayoutWidths(nextKey, layout.customWidths);

    patchData({
      layout: {
        ...layout,
        presetKey: nextKey,
        maxContentWidthByViewport: nextWidths ?? undefined,
        customWidths:
          nextKey === "custom"
            ? layout.customWidths ?? DEFAULT_CUSTOM_WIDTHS
            : layout.customWidths,
      },
    });
  };

  const handleCustomWidthChange = (axis: ViewportAxis, raw: string) => {
    const parsed = Number(raw);
    const safeValue = Number.isFinite(parsed) && parsed > 0
      ? Math.round(parsed)
      : customWidths[axis];

    const nextCustom: LayoutViewportWidths = {
      ...customWidths,
      [axis]: safeValue,
    };

    patchData({
      layout: {
        ...layout,
        presetKey: "custom",
        customWidths: nextCustom,
        maxContentWidthByViewport: nextCustom,
      },
    });
  };

  const isCustom = presetKey === "custom";

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-3 py-1.5 text-xs shadow-sm">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        컨테이너 폭
      </span>
      <Select
        value={presetKey ?? undefined}
        onValueChange={(value) => handlePresetChange(value as LayoutPresetKey)}
        disabled={disabled}
      >
        <SelectTrigger className="h-7 w-36 text-xs">
          <SelectValue placeholder="프리셋 선택" />
        </SelectTrigger>
        <SelectContent>
          {LAYOUT_PRESETS.map((preset) => (
            <SelectItem key={preset.key} value={preset.key}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {widths && !isCustom ? (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>M {widths.mobile}</span>
          <span>T {widths.tablet}</span>
          <span>D {widths.desktop}</span>
        </div>
      ) : null}
      {isCustom ? (
        <div className="flex items-center gap-1.5">
          {(Object.keys(AXIS_LABELS) as ViewportAxis[]).map((axis) => (
            <label key={axis} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              {AXIS_LABELS[axis]}
              <Input
                type="number"
                min={160}
                max={2560}
                value={customWidths[axis]}
                onChange={(e) => handleCustomWidthChange(axis, e.target.value)}
                disabled={disabled}
                className="h-7 w-16 text-xs"
              />
            </label>
          ))}
        </div>
      ) : null}
    </div>
  );
}
