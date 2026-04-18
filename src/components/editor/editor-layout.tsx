"use client";

import Link from "next/link";
import { ArrowLeft, Clipboard, FileDown, FileText, Printer, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { VibableLogo } from "@/components/vibable-logo";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { PhaseNav } from "./phase-nav";
import { PreviewPanel } from "./preview-panel";
import { FormPanel } from "./form-panel";
import { SaveStatus } from "./save-status";
import { MemoModal } from "./memo-modal";
import { SidebarMeteor } from "./sidebar-meteor";
import { ExportButtons } from "@/components/export/export-buttons";
import { ShareButton } from "./share-button";
import { useEditorStore } from "@/services/store/editor-store";
import { useExport } from "@/hooks/use-export.hook";
import { useMeteorEnabled } from "@/hooks/use-meteor-enabled.hook";
import { cn } from "@/lib/utils";
import { getPhaseExportScope } from "@/lib/export-phase-scope";
import type { PhaseMarkdownExportKey } from "@/components/export/phase-md-generator";
import type { Project } from "@/types/phases";

interface EditorLayoutProps {
  project: Project;
  onPhaseChange: (phase: number) => void;
}

export function EditorLayout({ project, onPhaseChange }: EditorLayoutProps) {
  const isReadOnly = useEditorStore((s) => s.isReadOnly);
  const isSidebarCollapsed = useEditorStore((s) => s.isSidebarCollapsed);
  const setPrintPreview = useEditorStore((s) => s.setPrintPreview);
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const { exportPhaseMarkdown } = useExport();
  const { enabled: meteorEnabled, toggle: toggleMeteor } = useMeteorEnabled();
  const currentPhaseKey = getPhaseExportScope(project, currentPhase);
  const canExportMarkdown = project.type === "agent" || currentPhase !== 4;

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center gap-2 border-b px-6 py-3.5 sm:px-8 sm:py-4">
        <Link
          href="/workspace"
          className="flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2"
        >
          <VibableLogo width={24} height={24} />
          <span className="hidden text-sm font-semibold sm:inline">Vibable</span>
          <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
            Powered By NGA
          </span>
        </Link>

        <div className="h-5 w-px shrink-0 bg-border" />

        <Button variant="ghost" size="sm" asChild>
          <Link href="/workspace">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">워크스페이스</span>
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <span className="font-medium">{project.name}</span>
          {isReadOnly && (
            <Badge variant="secondary">읽기 전용</Badge>
          )}
        </div>

        <SaveStatus />

        <div className="ml-auto flex items-center gap-2">
          {!isReadOnly && <ShareButton project={project} />}
          <ExportButtons project={project} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={isSidebarCollapsed ? "relative hidden w-14 shrink-0 overflow-hidden border-r p-3 transition-all md:block" : "relative hidden w-48 shrink-0 overflow-hidden border-r p-3 transition-all md:block"}>
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex-1 min-h-0">
              <PhaseNav
                projectType={project.type}
                onPhaseChange={onPhaseChange}
              />
            </div>
            <div
              className={cn(
                "flex shrink-0 pt-2",
                isSidebarCollapsed ? "justify-center" : "justify-end",
              )}
            >
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={toggleMeteor}
                      aria-pressed={meteorEnabled}
                      aria-label={
                        meteorEnabled ? "메테오 애니메이션 끄기" : "메테오 애니메이션 켜기"
                      }
                    >
                      <Stars
                        className={cn(
                          "size-4 transition-colors",
                          meteorEnabled ? "text-cyan-500" : "text-muted-foreground/50",
                        )}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {meteorEnabled ? "메테오 끄기" : "메테오 켜기"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
          {meteorEnabled && <SidebarMeteor collapsed={isSidebarCollapsed} />}
        </aside>

        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={30}>
            <div className="flex h-full flex-col bg-muted/40">
              {!isReadOnly && (
                <div className="flex items-center gap-2 border-b px-4 py-2">
                  <MemoModal />
                  {canExportMarkdown ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="gap-1.5 ml-auto">
                          <FileText className="size-3.5" />
                          마크다운 내보내기
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onSelect={() =>
                            exportPhaseMarkdown(
                              project,
                              currentPhaseKey as PhaseMarkdownExportKey,
                              "copy",
                            )
                          }
                        >
                          <Clipboard className="size-4" />
                          클립보드로 복사
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onSelect={() =>
                            exportPhaseMarkdown(
                              project,
                              currentPhaseKey as PhaseMarkdownExportKey,
                              "download",
                            )
                          }
                        >
                          <FileDown className="size-4" />
                          .md 파일 다운로드
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : null}
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setPrintPreview(true)}
                  >
                    <Printer className="size-3.5" />
                    출력 미리보기
                  </Button>
                </div>
              )}
              <div className="flex-1 overflow-hidden">
                <PreviewPanel />
              </div>
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={35} minSize={25}>
            <FormPanel />
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
