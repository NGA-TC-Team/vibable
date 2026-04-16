"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { generateShareUrl } from "@/hooks/use-share.hook";
import { useExport } from "@/hooks/use-export.hook";
import type { Project } from "@/types/phases";

interface ShareButtonProps {
  project: Project;
  onFlushSave?: () => void;
}

export function ShareButton({ project, onFlushSave }: ShareButtonProps) {
  const [showFallback, setShowFallback] = useState(false);
  const { exportJson } = useExport();

  const handleShare = async () => {
    onFlushSave?.();

    const result = generateShareUrl(project);

    if (result.tooLarge || !result.url) {
      setShowFallback(true);
      return;
    }

    await navigator.clipboard.writeText(result.url);
    toast.success("공유 링크가 클립보드에 복사되었습니다");
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleShare} className="gap-1.5">
        <Share2 className="size-4" />
        <span className="hidden sm:inline">공유</span>
      </Button>

      <Dialog open={showFallback} onOpenChange={setShowFallback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>링크 공유 불가</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            프로젝트 크기가 커서 링크 공유가 어렵습니다. JSON 파일로 공유해
            주세요.
          </p>
          <Button
            onClick={() => {
              exportJson(project, "full");
              setShowFallback(false);
            }}
          >
            JSON 내보내기
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
