"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  AtSign,
  MessageSquarePlus,
  Plus,
  StickyNote,
  Trash2,
  X,
} from "lucide-react";
import ReactMarkdown, { type Components as MarkdownComponents } from "react-markdown";
import remarkGfm from "remark-gfm";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useEditorStore } from "@/services/store/editor-store";
import { resolveElementLabel } from "@/lib/mockup-element-label";
import { ELEMENT_LABELS } from "@/components/preview/mockup/mockup-element";
import type {
  Memo,
  MemoMention,
  MockupElement,
  ScreenPage,
} from "@/types/phases";

interface ElementOption {
  id: string;
  label: string;
  typeLabel: string;
}

function getAllMockupElements(page: ScreenPage): MockupElement[] {
  const seen = new Set<string>();
  const viewports = ["mobile", "tablet", "desktop"] as const;
  const states = ["idle", "loading", "offline", "error"] as const;
  const sources = [
    ...viewports.flatMap((vp) => page.mockup?.[vp] ?? []),
    ...states.flatMap((state) =>
      viewports.flatMap((vp) => page.mockupByState?.[state]?.[vp] ?? []),
    ),
  ];
  return sources.filter((element) => {
    if (seen.has(element.id)) return false;
    seen.add(element.id);
    return true;
  });
}

function getElementOptions(page: ScreenPage | undefined): ElementOption[] {
  if (!page) return [];
  const typeCount = new Map<string, number>();
  return getAllMockupElements(page).map((el) => {
    const next = (typeCount.get(el.type) ?? 0) + 1;
    typeCount.set(el.type, next);
    const resolved = resolveElementLabel(el, next, ELEMENT_LABELS);
    return {
      id: el.id,
      label: resolved.label,
      typeLabel: resolved.typeLabel,
    };
  });
}

const MARKDOWN_COMPONENTS: MarkdownComponents = {
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline underline-offset-2 hover:text-primary/80"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="list-disc space-y-0.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="list-decimal space-y-0.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  code: ({ children, className }) => {
    const inline = !className;
    if (inline) {
      return (
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[12px]">
          {children}
        </code>
      );
    }
    return (
      <code className="block rounded bg-muted p-2 font-mono text-[12px] leading-relaxed">
        {children}
      </code>
    );
  },
  p: ({ children }) => <p className="leading-relaxed">{children}</p>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-2 border-border pl-3 text-muted-foreground">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => <h3 className="text-base font-semibold">{children}</h3>,
  h2: ({ children }) => <h4 className="text-sm font-semibold">{children}</h4>,
  h3: ({ children }) => <h5 className="text-sm font-medium">{children}</h5>,
};

function MarkdownView({ content }: { content: string }) {
  if (!content.trim()) {
    return (
      <p className="italic text-muted-foreground">메모 본문을 입력하세요...</p>
    );
  }
  return (
    <div className="prose-sm space-y-2 text-sm leading-relaxed text-foreground">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={MARKDOWN_COMPONENTS}>
        {content}
      </ReactMarkdown>
    </div>
  );
}

