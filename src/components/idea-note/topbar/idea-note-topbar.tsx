"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  FileDown,
  FileJson,
  Package,
  Grid3x3,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";

interface Props {
  projectId: string;
  projectName: string;
  boardName: string;
  onExportJson: () => void;
  onExportBundle: () => void;
  onExportPng: () => void;
}

export function IdeaNoteTopbar({
  projectId,
  projectName,
  boardName,
  onExportJson,
  onExportBundle,
  onExportPng,
}: Props) {
  const router = useRouter();
  const boardStack = useIdeaNoteStore((s) => s.boardStack);
  const popBoardStack = useIdeaNoteStore((s) => s.popBoardStack);
  const isGridVisible = useIdeaNoteStore((s) => s.isGridVisible);
  const snapToGrid = useIdeaNoteStore((s) => s.snapToGrid);
  const setGridVisible = useIdeaNoteStore((s) => s.setGridVisible);
  const setSnapToGrid = useIdeaNoteStore((s) => s.setSnapToGrid);

  return (
    <div className="flex items-center gap-2 border-b bg-card/80 px-3 py-2 backdrop-blur">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/workspace/${projectId}`}>
          <ArrowLeft className="size-4" />
          <span className="hidden sm:inline">에디터로</span>
        </Link>
      </Button>

      <div className="mx-2 flex items-center gap-1 overflow-hidden text-sm">
        <Link
          href="/workspace"
          className="text-muted-foreground hover:text-foreground"
        >
          Home
        </Link>
        <ChevronRight className="size-3 text-muted-foreground" />
        <Link
          href={`/workspace/${projectId}`}
          className="max-w-[160px] truncate text-muted-foreground hover:text-foreground"
        >
          {projectName}
        </Link>
        <ChevronRight className="size-3 text-muted-foreground" />
        {boardStack.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => {
                const parent = boardStack[boardStack.length - 2];
                if (!parent) return;
                popBoardStack();
                router.push(
                  `/workspace/${projectId}/idea-note/${parent.id}`,
                );
              }}
              className="max-w-[120px] truncate text-muted-foreground hover:text-foreground"
            >
              {boardStack[boardStack.length - 2]?.name}
            </button>
            <ChevronRight className="size-3 text-muted-foreground" />
          </>
        )}
        <span className="max-w-[200px] truncate font-medium">{boardName}</span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <LayoutGrid className="size-3.5" />
              보기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>캔버스 보기</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={isGridVisible}
              onCheckedChange={setGridVisible}
            >
              <Grid3x3 className="size-4" /> 그리드 표시
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={snapToGrid}
              onCheckedChange={setSnapToGrid}
            >
              그리드 스냅
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <FileDown className="size-3.5" />
              내보내기
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={onExportJson}>
              <FileJson className="size-4" />
              현재 보드 JSON
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onExportPng}>
              <FileDown className="size-4" />
              현재 보드 PNG
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onExportBundle}>
              <Package className="size-4" />
              전체 번들 .vbn
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
