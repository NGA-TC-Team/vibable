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
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PhaseWaterProgress } from "@/components/editor/phase-water-progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const isSidebarCollapsed = useEditorStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);

  const cliLabels: Record<number, string> = {
    3: "커맨드 트리",
    4: "입출력 명세",
    6: "UX 라이팅",
  };

  const completedCount = Array.from({ length: 7 }).reduce<number>((acc, _, i) => {
    const dataKey = PHASE_DATA_KEYS[i];
    return acc + (phaseData ? (isPhaseComplete(i, phaseData[dataKey]) ? 1 : 0) : 0);
  }, 0);

  const progressPercent = Math.round((completedCount / 7) * 100);

  if (isSidebarCollapsed) {
    return (
      <TooltipProvider>
        <nav className="flex flex-col items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon-xs" onClick={toggleSidebar} className="mb-2">
                <PanelLeft className="size-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">펼치기</TooltipContent>
          </Tooltip>

          <PhaseWaterProgress
            value={progressPercent}
            orientation="vertical"
            className="mb-2 h-16 w-3 shrink-0"
          />
          <span className="mb-2 text-[10px] text-muted-foreground">{completedCount}/7</span>

          {Array.from({ length: 7 }).map((_, i) => {
            const Icon = phaseIcons[i];
            const baseLabel =
              projectType === "cli" && cliLabels[i] ? cliLabels[i] : PHASE_LABELS[i];
            const active = currentPhase === i;

            return (
              <Tooltip key={i}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onPhaseChange(i)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-lg transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">{baseLabel}</TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
      </TooltipProvider>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <PhaseWaterProgress
            value={progressPercent}
            orientation="horizontal"
            className="h-3 min-w-0 flex-1"
          />
          <span className="text-xs text-muted-foreground">{completedCount}/7</span>
        </div>
        <Button variant="ghost" size="icon-xs" onClick={toggleSidebar} className="ml-2">
          <PanelLeftClose className="size-4" />
        </Button>
      </div>

      {Array.from({ length: 7 }).map((_, i) => {
        const Icon = phaseIcons[i];
        const baseLabel =
          projectType === "cli" && cliLabels[i]
            ? cliLabels[i]
            : PHASE_LABELS[i];
        const screenCount =
          i === 4 && phaseData?.screenDesign?.pages?.length
            ? ` (${phaseData.screenDesign.pages.length})`
            : "";
        const label = `${baseLabel}${screenCount}`;
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
