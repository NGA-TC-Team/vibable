"use client";

import { cn } from "@/lib/utils";
import type { DesignSystemPreset } from "@/lib/presets/design-system-presets";

interface PresetCardProps {
  preset: DesignSystemPreset;
  isSelected: boolean;
  onSelect: () => void;
}

export function PresetCard({ preset, isSelected, onSelect }: PresetCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "rounded-lg border p-3 text-left transition-all hover:shadow-md",
        isSelected
          ? "ring-2 ring-primary border-primary"
          : "hover:border-foreground/30",
      )}
    >
      <div className="flex gap-1 mb-2">
        {preset.colorPalette.slice(0, 4).map((c, i) => (
          <div
            key={i}
            className="size-4 rounded-full border"
            style={{ backgroundColor: c.hex }}
          />
        ))}
      </div>
      <p className="text-sm font-medium">{preset.name}</p>
      <p className="text-[10px] text-muted-foreground">{preset.category}</p>
    </button>
  );
}
