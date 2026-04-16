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
    >
      <ToggleGroupItem value="mobile" aria-label="모바일">
        <Smartphone className="size-4" />
      </ToggleGroupItem>
      {projectType === "web" && (
        <ToggleGroupItem value="tablet" aria-label="태블릿">
          <Tablet className="size-4" />
        </ToggleGroupItem>
      )}
      {projectType === "web" && (
        <ToggleGroupItem value="desktop" aria-label="데스크탑">
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
