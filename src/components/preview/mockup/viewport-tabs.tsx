"use client";

import { Monitor, Smartphone, Tablet } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { ProjectType } from "@/types/phases";

export type Viewport = "mobile" | "tablet" | "desktop";

interface ViewportTabsProps {
  value: Viewport;
  onChange: (v: Viewport) => void;
  projectType: ProjectType;
}

export function ViewportTabs({ value, onChange, projectType }: ViewportTabsProps) {
  if (projectType === "mobile") return null;

  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onChange(v as Viewport); }}
      size="sm"
      className="rounded-3xl bg-muted/60 p-1"
    >
      <ToggleGroupItem
        value="mobile"
        aria-label="모바일"
        className="rounded-2xl border border-transparent data-[state=on]:border-border data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
      >
        <Smartphone className="size-4" />
      </ToggleGroupItem>
      {projectType === "web" && (
        <ToggleGroupItem
          value="tablet"
          aria-label="태블릿"
          className="rounded-2xl border border-transparent data-[state=on]:border-border data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        >
          <Tablet className="size-4" />
        </ToggleGroupItem>
      )}
      {projectType === "web" && (
        <ToggleGroupItem
          value="desktop"
          aria-label="데스크탑"
          className="rounded-2xl border border-transparent data-[state=on]:border-border data-[state=on]:bg-background data-[state=on]:text-foreground data-[state=on]:shadow-sm"
        >
          <Monitor className="size-4" />
        </ToggleGroupItem>
      )}
    </ToggleGroup>
  );
}

export const VIEWPORT_WIDTHS: Record<Viewport, number> = {
  mobile: 375,
  tablet: 768,
  desktop: 1280,
};
