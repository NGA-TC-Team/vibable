"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { ExportButtons } from "@/components/export/export-buttons";
import { ShareButton } from "./share-button";
import { useEditorStore } from "@/services/store/editor-store";
import type { Project } from "@/types/phases";

interface EditorLayoutProps {
  project: Project;
  onPhaseChange: (phase: number) => void;
}

export function EditorLayout({ project, onPhaseChange }: EditorLayoutProps) {
  const isReadOnly = useEditorStore((s) => s.isReadOnly);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex h-12 shrink-0 items-center gap-3 border-b px-4">
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
        <aside className="hidden w-48 shrink-0 border-r p-3 md:block">
          <PhaseNav
            projectType={project.type}
            onPhaseChange={onPhaseChange}
          />
        </aside>

        <ResizablePanelGroup orientation="horizontal" className="flex-1">
          <ResizablePanel defaultSize={65} minSize={30}>
            <div className="flex h-full flex-col">
              {!isReadOnly && (
                <div className="flex items-center gap-2 border-b px-4 py-2">
                  <MemoModal />
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