export function MemoModal() {
  const currentPhase = useEditorStore((s) => s.currentPhase);
  const phaseData = useEditorStore((s) => s.phaseData);
  const updatePhaseData = useEditorStore((s) => s.updatePhaseData);
  const activeScreenPageId = useEditorStore((s) => s.activeScreenPageId);

  const memos: Memo[] = phaseData?.memos[currentPhase] ?? [];

  const screenDesignPage = useMemo<ScreenPage | undefined>(() => {
    if (currentPhase !== 4) return undefined;
    const pages = phaseData?.screenDesign.pages ?? [];
    return pages.find((p) => p.id === activeScreenPageId) ?? pages[0];
  }, [activeScreenPageId, currentPhase, phaseData?.screenDesign.pages]);

  const elementOptions = useMemo(
    () => getElementOptions(screenDesignPage),
    [screenDesignPage],
  );
  const mentionSupported = currentPhase === 4 && elementOptions.length > 0;

  const rootMemos = useMemo(() => memos.filter((m) => !m.parentId), [memos]);
  const repliesByRoot = useMemo(() => {
    const map = new Map<string, Memo[]>();
    memos
      .filter((m) => m.parentId)
      .forEach((m) => {
        const arr = map.get(m.parentId!) ?? [];
        arr.push(m);
        map.set(m.parentId!, arr);
      });
    for (const list of map.values()) {
      list.sort((a, b) => a.createdAt - b.createdAt);
    }
    return map;
  }, [memos]);

  const setMemos = (next: Memo[]) => {
    updatePhaseData((prev) => ({
      ...prev,
      memos: { ...prev.memos, [currentPhase]: next },
    }));
  };

  const addRootMemo = () => {
    const now = Date.now();
    const newMemo: Memo = {
      id: crypto.randomUUID(),
      content: "",
      createdAt: now,
      updatedAt: now,
    };
    setMemos([newMemo, ...memos]);
  };

  const addReply = (rootId: string) => {
    const now = Date.now();
    const reply: Memo = {
      id: crypto.randomUUID(),
      content: "",
      createdAt: now,
      updatedAt: now,
      parentId: rootId,
    };
    setMemos([...memos, reply]);
  };

  const updateMemo = (id: string, patch: Partial<Memo>) => {
    setMemos(
      memos.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: Date.now() } : m,
      ),
    );
  };

  const deleteRoot = (id: string) => {
    setMemos(memos.filter((m) => m.id !== id && m.parentId !== id));
  };

  const deleteReply = (id: string) => {
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>메모</DialogTitle>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="outline" size="sm" onClick={addRootMemo}>
            <Plus className="size-3.5" />새 메모
          </Button>
        </div>
        <ScrollArea className="max-h-[70vh] pr-2">
          {rootMemos.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              이 페이즈에 메모가 없습니다
            </p>
          ) : (
            <div className="space-y-4">
              {rootMemos.map((root) => (
                <MemoThread
                  key={root.id}
                  root={root}
                  replies={repliesByRoot.get(root.id) ?? []}
                  elementOptions={elementOptions}
                  mentionSupported={mentionSupported}
                  onUpdate={updateMemo}
                  onAddReply={addReply}
                  onDeleteRoot={deleteRoot}
                  onDeleteReply={deleteReply}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function MemoThread({
  root,
  replies,
  elementOptions,
  mentionSupported,
  onUpdate,
  onAddReply,
  onDeleteRoot,
  onDeleteReply,
}: {
  root: Memo;
  replies: Memo[];
  elementOptions: ElementOption[];
  mentionSupported: boolean;
  onUpdate: (id: string, patch: Partial<Memo>) => void;
  onAddReply: (rootId: string) => void;
  onDeleteRoot: (id: string) => void;
  onDeleteReply: (id: string) => void;
}) {
  const handleAddMention = (option: ElementOption) => {
    const existing = root.mentions ?? [];
    if (existing.some((m) => m.elementId === option.id)) return;
    onUpdate(root.id, {
      mentions: [...existing, { elementId: option.id, label: option.label }],
    });
  };

  const handleRemoveMention = (elementId: string) => {
    onUpdate(root.id, {
      mentions: (root.mentions ?? []).filter((m) => m.elementId !== elementId),
    });
  };

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <MemoBody
        memo={root}
        onUpdate={(content) => onUpdate(root.id, { content })}
        onDelete={() => onDeleteRoot(root.id)}
      />

      {mentionSupported || (root.mentions?.length ?? 0) > 0 ? (
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {(root.mentions ?? []).map((mention) => (
            <span
              key={mention.elementId}
              className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
            >
              <AtSign className="size-3" />
              {mention.label}
              <button
                type="button"
                onClick={() => handleRemoveMention(mention.elementId)}
                className="ml-0.5 rounded-full text-primary/80 hover:bg-primary/20 hover:text-primary"
                aria-label="멘션 제거"
              >
                <X className="size-3" />
              </button>
            </span>
          ))}
          {mentionSupported ? (
            <MentionPicker
              elementOptions={elementOptions}
              existingIds={(root.mentions ?? []).map((m) => m.elementId)}
              onPick={handleAddMention}
            />
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 border-t pt-3">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-medium text-muted-foreground">
            답글 {replies.length > 0 ? replies.length : ""}
          </span>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onAddReply(root.id)}
            className="gap-1"
          >
            <MessageSquarePlus className="size-3.5" />
            답글 달기
          </Button>
        </div>
        {replies.length > 0 ? (
          <div className="space-y-3 border-l-2 border-border/60 pl-4">
            {replies.map((reply) => (
              <div key={reply.id} className="rounded-lg border bg-background p-4">
                <MemoBody
                  memo={reply}
                  onUpdate={(content) => onUpdate(reply.id, { content })}
                  onDelete={() => onDeleteReply(reply.id)}
                />
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

function MemoBody({
  memo,
  onUpdate,
  onDelete,
}: {
  memo: Memo;
  onUpdate: (content: string) => void;
  onDelete: () => void;
}) {
  const isEmpty = !memo.content.trim();
  const [editing, setEditing] = useState(isEmpty);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      const t = window.setTimeout(() => textareaRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [editing]);

  return (
    <div className="space-y-2">
      {editing ? (
        <Textarea
          ref={textareaRef}
          value={memo.content}
          onChange={(e) => onUpdate(e.target.value)}
          onBlur={() => {
            if (memo.content.trim()) setEditing(false);
          }}
          placeholder="메모를 입력하세요... (마크다운 지원: **굵게**, *기울임*, `코드`, - 목록, [링크](url))"
          rows={4}
          className="min-h-[96px] resize-y p-3 text-sm leading-relaxed"
        />
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => setEditing(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setEditing(true);
            }
          }}
          className="cursor-text rounded-md px-3 py-2 transition hover:bg-muted/40"
        >
          <MarkdownView content={memo.content} />
        </div>
      )}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(memo.createdAt, { addSuffix: true, locale: ko })}
        </span>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          className="text-muted-foreground hover:text-destructive"
          aria-label="삭제"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

function MentionPicker({
  elementOptions,
  existingIds,
  onPick,
}: {
  elementOptions: ElementOption[];
  existingIds: string[];
  onPick: (option: ElementOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const availableOptions = elementOptions.filter(
    (option) => !existingIds.includes(option.id),
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="xs"
          className="gap-1 text-[11px]"
          disabled={availableOptions.length === 0}
        >
          <AtSign className="size-3" />
          UI 요소 언급
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">
        <Command>
          <CommandInput placeholder="요소 검색..." className="h-9" />
          <CommandList>
            <CommandEmpty>일치하는 요소가 없습니다.</CommandEmpty>
            <CommandGroup heading="현재 화면 요소">
              {availableOptions.map((option) => (
                <CommandItem
                  key={option.id}
                  value={`${option.label} ${option.typeLabel}`}
                  onSelect={() => {
                    onPick(option);
                    setOpen(false);
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="truncate">{option.label}</span>
                  <span className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    {option.typeLabel}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
