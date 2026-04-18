"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useProject } from "@/hooks/use-project.hook";
import { ensureRootBoardFor } from "@/hooks/use-idea-note.hook";

interface Props {
  projectId: string;
}

export function IdeaNoteRedirect({ projectId }: Props) {
  const router = useRouter();
  const { data: project, isLoading } = useProject(projectId);

  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    (async () => {
      const board = await ensureRootBoardFor(projectId, project.name);
      if (cancelled) return;
      router.replace(
        `/workspace/${projectId}/idea-note/${board.id}`,
      );
    })();
    return () => {
      cancelled = true;
    };
  }, [project, projectId, router]);

  if (isLoading || !project) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center text-sm text-muted-foreground">
      아이디어 노트 불러오는 중…
    </div>
  );
}
