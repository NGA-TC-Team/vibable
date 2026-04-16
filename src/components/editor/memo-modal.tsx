"use client";

import { useRef, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { StickyNote, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/services/store/editor-store";
import type { Memo } from "@/types/phases";

export function MemoModal() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const phaseData = useEditorStore((s) => s.phaseData);
  const updatePhaseData = useEditorStore((s) => s.updatePhaseData);
  const newMemoRef = useRef<HTMLTextAreaElement>(null);

  const memos: Memo[] = phaseData?.memos[currentPhase] ?? [];

  const setMemos = (newMemos: Memo[]) => {
    updatePhaseData((prev) => ({
      ...prev,
      memos: { ...prev.memos, [currentPhase]: newMemos },
    }));
  };

  const addMemo = () => {
    const now = Date.now();
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    setMemos([newMemo, ...memos]);
    setTimeout(() => newMemoRef.current?.focus(), 50);
  };

  const updateMemo = (id: string, content: string) => {
    setMemos(
      memos.map((m) =>
        m.id === id ? { ...m, content, updatedAt: Date.now() } : m,
      ),
    );
  };

  const deleteMemo = (id: string) => {
    setMemos(memos.filter((m) => m.id !== id));
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <StickyNote className="size-4" />
          메모
          {memos.length > 0 && (
            <Badge variant="secondary" className="ml-0.5">
              {memos.length}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>메모</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={addMemo}>
            <Plus className="size-3.5" />
            새 메모
          </Button>
        </div>
        <ScrollArea className="max-h-[400px]">
          {memos.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              이 페이즈에 메모가 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {memos.map((memo, i) => (
                <MemoCard
                  key={memo.id}
                  memo={memo}
                  textareaRef={i === 0 ? newMemoRef : undefined}
                  onUpdate={(content) => updateMemo(memo.id, content)}
                  onDelete={() => deleteMemo(memo.id)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function MemoCard({
  memo,
  textareaRef,
  onUpdate,
  onDelete,
}: {
  memo: Memo;
  textareaRef?: React.RefObject<HTMLTextAreaElement | null>;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const finalRef = textareaRef ?? ref;

  useEffect(() => {
    if (textareaRef && finalRef.current) {
      finalRef.current.focus();
    }
  }, [textareaRef, finalRef]);

  return (
    <div className="rounded-lg border p-3 space-y-2">
      <Textarea
        ref={finalRef}
        value={memo.content}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="메모를 입력하세요..."
        rows={3}
        className="resize-none border-none p-0 shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(memo.createdAt, {
            addSuffix: true,
            locale: ko,
          })}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
