"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/db";
import { useIdeaNoteStore } from "@/services/store/idea-note-store";

const DEBOUNCE_MS = 400;

/**
 * idea-note-store.board 상태를 debounce 후 Dexie에 저장한다.
 * 부모 보드의 cardCount/fileCount 캐시도 함께 갱신.
 */
export function useIdeaNoteAutoSave(boardId: string | null) {
  const board = useIdeaNoteStore((s) => s.board);
  const setSaveStatus = useIdeaNoteStore((s) => s.setSaveStatus);
  const setLastSavedAt = useIdeaNoteStore((s) => s.setLastSavedAt);

  const firstRun = useRef(true);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    if (!board || !boardId || board.id !== boardId) return;
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }

    setSaveStatus("saving");
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(async () => {
      try {
        await db.ideaBoards.put({ ...board, updatedAt: Date.now() });

        // 부모 보드의 cardCount / fileCount 캐시 갱신
        if (board.parentBoardId) {
          const parent = await db.ideaBoards.get(board.parentBoardId);
          if (parent) {
            const parentNodes = parent.nodes.map((n) => {
              if (n.type !== "board") return n;
              if (n.data.childBoardId !== board.id) return n;
              const cardCount = board.nodes.length;
              const fileCount = board.nodes.filter(
                (nn) => nn.type === "image" || nn.type === "file" || nn.type === "video",
              ).length;
              return { ...n, data: { ...n.data, cardCount, fileCount } };
            });
            await db.ideaBoards.update(parent.id, {
              nodes: parentNodes,
              updatedAt: Date.now(),
            });
          }
        }

        setSaveStatus("saved");
        setLastSavedAt(Date.now());
      } catch {
        setSaveStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [board, boardId, setSaveStatus, setLastSavedAt]);
}
