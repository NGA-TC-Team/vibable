"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { ReactFlowProvider } from "@xyflow/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useProject } from "@/hooks/use-project.hook";
import {
  ideaBoardKeys,
  useIdeaBoard,
  ensureRootBoardFor,
} from "@/hooks/use-idea-note.hook";
import {
  countTotalNodesInProject,
  seedOnboardingIntoBoard,
} from "@/lib/idea-note/onboarding";
import { useIdeaNoteAutoSave } from "@/hooks/use-idea-note-autosave.hook";
import { useIdeaNoteShortcuts } from "@/hooks/use-idea-note-shortcuts.hook";
import { useStorageQuota } from "@/hooks/use-storage-quota.hook";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";
import { IdeaNoteCanvas } from "@/components/idea-note/idea-note-canvas";
import { IdeaNoteToolbar } from "@/components/idea-note/toolbar/idea-note-toolbar";
import { IdeaNoteTopbar } from "@/components/idea-note/topbar/idea-note-topbar";
import { IdeaNoteInspector } from "@/components/idea-note/inspector/idea-note-inspector";
import { IdeaNotePagesBar } from "@/components/idea-note/pages/idea-note-pages-bar";
import { exportBoardJson, exportProjectBundle } from "@/lib/idea-note/export-bundle";
import { downloadBlob, exportFilenameTimestamp } from "@/lib/download";

interface Props {
  projectId: string;
  boardId: string;
}

export function IdeaNoteClient({ projectId, boardId }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: board, isLoading: boardLoading } = useIdeaBoard(boardId);

  const setBoard = useIdeaNoteStore((s) => s.setBoard);
  const setCurrentBoardId = useIdeaNoteStore((s) => s.setCurrentBoardId);
  const setProjectIdStore = useIdeaNoteStore((s) => s.setProjectId);
  const resetStore = useIdeaNoteStore((s) => s.reset);
  const saveStatus = useIdeaNoteStore((s) => s.saveStatus);
  const activeTool = useIdeaNoteStore((s) => s.activeTool);

  useIdeaNoteAutoSave(boardId);
  useIdeaNoteShortcuts();
  const quota = useStorageQuota();

  // 프로젝트/보드 변경 시 store 초기화
  useEffect(() => {
    setProjectIdStore(projectId);
    setCurrentBoardId(boardId);
    return () => {
      resetStore();
    };
  }, [projectId, boardId, setProjectIdStore, setCurrentBoardId, resetStore]);

  // 보드 로드 시 store에 주입 (Dexie가 원천, store는 편집 세션 상태)
  useEffect(() => {
    if (board) setBoard(board);
  }, [board, setBoard]);

  // 프로젝트에 루트 보드가 없으면 생성 후 리다이렉트
  useEffect(() => {
    if (!project) return;
    if (project.ideaNoteRootBoardId) return;
    (async () => {
      const root = await ensureRootBoardFor(projectId, project.name);
      if (root.id !== boardId) {
        router.replace(`/workspace/${projectId}/idea-note/${root.id}`);
      }
    })();
  }, [project, projectId, boardId, router]);

  // 프로젝트 전체가 빈 상태이면 현재 페이지에 온보딩을 다시 시드한다.
  // - 현재 보드가 루트 페이지이고 노드가 0개
  // - 프로젝트의 모든 보드 노드 합계도 0
  // 이 조건에서만 발동해 사용자의 의도적 빈 캔버스를 덮어쓰지 않는다.
  const reseedingRef = useRef(false);
  useEffect(() => {
    if (!project || !board) return;
    if (board.parentBoardId !== null) return;
    if (board.nodes.length > 0 || board.edges.length > 0) return;
    if (reseedingRef.current) return;

    reseedingRef.current = true;
    (async () => {
      try {
        const total = await countTotalNodesInProject(projectId);
        if (total > 0) return; // 다른 페이지에 콘텐츠가 있음
        await seedOnboardingIntoBoard(board, project.name);
        queryClient.invalidateQueries({
          queryKey: ideaBoardKeys.detail(board.id),
        });
        queryClient.invalidateQueries({
          queryKey: ideaBoardKeys.list(projectId),
        });
      } finally {
        reseedingRef.current = false;
      }
    })();
  }, [board, project, projectId, queryClient]);

  // quota 경고
  useEffect(() => {
    if (quota.supported && quota.usageRatio > 0.9) {
      toast.warning(
        `저장 공간을 ${(quota.usageRatio * 100).toFixed(0)}% 사용했습니다. 자산 정리를 권장합니다.`,
        { id: "idea-note-quota" },
      );
    }
  }, [quota]);

  const handleExportJson = async () => {
    if (!board) return;
    const blob = await exportBoardJson(board.id);
    downloadBlob(blob, `${board.name}-${exportFilenameTimestamp()}.json`);
  };

  const handleExportBundle = async () => {
    if (!project) return;
    const blob = await exportProjectBundle(project.id);
    downloadBlob(blob, `${project.name}-${exportFilenameTimestamp()}.vbn`);
  };

  const handleExportPng = async () => {
    // 간단한 PNG 내보내기: 캔버스 DOM 요소를 SVG로 직렬화한 뒤
    // canvas 래스터라이즈. xyflow Pro의 toPng 미사용.
    const viewport = document.querySelector<HTMLElement>(
      ".react-flow__viewport",
    );
    if (!viewport) {
      toast.error("렌더 영역을 찾을 수 없습니다");
      return;
    }
    try {
      const rect = viewport.getBoundingClientRect();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.ceil(rect.width)}" height="${Math.ceil(rect.height)}"><foreignObject width="100%" height="100%">${new XMLSerializer().serializeToString(viewport)}</foreignObject></svg>`;
      const blob = new Blob([svg], { type: "image/svg+xml" });
      downloadBlob(
        blob,
        `${board?.name ?? "board"}-${exportFilenameTimestamp()}.svg`,
      );
      toast.info("SVG로 내보냈습니다 (PNG 변환은 추후 지원)");
    } catch {
      toast.error("내보내기에 실패했습니다");
    }
  };

  if (projectLoading || boardLoading || !project || !board) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <IdeaNoteTopbar
        projectId={projectId}
        projectName={project.name}
        boardName={board.name}
        onExportJson={handleExportJson}
        onExportBundle={handleExportBundle}
        onExportPng={handleExportPng}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex shrink-0 flex-col">
          <IdeaNoteToolbar />
        </div>

        <div className="relative flex-1">
          <ReactFlowProvider>
            <IdeaNoteCanvas projectId={projectId} boardId={boardId} />
          </ReactFlowProvider>
          <div className="pointer-events-none absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-background/80 px-3 py-1 text-[10px] text-muted-foreground shadow-sm backdrop-blur">
            {activeTool === "select"
              ? saveStatus === "saving"
                ? "저장 중…"
                : saveStatus === "saved"
                  ? "저장됨"
                  : "선택 모드"
              : `${activeTool} 모드 — 캔버스를 클릭하여 추가`}
          </div>
        </div>

        <IdeaNoteInspector />
      </div>

      {board.parentBoardId === null && (
        <IdeaNotePagesBar projectId={projectId} currentBoardId={boardId} />
      )}
    </div>
  );
}
