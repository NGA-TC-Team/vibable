"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
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
  ListChecks,
  Workflow,
  Sparkles,
  Plug,
  ShieldAlert,
  Terminal,
  GitBranch,
  Repeat,
  Settings,
  Lightbulb,
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
import {
  AGENT_PHASE_LABELS,
  CLI_PHASE_LABELS,
  PHASE_LABELS,
  type PhaseData,
  type ProjectType,
} from "@/types/phases";
import { useEditorStore } from "@/services/store/editor-store";
import { useSystemRuntime } from "@/services/store/hooks";
import {
  AGENT_PHASE_DATA_KEYS,
  CLI_PHASE_DATA_KEYS,
  isAgentPhaseComplete,
  isCliPhaseComplete,
  isLegacyPhaseComplete,
  LEGACY_PHASE_DATA_KEYS,
} from "@/lib/phase-nav-config";

const legacyPhaseIcons = [
  FileText,
  Users,
  ClipboardList,
  Network,
  Layout,
  Database,
  Palette,
];

const agentPhaseIcons = [
  FileText,
  Users,
  ListChecks,
  Workflow,
  Sparkles,
  Plug,
  ShieldAlert,
];

const cliPhaseIcons = [
  FileText,
  Users,
  ListChecks,
  GitBranch,
  Repeat,
  Settings,
  Terminal,
];

interface PhaseNavProps {
  projectId: string;
  projectType: ProjectType;
  onPhaseChange: (phase: number) => void;
}

export function PhaseNav({ projectId, projectType, onPhaseChange }: PhaseNavProps) {
  const pathname = usePathname();
  const ideaNoteHref = `/workspace/${projectId}/idea-note`;
  const isIdeaNoteActive = pathname?.startsWith(ideaNoteHref) ?? false;
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const phaseData = useEditorStore((s) => s.phaseData);
  const isSidebarCollapsed = useEditorStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useEditorStore((s) => s.toggleSidebar);
  const { prefersReducedMotion } = useSystemRuntime();
  const expandedItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [expandedIndicator, setExpandedIndicator] = useState({ top: 0, height: 0 });

  const isAgent = projectType === "agent";
  const isCli = projectType === "cli";
  const dataKeys = isAgent
    ? AGENT_PHASE_DATA_KEYS
    : isCli
      ? CLI_PHASE_DATA_KEYS
      : LEGACY_PHASE_DATA_KEYS;
  const phaseIcons = isAgent
    ? agentPhaseIcons
    : isCli
      ? cliPhaseIcons
      : legacyPhaseIcons;

  const completedCount = Array.from({ length: 7 }).reduce<number>((acc, _, i) => {
    if (!phaseData) return acc;
    const complete = isAgent
      ? isAgentPhaseComplete(i, phaseData as PhaseData)
      : isCli
        ? isCliPhaseComplete(i, phaseData as PhaseData)
        : isLegacyPhaseComplete(
            i,
            phaseData[dataKeys[i] as keyof typeof phaseData],
          );
    return acc + (complete ? 1 : 0);
  }, 0);

  const progressPercent = Math.round((completedCount / 7) * 100);

  const labelForIndex = (i: number) => {
    if (isAgent) return AGENT_PHASE_LABELS[i];
    if (isCli) return CLI_PHASE_LABELS[i];
    return PHASE_LABELS[i];
  };

  const activeTransition = useMemo(
    () =>
      prefersReducedMotion
        ? { duration: 0 }
        : { duration: 0.22, ease: [0.22, 1, 0.36, 1] as const },
    [prefersReducedMotion],
  );

  useEffect(() => {
    if (isSidebarCollapsed) return;

    const activeItem = expandedItemRefs.current[currentPhase];
    if (!activeItem) return;

    const updateIndicator = () => {
      setExpandedIndicator({
        top: activeItem.offsetTop,
        height: activeItem.offsetHeight,
      });
    };

    updateIndicator();

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(activeItem);
    window.addEventListener("resize", updateIndicator);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateIndicator);
    };
  }, [
    currentPhase,
    isSidebarCollapsed,
    phaseData?.screenDesign?.pages?.length,
    phaseData?.agentArchitecture,
    phaseData?.agentBehavior,
  ]);

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

          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={ideaNoteHref}
                className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  isIdeaNoteActive
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Lightbulb className="size-4" />
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">아이디어 노트</TooltipContent>
          </Tooltip>

          <div className="my-2 h-px w-6 shrink-0 bg-border" />

          <div className="relative flex flex-col items-center gap-1">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute left-0 top-0 h-8 w-8 rounded-lg bg-primary/10 shadow-sm"
              animate={{ y: currentPhase * 36 }}
              transition={activeTransition}
            />
            {Array.from({ length: 7 }).map((_, i) => {
              const Icon = phaseIcons[i];
              const baseLabel = labelForIndex(i);
              const active = currentPhase === i;

              return (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onPhaseChange(i)}
                      className={cn(
                        "relative z-10 flex size-8 items-center justify-center rounded-lg transition-colors",
                        active
                          ? "font-medium text-primary"
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
          </div>
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

      <Link
        href={ideaNoteHref}
        className={cn(
          "relative z-10 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
          isIdeaNoteActive
            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Lightbulb className="size-4 shrink-0" />
        <span className="flex-1 truncate text-left">아이디어 노트</span>
      </Link>

      <div className="my-2 h-px w-full bg-border" />

      <div className="relative">
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 rounded-lg bg-primary/10 shadow-sm"
          animate={{ top: expandedIndicator.top, height: expandedIndicator.height }}
          initial={false}
          transition={activeTransition}
        />
        <div className="relative flex flex-col gap-1">
          {Array.from({ length: 7 }).map((_, i) => {
            const Icon = phaseIcons[i];
            const baseLabel = labelForIndex(i);
            const finalLabel =
              !isAgent && !isCli && i === 4 && phaseData?.screenDesign?.pages?.length
                ? `${baseLabel} (${phaseData.screenDesign.pages.length})`
                : isCli && i === 3 && phaseData?.commandTree?.commands?.length
                  ? `${baseLabel} (${phaseData.commandTree.commands.length})`
                  : baseLabel;

            const dataKey = dataKeys[i];
            const complete = phaseData
              ? isAgent
                ? isAgentPhaseComplete(i, phaseData as PhaseData)
                : isCli
                  ? isCliPhaseComplete(i, phaseData as PhaseData)
                  : isLegacyPhaseComplete(
                      i,
                      phaseData[dataKey as keyof typeof phaseData],
                    )
              : false;
            const active = currentPhase === i;

            return (
              <button
                key={i}
                ref={(node) => {
                  expandedItemRefs.current[i] = node;
                }}
                onClick={() => onPhaseChange(i)}
                className={cn(
                  "relative z-10 flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
                  active
                    ? "font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4 shrink-0" />
                <span className="flex-1 truncate text-left">{finalLabel}</span>
                {!complete && !active && (
                  <AlertCircle className="size-3.5 shrink-0 text-amber-600 dark:text-amber-400" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
