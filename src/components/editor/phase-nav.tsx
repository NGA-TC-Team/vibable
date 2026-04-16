"use client";

import {
  FileText,
  Users,
  ClipboardList,
  Network,
  Layout,
  Database,
  Palette,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PHASE_LABELS, type ProjectType } from "@/types/phases";
import { useEditorStore } from "@/services/store/editor-store";

const phaseIcons = [
  FileText,
  Users,
  ClipboardList,
  Network,
  Layout,
  Database,
  Palette,
];

function isPhaseComplete(phaseIndex: number, phaseData: unknown): boolean {
  if (!phaseData) return false;
  const pd = phaseData as Record<string, unknown>;
  switch (phaseIndex) {
    case 0:
      return !!(pd as { projectName?: string }).projectName;
    case 1:
      return ((pd as { personas?: unknown[] }).personas?.length ?? 0) > 0;
    case 2:
      return ((pd as { functional?: unknown[] }).functional?.length ?? 0) > 0;
    case 3:
      return ((pd as { sitemap?: unknown[] }).sitemap?.length ?? 0) > 0;
    case 4:
      return ((pd as { pages?: unknown[] }).pages?.length ?? 0) > 0;
    case 5:
      return ((pd as { entities?: unknown[] }).entities?.length ?? 0) > 0;
    case 6:
      return !!(pd as { visualTheme?: { mood?: string } }).visualTheme?.mood;
    default:
      return false;
  }
}

const PHASE_DATA_KEYS = [
  "overview",
  "userScenario",
  "requirements",
  "infoArchitecture",
  "screenDesign",
  "dataModel",
  "designSystem",
] as const;

interface PhaseNavProps {
  projectType: ProjectType;
  onPhaseChange: (phase: number) => void;
}

export function PhaseNav({ projectType, onPhaseChange }: PhaseNavProps) {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const phaseData = useEditorStore((s) => s.phaseData);

  const cliLabels: Record<number, string> = {
    3: "커맨드 트리",
    4: "입출력 명세",
    6: "UX 라이팅",
  };

  return (
    <nav className="flex flex-col gap-1">
      {Array.from({ length: 7 }).map((_, i) => {
        const Icon = phaseIcons[i];
        const label =
          projectType === "cli" && cliLabels[i]
            ? cliLabels[i]
            : PHASE_LABELS[i];
        const dataKey = PHASE_DATA_KEYS[i];
        const complete = phaseData
          ? isPhaseComplete(i, phaseData[dataKey])
          : false;
        const active = currentPhase === i;

        return (
          <button
            key={i}
            onClick={() => onPhaseChange(i)}
            className={cn(
              "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
              active
                ? "bg-primary/10 font-medium text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate text-left">{label}</span>
            {!complete && !active && (
              <AlertCircle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
            )}
          </button>
        );
      })}
    </nav>
  );
}
