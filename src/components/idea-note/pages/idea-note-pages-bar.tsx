"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  ideaBoardKeys,
  useChildBoards,
  useCreatePage,
  useDeleteBoard,
  useRenameBoard,
} from "@/hooks/use-idea-note.hook";
import { useProject } from "@/hooks/use-project.hook";
import { createOnboardingPage } from "@/lib/idea-note/onboarding";
import { cn } from "@/lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Props {
  projectId: string;
  currentBoardId: string;
}

export function IdeaNotePagesBar({ projectId, currentBoardId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: project } = useProject(projectId);
  const { data: pages } = useChildBoards(projectId, null);
  const createPage = useCreatePage();
  const renameBoard = useRenameBoard();
  const deleteBoard = useDeleteBoard();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const pageList = (pages ?? []).sort((a, b) => a.createdAt - b.createdAt);

  const handleAdd = async () => {
    const page = await createPage.mutateAsync({
      projectId,
      name: `페이지 ${pageList.length + 1}`,
    });
    router.push(`/workspace/${projectId}/idea-note/${page.id}`);
  };

  const startRename = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };
  const commitRename = async () => {
    if (!editingId) return;
    const name = editingName.trim();
    if (name) {
      await renameBoard.mutateAsync({ boardId: editingId, name });
    }
    setEditingId(null);
    setEditingName("");
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    const nextBoard = pageList.find((p) => p.id !== deletingId);
    await deleteBoard.mutateAsync(deletingId);

    if (!nextBoard) {
      // 마지막 페이지를 삭제한 상황 — 새 온보딩 페이지 생성 후 이동
      const fallbackName = project?.name ?? "Project";
      const onboardingPage = await createOnboardingPage(
        projectId,
        fallbackName,
      );
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.list(projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.children(projectId, null),
      });
      router.replace(
        `/workspace/${projectId}/idea-note/${onboardingPage.id}`,
      );
    } else if (deletingId === currentBoardId) {
      router.replace(`/workspace/${projectId}/idea-note/${nextBoard.id}`);
    }
    setDeletingId(null);
  };

  return (
    <>
      <div className="flex h-10 shrink-0 items-center gap-0.5 overflow-x-auto border-t bg-card/70 px-2 backdrop-blur">
        {pageList.map((page) => {
          const isActive = page.id === currentBoardId;
          const isEditing = editingId === page.id;

          return (
            <ContextMenu key={page.id}>
              <ContextMenuTrigger asChild>
                <div
                  className={cn(
                    "group relative flex h-8 shrink-0 items-center gap-1 rounded-md px-2.5 text-xs transition-colors",
                    isActive
                      ? "bg-background font-medium shadow-sm"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
                  )}
                  onDoubleClick={() => startRename(page.id, page.name)}
                >
                  {isEditing ? (
                    <input
                      autoFocus
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onBlur={commitRename}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename();
                        if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingName("");
                        }
                      }}
                      className="bg-transparent outline-none"
                    />
                  ) : (
                    <Link
                      href={`/workspace/${projectId}/idea-note/${page.id}`}
                      className="px-1"
                    >
                      {page.name || "이름 없음"}
                    </Link>
                  )}
                </div>
              </ContextMenuTrigger>
              <ContextMenuContent>
                <ContextMenuItem
                  onSelect={() => startRename(page.id, page.name)}
                >
                  <Pencil className="size-3.5" /> 이름 변경
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem
                  onSelect={() => setDeletingId(page.id)}
                  variant="destructive"
                >
                  <Trash2 className="size-3.5" /> 페이지 삭제
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          );
        })}
        <button
          type="button"
          onClick={handleAdd}
          disabled={createPage.isPending}
          aria-label="페이지 추가"
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/60 hover:text-foreground disabled:opacity-50"
        >
          <Plus className="size-4" />
        </button>
      </div>

      <AlertDialog
        open={!!deletingId}
        onOpenChange={(v) => !v && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>페이지 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 페이지와 하위 보드·노드가 모두 삭제됩니다. 되돌릴 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
