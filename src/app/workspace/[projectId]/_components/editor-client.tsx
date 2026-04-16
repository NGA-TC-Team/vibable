"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useQueryState, parseAsInteger } from "nuqs";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EditorLayout } from "@/components/editor/editor-layout";
import { useProject } from "@/hooks/use-project.hook";
import { useAutoSave } from "@/hooks/use-auto-save.hook";
import { useEditorStore } from "@/services/store/editor-store";

interface EditorClientProps {
  projectId: string;
}

export function EditorClient({ projectId }: EditorClientProps) {
  const { data: project, isLoading, error } = useProject(projectId);
  const setPhaseData = useEditorStore((s) => s.setPhaseData);
  const setPhase = useEditorStore((s) => s.setPhase);
  const setProjectType = useEditorStore((s) => s.setProjectType);
  const reset = useEditorStore((s) => s.reset);

  const [phase, setPhaseUrl] = useQueryState(
    "phase",
    parseAsInteger.withDefault(0),
  );

  useAutoSave({ projectId, enabled: !!project });

  useEffect(() => {
    if (project) {
      setPhaseData(project.phases);
      setProjectType(project.type);
      setPhase(phase);
    }
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  useEffect(() => {
    setPhase(phase);
  }, [phase, setPhase]);

  const handlePhaseChange = (newPhase: number) => {
    setPhaseUrl(newPhase);
    setPhase(newPhase);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground">프로젝트를 찾을 수 없습니다</p>
        <Button variant="outline" asChild>
          <Link href="/workspace">
            <ArrowLeft className="size-4" />
            워크스페이스로 돌아가기
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <EditorLayout project={project} onPhaseChange={handlePhaseChange} />
  );
}
