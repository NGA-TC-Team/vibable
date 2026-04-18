"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { createEmptyBoard } from "@/lib/idea-note/defaults";
import { buildOnboardingBoard } from "@/lib/idea-note/onboarding";
import type { IdeaNoteBoard } from "@/types/idea-note";

export const ideaBoardKeys = {
  all: ["ideaBoards"] as const,
  list: (projectId: string) => ["ideaBoards", projectId] as const,
  children: (projectId: string, parentBoardId: string | null) =>
    ["ideaBoards", projectId, "children", parentBoardId ?? "root"] as const,
  detail: (boardId: string) => ["ideaBoard", boardId] as const,
};

export function useIdeaBoards(projectId: string) {
  return useQuery({
    queryKey: ideaBoardKeys.list(projectId),
    queryFn: async () => {
      const boards = await db.ideaBoards
        .where("projectId")
        .equals(projectId)
        .toArray();
      return boards.sort((a, b) => b.updatedAt - a.updatedAt);
    },
    enabled: !!projectId,
  });
}

export function useIdeaBoard(boardId: string | null) {
  return useQuery({
    queryKey: boardId
      ? ideaBoardKeys.detail(boardId)
      : ["ideaBoard", "null"],
    queryFn: async () => (boardId ? (await db.ideaBoards.get(boardId)) ?? null : null),
    enabled: !!boardId,
  });
}

export function useChildBoards(
  projectId: string,
  parentBoardId: string | null,
) {
  return useQuery({
    queryKey: ideaBoardKeys.children(projectId, parentBoardId),
    queryFn: async () => {
      const all = await db.ideaBoards
        .where("projectId")
        .equals(projectId)
        .toArray();
      return all.filter((b) => b.parentBoardId === parentBoardId);
    },
    enabled: !!projectId,
  });
}

/** 루트 보드가 있으면 반환, 없으면 만들어서 반환한다. */
export async function ensureRootBoardFor(
  projectId: string,
  projectName: string,
): Promise<IdeaNoteBoard> {
  const all = await db.ideaBoards
    .where("projectId")
    .equals(projectId)
    .toArray();
  const existing = all.find((b) => b.parentBoardId === null);
  if (existing) return existing;

  const { board, assets } = await buildOnboardingBoard(projectId, projectName);
  await db.transaction(
    "rw",
    db.ideaBoards,
    db.ideaAssets,
    db.projects,
    async () => {
      await db.ideaBoards.add(board);
      if (assets.length) await db.ideaAssets.bulkAdd(assets);
      await db.projects.update(projectId, {
        ideaNoteRootBoardId: board.id,
        updatedAt: Date.now(),
      });
    },
  );
  return board;
}

export function useCreateChildBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      projectId: string;
      parentBoardId: string;
      name: string;
    }) => {
      const board = createEmptyBoard(
        input.projectId,
        input.name,
        input.parentBoardId,
      );
      await db.ideaBoards.add(board);
      return board;
    },
    onSuccess: (board) => {
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.list(board.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.children(board.projectId, board.parentBoardId),
      });
    },
  });
}

/** 루트 레벨 "페이지" 보드 생성 (parentBoardId === null) */
export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { projectId: string; name: string }) => {
      const board = createEmptyBoard(input.projectId, input.name, null);
      await db.ideaBoards.add(board);
      return board;
    },
    onSuccess: (board) => {
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.list(board.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.children(board.projectId, null),
      });
    },
  });
}

export function useRenameBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { boardId: string; name: string }) => {
      await db.ideaBoards.update(input.boardId, {
        name: input.name,
        updatedAt: Date.now(),
      });
      return input.boardId;
    },
    onSuccess: async (boardId) => {
      const board = await db.ideaBoards.get(boardId);
      if (!board) return;
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.list(board.projectId),
      });
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.children(board.projectId, board.parentBoardId),
      });
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.detail(boardId),
      });
    },
  });
}

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (boardId: string) => {
      const board = await db.ideaBoards.get(boardId);
      if (!board) return null;
      // 재귀적으로 자식 보드 삭제
      const allProjectBoards = await db.ideaBoards
        .where("projectId")
        .equals(board.projectId)
        .toArray();
      const toDelete = new Set<string>([boardId]);
      const queue = [boardId];
      while (queue.length) {
        const current = queue.pop()!;
        const children = allProjectBoards.filter(
          (b) => b.parentBoardId === current,
        );
        for (const child of children) {
          if (!toDelete.has(child.id)) {
            toDelete.add(child.id);
            queue.push(child.id);
          }
        }
      }
      await db.ideaBoards.bulkDelete(Array.from(toDelete));
      return board;
    },
    onSuccess: (board) => {
      if (!board) return;
      queryClient.invalidateQueries({
        queryKey: ideaBoardKeys.list(board.projectId),
      });
    },
  });
}
