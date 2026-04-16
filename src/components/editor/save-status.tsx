"use client";

import { Check, AlertTriangle, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { useEditorStore } from "@/services/store/editor-store";

export function SaveStatus() {
  const saveStatus = useEditorStore((s) => s.saveStatus);
  const lastSavedAt = useEditorStore((s) => s.lastSavedAt);

  if (saveStatus === "saving") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" />
        저장 중...
      </span>
    );
  }

  if (saveStatus === "error") {
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <AlertTriangle className="size-3.5" />
        저장 실패
      </span>
    );
  }

  if (saveStatus === "saved" && lastSavedAt) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Check className="size-3.5" />
        {formatDistanceToNow(lastSavedAt, {
          addSuffix: true,
          locale: ko,
        })}{" "}
        저장됨
      </span>
    );
  }

  return null;
}
