"use client";

import { Download, FileJson, FileText, FileType } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useExport } from "@/hooks/use-export.hook";
import { useEditorStore } from "@/services/store/editor-store";
import { PHASE_KEYS, PHASE_LABELS, type Project } from "@/types/phases";

interface ExportButtonsProps {
  project: Project;
  onFlushSave?: () => void;
}

export function ExportButtons({ project, onFlushSave }: ExportButtonsProps) {
  const { exportJson, exportDesignMd, exportPdf } = useExport();
  const currentPhase = useEditorStore((s) => s.currentPhase);

  const handleExport = (fn: () => void) => {
    onFlushSave?.();
    fn();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="default" size="sm" className="gap-1.5 shadow-sm">
          <Download className="size-4" />
          <span className="hidden sm:inline">내보내기</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => handleExport(() => exportJson(project, "full"))}
        >
          <FileJson className="size-4" />
          JSON 전체
        </DropdownMenuItem>
        <DropdownMenuItem
          onSelect={() =>
            handleExport(() =>
              exportJson(project, PHASE_KEYS[currentPhase]),
            )
          }
        >
          <FileJson className="size-4" />
          JSON — {PHASE_LABELS[currentPhase]}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {project.type !== "cli" && (
          <DropdownMenuItem
            onSelect={() => handleExport(() => exportDesignMd(project))}
          >
            <FileText className="size-4" />
            DESIGN.md
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onSelect={() => handleExport(() => exportPdf(project))}
        >
          <FileType className="size-4" />
          PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
